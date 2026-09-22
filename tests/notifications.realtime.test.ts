import request from 'supertest';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { InMemoryNotificationRepository } from '../src/modules/notifications/infrastructure/in-memory-notification.repository';
import { NotificationService } from '../src/modules/notifications/application/notification.service';
import { NotificationStreamManager } from '../src/modules/notifications/infrastructure/notification-stream.manager';
import { prisma } from '../src/config/prisma';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('US07 — Central de Notificações em Tempo Real (TASK-07.1, TASK-07.2, TASK-07.4, TASK-07.5)', () => {
  const TUTOR_ID = '11111111-2222-3333-4444-555555555555';
  const OTHER_TUTOR_ID = '99999999-8888-7777-6666-555555555555';
  const TUTOR_EMAIL = 'notificacoes@petagenda.com';

  let token: string;
  let inMemoryRepo: InMemoryNotificationRepository;
  let streamManager: NotificationStreamManager;
  let notificationService: NotificationService;
  let testApp: ReturnType<typeof createApp>;

  beforeAll(() => {
    token = jwt.sign(
      { tutor_id: TUTOR_ID, email: TUTOR_EMAIL, token_version: 1 },
      env.JWT_SECRET
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
      id: TUTOR_ID,
      tokenVersion: 1,
    });

    inMemoryRepo = new InMemoryNotificationRepository();
    streamManager = new NotificationStreamManager();
    notificationService = new NotificationService(inMemoryRepo, streamManager);

    testApp = createApp({
      notificationRepository: inMemoryRepo,
      authenticate: (req, _res, next) => {
        req.auth = { tutorId: TUTOR_ID };
        req.user = { tutor_id: TUTOR_ID, email: TUTOR_EMAIL };
        next();
      },
    });
  });

  afterEach(() => {
    streamManager.destroy();
  });

  describe('TASK-07.1 & TASK-07.4: Endpoints de Gestão, Listagem e Leitura', () => {
    it('deve criar uma nova notificação com sucesso e persistir os campos obrigatórios e metadata', async () => {
      const res = await request(testApp)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Lembrete de Vacina',
          body: 'A vacina V10 do Rex vence amanhã!',
          type: 'VACINA',
          metadata: { petName: 'Rex', dose: 'Anual' },
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Lembrete de Vacina');
      expect(res.body.data.body).toBe('A vacina V10 do Rex vence amanhã!');
      expect(res.body.data.type).toBe('VACINA');
      expect(res.body.data.readAt).toBeNull();
      expect(res.body.data.metadata).toEqual({ petName: 'Rex', dose: 'Anual' });
    });

    it('deve listar notificações paginadas com metadados e contagem unreadCount', async () => {
      // Cria 3 notificações (2 não lidas, 1 lida)
      const n1 = await inMemoryRepo.create({
        userId: TUTOR_ID,
        title: 'Notificação 1',
        body: 'Corpo 1',
        type: 'AGENDA',
      });
      await inMemoryRepo.create({
        userId: TUTOR_ID,
        title: 'Notificação 2',
        body: 'Corpo 2',
        type: 'BANHO',
      });
      await inMemoryRepo.markAsRead(n1.id, TUTOR_ID);

      const res = await request(testApp)
        .get('/api/notifications?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.meta.unreadCount).toBe(1);
    });

    it('deve filtrar apenas não lidas quando unreadOnly=true', async () => {
      const n1 = await inMemoryRepo.create({
        userId: TUTOR_ID,
        title: 'Notificação Antiga',
        body: 'Já lida',
        type: 'SISTEMA',
      });
      await inMemoryRepo.create({
        userId: TUTOR_ID,
        title: 'Notificação Nova',
        body: 'Pendente de leitura',
        type: 'SISTEMA',
      });
      await inMemoryRepo.markAsRead(n1.id, TUTOR_ID);

      const res = await request(testApp)
        .get('/api/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Notificação Nova');
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.unreadCount).toBe(1);
    });

    it('deve marcar notificação individual como lida (PATCH /notifications/:id/read) e decrementar unread', async () => {
      const n = await inMemoryRepo.create({
        userId: TUTOR_ID,
        title: 'Consulta confirmada',
        body: 'Dr. Lucas aguarda você amanhã às 14h',
        type: 'CONSULTA',
      });

      const res = await request(testApp)
        .patch(`/api/notifications/${n.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.readAt).not.toBeNull();

      // Confere unread count
      const countRes = await request(testApp)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(countRes.status).toBe(200);
      expect(countRes.body.data.unreadCount).toBe(0);
    });

    it('deve marcar todas como lidas (POST /notifications/read-all) e zerar o unreadCount', async () => {
      await inMemoryRepo.create({ userId: TUTOR_ID, title: 'N1', body: 'B1', type: 'T1' });
      await inMemoryRepo.create({ userId: TUTOR_ID, title: 'N2', body: 'B2', type: 'T2' });

      const res = await request(testApp)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.unreadCount).toBe(0);

      const check = await inMemoryRepo.countUnread(TUTOR_ID);
      expect(check).toBe(0);
    });

    it('deve retornar 404 ao tentar marcar como lida notificação inexistente ou de outro tutor', async () => {
      const otherNotification = await inMemoryRepo.create({
        userId: OTHER_TUTOR_ID,
        title: 'Privado',
        body: 'Do outro tutor',
        type: 'SISTEMA',
      });

      const res = await request(testApp)
        .patch(`/api/notifications/${otherNotification.id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('TASK-07.2: Infraestrutura de Push em Tempo Real (SSE)', () => {
    it('deve aceitar conexão SSE com cabeçalhos apropriados via Header Authorization', (done) => {
      const server = testApp.listen(0, () => {
        const port = (server.address() as any).port;
        const httpReq = http.get(
          `http://127.0.0.1:${port}/api/notifications/stream`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          (httpRes) => {
            expect(httpRes.statusCode).toBe(200);
            expect(httpRes.headers['content-type']).toMatch(/text\/event-stream/);
            expect(httpRes.headers['cache-control']).toMatch(/no-cache/);
            expect(httpRes.headers['connection']).toMatch(/keep-alive/);
            httpRes.destroy();
            server.close(() => done());
          }
        );
      });
    });

    it('deve aceitar conexão SSE autenticada via Query Param ?token=...', (done) => {
      const server = testApp.listen(0, () => {
        const port = (server.address() as any).port;
        const httpReq = http.get(
          `http://127.0.0.1:${port}/api/notifications/stream?token=${token}`,
          (httpRes) => {
            expect(httpRes.statusCode).toBe(200);
            expect(httpRes.headers['content-type']).toMatch(/text\/event-stream/);
            httpRes.destroy();
            server.close(() => done());
          }
        );
      });
    });

    it('deve rejeitar conexão SSE sem token com 401', (done) => {
      const server = testApp.listen(0, () => {
        const port = (server.address() as any).port;
        http.get(`http://127.0.0.1:${port}/api/notifications/stream`, (httpRes) => {
          expect(httpRes.statusCode).toBe(401);
          httpRes.destroy();
          server.close(() => done());
        });
      });
    });

    it('deve enviar evento de notificação em tempo real (< 1s) para o stream do usuário', async () => {
      const mockRes: any = {
        writeHead: jest.fn(),
        write: jest.fn(),
      };

      const cleanup = streamManager.addClient(TUTOR_ID, mockRes);
      expect(streamManager.getActiveConnectionsCount(TUTOR_ID)).toBe(1);

      // Despacha notificação via serviço
      const startTime = Date.now();
      await notificationService.createNotification({
        userId: TUTOR_ID,
        title: 'Alerta Instantâneo',
        body: 'Teste de entrega < 1s',
        type: 'ALERTA',
      });
      const deliveryDuration = Date.now() - startTime;

      expect(deliveryDuration).toBeLessThan(1000); // Critério DoD: < 1s
      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining('event: notification')
      );
      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining('Alerta Instantâneo')
      );

      cleanup();
      expect(streamManager.getActiveConnectionsCount(TUTOR_ID)).toBe(0);
    });
  });

  describe('TASK-07.5: Tolerância Offline, Reconexão e Prevenção de Memory Leaks', () => {
    it('deve preservar notificações criadas enquanto o usuário estava desconectado (Cenário Offline)', async () => {
      // Usuário está offline (0 conexões ativas)
      expect(streamManager.getActiveConnectionsCount(TUTOR_ID)).toBe(0);

      // Evento ocorre durante período offline
      await notificationService.createNotification({
        userId: TUTOR_ID,
        title: 'Mensagem Offline 1',
        body: 'Você não estava logado quando isso aconteceu.',
        type: 'OFFLINE_EVENT',
      });

      await notificationService.createNotification({
        userId: TUTOR_ID,
        title: 'Mensagem Offline 2',
        body: 'Segunda notificação acumulada.',
        type: 'OFFLINE_EVENT',
      });

      // Usuário reconecta e busca listagem/badge
      const res = await request(testApp)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.unreadCount).toBe(2);
      expect(res.body.data[0].title).toBe('Mensagem Offline 2');
    });

    it('deve limpar conexões e evitar memory leaks quando a conexão for encerrada', () => {
      const mockRes: any = {
        writeHead: jest.fn(),
        write: jest.fn(),
      };

      const cleanup = streamManager.addClient(TUTOR_ID, mockRes);
      expect(streamManager.getActiveConnectionsCount(TUTOR_ID)).toBe(1);

      // Simula fechamento do socket/janela do navegador
      cleanup();

      expect(streamManager.getActiveConnectionsCount(TUTOR_ID)).toBe(0);
      expect(streamManager.getActiveConnectionsCount()).toBe(0);
    });
  });
});
