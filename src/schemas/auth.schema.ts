import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .email('Formato de e-mail inválido')
    .toLowerCase()
    .trim(),
  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(1, 'A senha não pode estar vazia'),
});

export type LoginInput = z.infer<typeof loginSchema>;
