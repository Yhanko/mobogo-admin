import z from 'zod';

export const chavesSchema = z.object({
  nif: z.string().min(9, 'NIF inválido'),
  privateKey: z.any().optional(), // File list
});

export type ChavesFormValues = z.infer<typeof chavesSchema>;
