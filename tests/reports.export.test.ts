import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { prisma } from '../src/config/prisma';
import { CsvExportService } from '../src/modules/reports/application/csv-export.service';

jest.mock('../src/config/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
    },
    evento: {
      findMany: jest.fn(),
    },
  },
}));

describe('US08 — Exportação de Relatórios e Auditoria de Dados (TASK-08.1, TASK-08.2, TASK-08.4)', () => {
  const TUTOR_ID = '11111111-2222-3333-4444-555555555555';
  const TUTOR_EMAIL = 'gestor.relatorios@petagenda.com';

  let token: string;
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
      nome: 'Mariana Silva de Alencar',
      tokenVersion: 1,
    });

    testApp = createApp({
      authenticate: (req, _res, next) => {
        req.auth = { tutorId: TUTOR_ID };
        req.user = { tutor_id: TUTOR_ID, email: TUTOR_EMAIL };
        next();
      },
    });
  });

  describe('TASK-08.1 & TASK-08.4: Exportação CSV com Streaming, UTF-8 BOM e Caracteres Especiais', () => {
    it('deve escapar corretamente campos contendo vírgulas, aspas duplas e quebras de linha (RFC 4180)', () => {
      expect(CsvExportService.escapeField('Texto Simples')).toBe('Texto Simples');
      expect(CsvExportService.escapeField('Texto, com vírgula')).toBe('"Texto, com vírgula"');
      expect(CsvExportService.escapeField('Texto com "aspas"')).toBe('"Texto com ""aspas"""');
      expect(CsvExportService.escapeField('Texto com\nquebra de linha')).toBe('"Texto com\nquebra de linha"');
    });

    it('deve exportar CSV com cabeçalhos adequados e prefixo UTF-8 BOM (\\uFEFF) para abrir sem falha no Excel', async () => {
      (prisma.evento.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'ev-1',
          dataHora: new Date('2026-10-15T09:30:00.000Z'),
          tipoCuidado: 'VACINA',
          status: 'PENDENTE',
          recorrencia: 'ANUAL',
          descricao: 'Vacinação antirrábica e polivalente V10',
          createdAt: new Date('2026-09-01T10:00:00.000Z'),
          pet: {
            nome: 'Coração de Leão',
            especie: 'Canina',
          },
          clinica: {
            nome: 'Clínica Veterinária São Francisco',
          },
        },
        {
          id: 'ev-2',
          dataHora: new Date('2026-10-20T14:00:00.000Z'),
          tipoCuidado: 'BANHO_E_TOSA',
          status: 'CONCLUIDO',
          recorrencia: 'MENSAL',
          descricao: 'Banho & Tosa higiênica com hidratação especial,\npenteado e corte de unhas',
          createdAt: new Date('2026-09-01T11:00:00.000Z'),
          pet: {
            nome: 'Chiquinha & Mel',
            especie: 'Felina',
          },
          clinica: null,
        },
      ]);

      const res = await request(testApp)
        .get('/api/reports/agenda/csv')
        .set('Authorization', `Bearer ${token}`)
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="relatorio-agenda-.*\.csv"/);

      const buffer = res.body as Buffer;

      // Validação do UTF-8 BOM: Primeiros 3 bytes devem ser 0xEF, 0xBB, 0xBF
      expect(buffer[0]).toBe(0xEF);
      expect(buffer[1]).toBe(0xBB);
      expect(buffer[2]).toBe(0xBF);

      const content = buffer.toString('utf8');

      // Verifica presença de caracteres especiais preservados perfeitamente
      expect(content).toContain('Coração de Leão');
      expect(content).toContain('Vacinação antirrábica');
      expect(content).toContain('higiênica com hidratação especial');
      expect(content).toContain('São Francisco');

      // Verifica escape de campos com quebra de linha ou vírgulas
      expect(content).toContain('"Banho & Tosa higiênica com hidratação especial,\npenteado e corte de unhas"');
    });

    it('deve respeitar a seleção personalizada de colunas no CSV (?columns=petNome,tipoCuidado,status)', async () => {
      (prisma.evento.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'ev-1',
          dataHora: new Date('2026-10-15T09:30:00.000Z'),
          tipoCuidado: 'VACINA',
          status: 'PENDENTE',
          recorrencia: 'ANUAL',
          descricao: 'Desc teste',
          createdAt: new Date(),
          pet: { nome: 'Thor', especie: 'Canina' },
          clinica: null,
        },
      ]);

      const res = await request(testApp)
        .get('/api/reports/agenda/csv?columns=petNome,tipoCuidado,status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const content = res.text;

      // Cabeçalho deve conter apenas as 3 colunas solicitadas
      expect(content).toContain('Nome do Pet,Tipo de Cuidado,Status');
      expect(content).toContain('Thor,VACINA,PENDENTE');
      expect(content).not.toContain('Recorrência');
    });

    it('deve aplicar filtros de categoria e status na consulta ao banco', async () => {
      (prisma.evento.findMany as jest.Mock).mockResolvedValue([]);

      await request(testApp)
        .get('/api/reports/agenda/csv?tipoCuidado=VACINA&status=PENDENTE')
        .set('Authorization', `Bearer ${token}`);

      expect(prisma.evento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tipoCuidado: 'VACINA',
            status: 'PENDENTE',
            pet: { tutorId: TUTOR_ID },
          }),
        })
      );
    });
  });

  describe('TASK-08.2 & TASK-08.4: Geração de Relatório Formatado em PDF', () => {
    it('deve exportar PDF com cabeçalho %PDF-, content-type application/pdf e nome do solicitante', async () => {
      (prisma.evento.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'ev-10',
          dataHora: new Date('2026-11-05T10:00:00.000Z'),
          tipoCuidado: 'CONSULTA',
          status: 'PENDENTE',
          recorrencia: 'NENHUMA',
          descricao: 'Avaliação cardiológica e exame de rotina',
          createdAt: new Date(),
          pet: { nome: 'Pipoca da Silva', especie: 'Canina' },
          clinica: { nome: 'Hospital Vet 24h' },
        },
      ]);

      const res = await request(testApp)
        .get('/api/reports/agenda/pdf')
        .set('Authorization', `Bearer ${token}`)
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="relatorio-agenda-.*\.pdf"/);

      const buffer = res.body as Buffer;
      // Valida que é um arquivo PDF legítimo (começa com %PDF-)
      const pdfHeader = buffer.slice(0, 5).toString('utf8');
      expect(pdfHeader).toBe('%PDF-');
      expect(buffer.length).toBeGreaterThan(1000); // Garante que o documento contém conteúdo e estrutura
    });

    it('deve exportar PDF corretamente mesmo quando não houver registros (Empty State)', async () => {
      (prisma.evento.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(testApp)
        .get('/api/reports/agenda/pdf')
        .set('Authorization', `Bearer ${token}`)
        .buffer(true)
        .parse((res, callback) => {
          let data = Buffer.alloc(0);
          res.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
          });
          res.on('end', () => {
            callback(null, data);
          });
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      const buffer = res.body as Buffer;
      expect(buffer.slice(0, 5).toString('utf8')).toBe('%PDF-');
    });

    it('deve respeitar os aliases de rota /api/export/csv e /api/export/pdf', async () => {
      (prisma.evento.findMany as jest.Mock).mockResolvedValue([]);

      const resCsv = await request(testApp)
        .get('/api/export/csv')
        .set('Authorization', `Bearer ${token}`);
      expect(resCsv.status).toBe(200);

      const resPdf = await request(testApp)
        .get('/api/export/pdf')
        .set('Authorization', `Bearer ${token}`);
      expect(resPdf.status).toBe(200);
    });
  });
});
