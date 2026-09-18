import request from 'supertest';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { prisma } from '../src/config/prisma';
import { env } from '../src/config/env';
import { mailService } from '../src/services/mail.service';
import { authRateLimiter } from '../src/middlewares/rate-limit.middleware';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('US04 — Recuperação Segura de Senha & Testes de Segurança (TASK-04.2, TASK-04.3, TASK-04.4)', () => {
  const TUTOR_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  const TUTOR_EMAIL = 'usuario.seguro@petagenda.com';
  const INITIAL_PASSWORD = 'SenhaAntiga@123';

  beforeEach(() => {
    jest.clearAllMocks();
    authRateLimiter.reset();
    mailService.clearSentEmails();
  });

  describe('TASK-04.2: POST /api/auth/forgot-password (Geração de Token e Envio de E-mail)', () => {
    it('deve retornar mensagem neutra e disparar e-mail com token temporizado quando o e-mail existir', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel Fernando',
        email: TUTOR_EMAIL,
        tokenVersion: 1,
      });
      (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({
        id: 'token-uuid',
        tutorId: TUTOR_ID,
        tokenHash: 'hash-mock',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: TUTOR_EMAIL });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Se o e-mail existir, você receberá instruções para redefinir sua senha.');

      // Verifica se o token foi persistido no banco com TTL de aproximadamente 30 minutos
      expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
      const createCallArg = (prisma.passwordResetToken.create as jest.Mock).mock.calls[0][0];
      expect(createCallArg.data.tutorId).toBe(TUTOR_ID);
      expect(typeof createCallArg.data.tokenHash).toBe('string');
      const timeDiffMinutes = (createCallArg.data.expiresAt.getTime() - Date.now()) / (1000 * 60);
      expect(timeDiffMinutes).toBeGreaterThan(29);
      expect(timeDiffMinutes).toBeLessThanOrEqual(30.1);

      // Verifica envio de e-mail via mailService
      const sent = mailService.getSentEmails();
      expect(sent.length).toBe(1);
      expect(sent[0].to).toBe(TUTOR_EMAIL);
      expect(sent[0].subject).toContain('Recuperação de Senha');
      expect(sent[0].text).toContain('/reset-password?token=');
    });

    it('deve retornar a mesma mensagem neutra se o e-mail não existir (Anti-Account Enumeration)', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'inexistente@petagenda.com' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Se o e-mail existir, você receberá instruções para redefinir sua senha.');

      // Não deve gerar token nem disparar e-mail
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mailService.getSentEmails().length).toBe(0);
    });

    it('deve retornar status 400 se o payload contiver e-mail inválido', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'email-invalido' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('TASK-04.3: POST /api/auth/reset-password (Atualização de Senha e Invalidação de Token)', () => {
    const rawToken = '7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    it('deve redefinir a senha com sucesso, hashear com bcrypt, invalidar o token e revogar sessões ativas', async () => {
      const novaSenha = 'NovaSenhaForte2026';

      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token-uuid-123',
        tutorId: TUTOR_ID,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // expira em 15 minutos (válido)
        usedAt: null,
      });

      (prisma.tutor.update as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        email: TUTOR_EMAIL,
        tokenVersion: 2,
      });

      (prisma.passwordResetToken.update as jest.Mock).mockResolvedValue({
        id: 'token-uuid-123',
        usedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          novaSenha,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Senha redefinida com sucesso');

      // Verifica se a senha foi hasheada com bcrypt
      const tutorUpdateArg = (prisma.tutor.update as jest.Mock).mock.calls[0][0];
      expect(tutorUpdateArg.where.id).toBe(TUTOR_ID);
      expect(tutorUpdateArg.data.senha_hash).not.toBe(novaSenha);
      const isMatch = await bcrypt.compare(novaSenha, tutorUpdateArg.data.senha_hash);
      expect(isMatch).toBe(true);

      // Verifica se o tokenVersion foi incrementado para revogar sessões
      expect(tutorUpdateArg.data.tokenVersion).toEqual({ increment: 1 });

      // Verifica se o token foi marcado como utilizado (invalidação)
      const tokenUpdateArg = (prisma.passwordResetToken.update as jest.Mock).mock.calls[0][0];
      expect(tokenUpdateArg.where.id).toBe('token-uuid-123');
      expect(tokenUpdateArg.data.usedAt).toBeInstanceOf(Date);
    });

    it('deve rejeitar tentativa de reaproveitamento de link/token já utilizado', async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token-uuid-123',
        tutorId: TUTOR_ID,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        usedAt: new Date(Date.now() - 5 * 60 * 1000), // já foi utilizado há 5 min
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          novaSenha: 'NovaSenhaForte2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('já foi utilizado');
      expect(prisma.tutor.update).not.toHaveBeenCalled();
    });

    it('deve rejeitar token expirado (pós-30 min)', async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token-uuid-123',
        tutorId: TUTOR_ID,
        tokenHash,
        expiresAt: new Date(Date.now() - 60 * 1000), // expirado há 1 minuto
        usedAt: null,
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          novaSenha: 'NovaSenhaForte2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('expirado');
      expect(prisma.tutor.update).not.toHaveBeenCalled();
    });

    it('deve rejeitar token inexistente ou inválido', async () => {
      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'token-que-nao-existe',
          novaSenha: 'NovaSenhaForte2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('inválido ou não encontrado');
    });

    it('deve validar política de força de senha (mínimo 8 dígitos, maiúscula e número)', async () => {
      // Menos de 8 caracteres
      let res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: rawToken, novaSenha: 'Ab1' });
      expect(res.status).toBe(400);

      // Sem letra maiúscula
      res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: rawToken, novaSenha: 'senhasemletramaiuscula123' });
      expect(res.status).toBe(400);

      // Sem número
      res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: rawToken, novaSenha: 'SenhaSemNumeroAqui' });
      expect(res.status).toBe(400);
    });
  });

  describe('TASK-04.4: Sessões Ativas & Revogação após Reset de Senha', () => {
    it('deve invalidar o token de sessão antigo após a alteração de senha (tokenVersion incrementada)', async () => {
      // Cria token JWT com a versão 1
      const oldSessionToken = jwt.sign(
        { tutor_id: TUTOR_ID, email: TUTOR_EMAIL, token_version: 1 },
        env.JWT_SECRET
      );

      // No banco, o tutor agora tem tokenVersion = 2 (já que resetou a senha)
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel Fernando',
        email: TUTOR_EMAIL,
        tokenVersion: 2,
        data_criacao: new Date(),
      });

      // Tenta acessar rota protegida com a sessão antiga
      const response = await request(app)
        .get('/api/tutores/me')
        .set('Authorization', `Bearer ${oldSessionToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/revogada|expirada/i);
    });
  });

  describe('TASK-04.4: Rate Limiting (Anti-Brute-Force)', () => {
    it('deve limitar requisições excessivas retornando status 429 e header Retry-After', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);

      // Envia 5 requisições normais (limite configurado)
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'rate.limit@petagenda.com' });
        expect(res.status).toBe(200);
      }

      // A 6ª requisição deve ser bloqueada por rate limit
      const blockedRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'rate.limit@petagenda.com' });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body).toHaveProperty('code', 'TOO_MANY_REQUESTS');
      expect(blockedRes.headers).toHaveProperty('retry-after');
    });
  });
});
