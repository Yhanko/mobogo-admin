import { z } from 'zod';

export const schemaPerfil = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .optional()
    .or(z.literal('')),
});
export type FormValues = z.infer<typeof schemaPerfil>;
