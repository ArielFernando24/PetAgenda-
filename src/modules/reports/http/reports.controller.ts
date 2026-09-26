import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../config/prisma';
import { exportReportQuerySchema } from './reports.schemas';
import { CsvEventRow, csvExportService } from '../application/csv-export.service';
import { pdfExportService } from '../application/pdf-export.service';
import { Prisma } from '@prisma/client';

function tutorIdFrom(req: Request): string {
  const tutorId = req.auth?.tutorId || req.user?.tutor_id;
  if (!tutorId) {
    throw new Error('Usuário não autenticado.');
  }
  return tutorId;
}

export class ReportsController {
  /**
   * Exporta a agenda filtrada no formato CSV com streaming e UTF-8 BOM
   */
  exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = tutorIdFrom(req);
      const query = exportReportQuerySchema.parse(req.query);

      const rows = await this.fetchFilteredEvents(tutorId, query);

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `relatorio-agenda-${dateStr}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const csvStream = csvExportService.createCsvStream(rows, {
        columns: query.columns,
        delimiter: query.delimiter,
      });

      csvStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Exporta a agenda filtrada no formato PDF estruturado com logotipo,
   * tabela sumarizada e numeração dinâmica de páginas
   */
  exportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tutorId = tutorIdFrom(req);
      const query = exportReportQuerySchema.parse(req.query);

      const [rows, tutor] = await Promise.all([
        this.fetchFilteredEvents(tutorId, query),
        prisma.tutor.findUnique({
          where: { id: tutorId },
          select: { nome: true },
        }),
      ]);

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `relatorio-agenda-${dateStr}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const pdfStream = pdfExportService.createPdfStream(rows, {
        tutorNome: tutor?.nome || 'Tutor Responsável',
        filtros: {
          q: query.q,
          tipoCuidado: query.tipoCuidado,
          status: query.status,
          periodo: query.dataInicio && query.dataFim ? `${query.dataInicio.substring(0, 10)} até ${query.dataFim.substring(0, 10)}` : undefined,
        },
      });

      pdfStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Consulta os eventos do banco aplicando isolamento de tutor e filtros
   */
  private async fetchFilteredEvents(tutorId: string, query: any): Promise<CsvEventRow[]> {
    const where: Prisma.EventoWhereInput = {
      pet: {
        tutorId,
      },
    };

    if (query.tipoCuidado) {
      where.tipoCuidado = query.tipoCuidado;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.petId) {
      where.petId = query.petId;
    }

    if (query.clinicaId) {
      where.clinicaId = query.clinicaId;
    }

    if (query.dataInicio || query.dataFim) {
      where.dataHora = {
        ...(query.dataInicio ? { gte: new Date(query.dataInicio) } : {}),
        ...(query.dataFim ? { lte: new Date(query.dataFim) } : {}),
      };
    }

    if (query.q) {
      where.OR = [
        { descricao: { contains: query.q, mode: 'insensitive' } },
        { pet: { nome: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const eventos = await prisma.evento.findMany({
      where,
      orderBy: { dataHora: 'asc' },
      include: {
        pet: {
          select: {
            nome: true,
            especie: true,
          },
        },
        clinica: {
          select: {
            nome: true,
          },
        },
      },
    });

    return eventos.map((ev) => ({
      id: ev.id,
      dataHora: ev.dataHora.toISOString(),
      petNome: ev.pet.nome,
      petEspecie: ev.pet.especie,
      tipoCuidado: ev.tipoCuidado,
      status: ev.status,
      recorrencia: ev.recorrencia,
      descricao: ev.descricao,
      clinicaNome: ev.clinica?.nome ?? null,
      createdAt: ev.createdAt.toISOString(),
    }));
  }
}

export const reportsController = new ReportsController();
