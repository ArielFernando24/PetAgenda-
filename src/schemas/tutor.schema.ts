import { z } from 'zod';

export const createTutorSchema = z.object({
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres')
    .trim(),
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .email('Formato de e-mail inválido')
    .max(150, 'O e-mail não pode exceder 150 caracteres')
    .toLowerCase()
    .trim(),
  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(72, 'A senha não pode exceder 72 caracteres'),
});

export const updateTutorSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres')
    .trim()
    .optional(),
  senhaAtual: z.string().optional(),
  novaSenha: z
    .string()
    .min(6, 'A nova senha deve ter no mínimo 6 caracteres')
    .max(72, 'A nova senha não pode exceder 72 caracteres')
    .optional(),
});

export type CreateTutorInput = z.infer<typeof createTutorSchema>;
export type UpdateTutorInput = z.infer<typeof updateTutorSchema>;
