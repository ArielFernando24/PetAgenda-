import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('US01 — Autenticação e Cadastro de Tutor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('deve retornar status 200 e indicar que a API está online', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'PetAgenda API está online');
    });
  });

  describe('POST /api/tutores (Cadastro de Tutor)', () => {
    it('deve cadastrar um novo tutor com sucesso e retornar 201', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.tutor.create as jest.Mock).mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        nome: 'Mariana Silva',
        email: 'mariana@email.com',
        senha_hash: 'hashed_password',
        data_criacao: new Date(),
      });

      const response = await request(app).post('/api/tutores').send({
        nome: 'Mariana Silva',
        email: 'mariana@email.com',
        senha: 'senhaSegura123',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', '11111111-1111-1111-1111-111111111111');
      expect(response.body.data).toHaveProperty('nome', 'Mariana Silva');
      expect(response.body.data).toHaveProperty('email', 'mariana@email.com');
      expect(response.body.data).not.toHaveProperty('senha_hash');
    });

    it('deve retornar erro 409 se o e-mail já estiver cadastrado', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: 'mariana@email.com',
      });

      const response = await request(app).post('/api/tutores').send({
        nome: 'Mariana Silva',
        email: 'mariana@email.com',
        senha: 'senhaSegura123',
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('Já existe um tutor cadastrado');
    });

    it('deve retornar erro 400 se os dados forem inválidos (validação Zod)', async () => {
      const response = await request(app).post('/api/tutores').send({
        nome: '',
        email: 'email-invalido',
        senha: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/login (Login)', () => {
    it('deve autenticar o tutor com sucesso e retornar token JWT e dados do tutor', async () => {
      const passwordPlain = 'senhaSegura123';
      const senha_hash = await bcrypt.hash(passwordPlain, 10);

      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        nome: 'Mariana Silva',
        email: 'mariana@email.com',
        senha_hash: senha_hash,
        data_criacao: new Date(),
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'mariana@email.com',
        senha: passwordPlain,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.tutor).toHaveProperty('id', '11111111-1111-1111-1111-111111111111');
      expect(response.body.data.tutor).not.toHaveProperty('senha_hash');

      // Validar se o token JWT gerado contém o tutor_id correto
      const decoded = jwt.verify(response.body.data.token, env.JWT_SECRET) as any;
      expect(decoded.tutor_id).toBe('11111111-1111-1111-1111-111111111111');
      expect(decoded.email).toBe('mariana@email.com');
    });

    it('deve retornar erro 401 para credenciais inválidas (senha errada)', async () => {
      const senha_hash = await bcrypt.hash('senhaCorreta', 10);

      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'mariana@email.com',
        senha_hash: senha_hash,
      });

      const response = await request(app).post('/api/auth/login').send({
        email: 'mariana@email.com',
        senha: 'senhaErrada',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('E-mail ou senha inválidos');
    });

    it('deve retornar erro 401 se o tutor não for encontrado', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({
        email: 'inexistente@email.com',
        senha: 'qualquerSenha',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('E-mail ou senha inválidos');
    });
  });

  describe('GET /api/tutores/me (Rota Protegida)', () => {
    it('deve retornar os dados do tutor autenticado quando o token JWT for válido', async () => {
      const tutorId = '11111111-1111-1111-1111-111111111111';
      const token = jwt.sign({ tutor_id: tutorId, email: 'mariana@email.com' }, env.JWT_SECRET);

      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: tutorId,
        nome: 'Mariana Silva',
        email: 'mariana@email.com',
        data_criacao: new Date(),
      });

      const response = await request(app)
        .get('/api/tutores/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id', tutorId);
      expect(response.body.data).toHaveProperty('nome', 'Mariana Silva');
    });

    it('deve retornar 401 se o header Authorization não for enviado', async () => {
      const response = await request(app).get('/api/tutores/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Token de autenticação não fornecido');
    });

    it('deve retornar 401 se o token JWT for inválido', async () => {
      const response = await request(app)
        .get('/api/tutores/me')
        .set('Authorization', 'Bearer token_invalido_123');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Token inválido ou expirado');
    });
  });
});
