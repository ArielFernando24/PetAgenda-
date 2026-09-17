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

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .email('Formato de e-mail inválido')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'O token é obrigatório' })
    .min(1, 'O token não pode estar vazio')
    .trim(),
  novaSenha: z
    .string({ required_error: 'A nova senha é obrigatória' })
    .min(8, 'A senha deve conter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
