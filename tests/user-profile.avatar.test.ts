import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import app from '../src/app';
import { prisma } from '../src/config/prisma';
import { env } from '../src/config/env';
import { storageService } from '../src/services/storage.service';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('US05 — Gestão de Perfil & Upload de Avatar (TASK-05.3, TASK-05.4, TASK-05.5)', () => {
  const TUTOR_ID = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';
  const TUTOR_EMAIL = 'perfil.usuario@petagenda.com';
  let token: string;

  beforeAll(() => {
    token = jwt.sign(
      { tutor_id: TUTOR_ID, email: TUTOR_EMAIL, token_version: 1 },
      env.JWT_SECRET
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TASK-05.3: PUT /api/users/me & PUT /api/tutores/me (Edição Cadastral & Sanitização)', () => {
    it('deve atualizar com sucesso nome, telefone, bio e timezone do usuário', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel Antigo',
        email: TUTOR_EMAIL,
        telefone: null,
        bio: null,
        timezone: 'America/Sao_Paulo',
        data_criacao: new Date(),
      });

      (prisma.tutor.update as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel Fernando',
        email: TUTOR_EMAIL,
        telefone: '(11) 98765-4321',
        bio: 'Tutor dedicado de 2 gatinhos e 1 cachorro.',
        timezone: 'America/Sao_Paulo',
        avatarUrl: null,
        avatarThumb128: null,
        avatarThumb256: null,
        data_criacao: new Date(),
      });

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: '  Ariel Fernando  ',
          telefone: ' (11) 98765-4321 ',
          bio: 'Tutor dedicado de 2 gatinhos e 1 cachorro.',
          timezone: 'America/Sao_Paulo',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Perfil atualizado com sucesso');
      expect(response.body.data.nome).toBe('Ariel Fernando');
      expect(response.body.data.telefone).toBe('(11) 98765-4321');
      expect(response.body.data.bio).toContain('Tutor dedicado');

      const updateCallArg = (prisma.tutor.update as jest.Mock).mock.calls[0][0];
      expect(updateCallArg.data.nome).toBe('Ariel Fernando');
      expect(updateCallArg.data.telefone).toBe('(11) 98765-4321');
      expect(updateCallArg.data.bio).toBe('Tutor dedicado de 2 gatinhos e 1 cachorro.');
    });

    it('deve bloquear e rejeitar terminantemente a alteração de campos restritos (ex: role, id, email)', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Nome Valido',
          role: 'admin',
          email: 'novoemail@hacker.com',
          tokenVersion: 99,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('errors');
      const messages = response.body.errors.map((e: any) => e.message);
      expect(messages.some((m: string) => m.includes('role'))).toBe(true);
      expect(messages.some((m: string) => m.includes('email'))).toBe(true);
      expect(prisma.tutor.update).not.toHaveBeenCalled();
    });

    it('deve funcionar através do alias /api/tutores/me mantendo retrocompatibilidade', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel',
        email: TUTOR_EMAIL,
      });

      (prisma.tutor.update as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel Atualizado',
        email: TUTOR_EMAIL,
        data_criacao: new Date(),
      });

      const response = await request(app)
        .put('/api/tutores/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Ariel Atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.data.nome).toBe('Ariel Atualizado');
    });
  });

  describe('TASK-05.4 & TASK-05.5: Upload de Avatar, Thumbnails (128x128, 256x256) e Validação de Mídia', () => {
    let validImageBuffer: Buffer;

    beforeAll(async () => {
      // Gera imagem PNG real em memória (300x300)
      validImageBuffer = await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 50, g: 150, b: 250 },
        },
      })
        .png()
        .toBuffer();
    });

    it('deve realizar upload de avatar válido e gerar thumbnails 128x128 e 256x256', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel',
        email: TUTOR_EMAIL,
        avatarUrl: null,
      });

      (prisma.tutor.update as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve({
          id: TUTOR_ID,
          nome: 'Ariel',
          email: TUTOR_EMAIL,
          avatarUrl: data.avatarUrl,
          avatarThumb128: data.avatarThumb128,
          avatarThumb256: data.avatarThumb256,
          data_criacao: new Date(),
        })
      );

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', validImageBuffer, 'avatar.png');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Foto de perfil atualizada com sucesso');
      expect(response.body.data).toHaveProperty('avatarUrl');
      expect(response.body.data).toHaveProperty('avatarThumb128');
      expect(response.body.data).toHaveProperty('avatarThumb256');

      expect(response.body.data.avatarThumb128).toContain('_128.png');
      expect(response.body.data.avatarThumb256).toContain('_256.png');
    });

    it('deve limpar URLs e arquivos de imagens antigas ao salvar uma nova (DoD Storage Limpo)', async () => {
      const deleteSpy = jest.spyOn(storageService, 'deleteAvatarFiles');

      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel',
        email: TUTOR_EMAIL,
        avatarUrl: 'http://127.0.0.1:3000/uploads/avatars/old_avatar_main.png',
        avatarThumb128: 'http://127.0.0.1:3000/uploads/avatars/old_avatar_128.png',
        avatarThumb256: 'http://127.0.0.1:3000/uploads/avatars/old_avatar_256.png',
      });

      (prisma.tutor.update as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel',
        email: TUTOR_EMAIL,
        avatarUrl: 'http://127.0.0.1:3000/uploads/avatars/new_main.png',
        avatarThumb128: 'http://127.0.0.1:3000/uploads/avatars/new_128.png',
        avatarThumb256: 'http://127.0.0.1:3000/uploads/avatars/new_256.png',
      });

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', validImageBuffer, 'nova_foto.png');

      expect(response.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalledWith(
        expect.arrayContaining(['http://127.0.0.1:3000/uploads/avatars/old_avatar_main.png'])
      );

      deleteSpy.mockRestore();
    });

    it('deve rejeitar arquivo de imagem com mais de 2MB com mensagem amigável (DoD > 2MB)', async () => {
      // Cria buffer simulado com 2.5MB
      const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024);

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', largeBuffer, { filename: 'foto_pesada.png', contentType: 'image/png' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('FILE_TOO_LARGE');
      expect(response.body.message).toContain('Fotos com mais de 2MB são rejeitadas');
    });

    it('deve bloquear extensões e formatos de mídia não permitidos (.exe, .pdf) (TASK-05.5)', async () => {
      const fakeExecutable = Buffer.from('MZ...fake-executable');

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', fakeExecutable, { filename: 'malware.exe', contentType: 'application/x-msdownload' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toMatch(/Formato de arquivo não suportado/i);

      // Teste com .pdf
      const fakePdf = Buffer.from('%PDF-1.4...');
      const responsePdf = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', fakePdf, { filename: 'documento.pdf', contentType: 'application/pdf' });

      expect(responsePdf.status).toBe(400);
      expect(responsePdf.body.message).toMatch(/Formato de arquivo não suportado/i);
    });

    it('deve gerar URL pré-assinada via endpoint GET /api/users/me/avatar/presigned-url', async () => {
      const response = await request(app)
        .get('/api/users/me/avatar/presigned-url?contentType=image/png')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('uploadUrl');
      expect(response.body.data).toHaveProperty('fileKey');
    });

    it('deve refletir as alterações no perfil em GET /api/users/me sem precisar deslogar (DoD)', async () => {
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: TUTOR_ID,
        nome: 'Ariel Fernando',
        email: TUTOR_EMAIL,
        telefone: '(11) 98765-4321',
        bio: 'Bio atualizada',
        timezone: 'America/Sao_Paulo',
        avatarUrl: 'http://127.0.0.1:3000/uploads/avatars/avatar_main.png',
        avatarThumb128: 'http://127.0.0.1:3000/uploads/avatars/avatar_128.png',
        avatarThumb256: 'http://127.0.0.1:3000/uploads/avatars/avatar_256.png',
        data_criacao: new Date(),
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.avatarUrl).toBe('http://127.0.0.1:3000/uploads/avatars/avatar_main.png');
      expect(response.body.data.telefone).toBe('(11) 98765-4321');
      expect(response.body.data.bio).toBe('Bio atualizada');
    });
  });
});
