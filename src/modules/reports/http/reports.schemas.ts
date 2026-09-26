import { z } from 'zod';

export const exportReportQuerySchema = z.object({
  q: z.string().trim().optional(),
  tipoCuidado: z.enum(['VACINA', 'VERMIFUGO', 'BANHO_E_TOSA', 'CONSULTA', 'REMEDIO']).optional(),
  status: z.enum(['PENDENTE', 'CONCLUIDO', 'CANCELADO']).optional(),
  dataInicio: z.string().datetime({ offset: true }).optional(),
  dataFim: z.string().datetime({ offset: true }).optional(),
  petId: z.string().uuid().optional(),
  clinicaId: z.string().uuid().optional(),
  columns: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.split(',').map((c) => c.trim()).filter(Boolean);
    }
    return val;
  }, z.array(z.string()).optional()),
  delimiter: z.enum([',', ';']).default(','),
});

export type ExportReportQueryDTO = z.infer<typeof exportReportQuerySchema>;
