import { z } from 'zod';

export const createTutorSchema = z.object({
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .trim()
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

export const RESTRICTED_PROFILE_FIELDS = [
  'id',
  'role',
  'email',
  'senha_hash',
  'tokenVersion',
  'token_version',
  'data_criacao',
];

export const updateProfileSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, 'O nome deve ter no mínimo 2 caracteres')
      .max(100, 'O nome não pode exceder 100 caracteres')
      .optional(),
    telefone: z
      .string()
      .trim()
      .max(25, 'O telefone não pode exceder 25 caracteres')
      .optional(),
    bio: z
      .string()
      .trim()
      .max(500, 'A bio não pode exceder 500 caracteres')
      .optional(),
    timezone: z
      .string()
      .trim()
      .max(50, 'O timezone não pode exceder 50 caracteres')
      .optional(),
    senhaAtual: z.string().optional(),
    novaSenha: z
      .string()
      .min(6, 'A nova senha deve ter no mínimo 6 caracteres')
      .max(72, 'A nova senha não pode exceder 72 caracteres')
      .optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    for (const field of RESTRICTED_PROFILE_FIELDS) {
      if (field in data) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `O campo '${field}' é restrito e não pode ser alterado.`,
        });
      }
    }
  });

export const updateTutorSchema = updateProfileSchema;

export type CreateTutorInput = z.infer<typeof createTutorSchema>;
export type UpdateTutorInput = z.infer<typeof updateTutorSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

