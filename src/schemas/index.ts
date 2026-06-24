import { z } from 'zod';

// Schema de login (usado na página Login.tsx)
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'Email excede o tamanho máximo (100)'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(64, 'Senha excede tamanho máximo (64)'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(100, 'Email excede o tamanho máximo (100)'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(64, 'Senha excede tamanho máximo (64)'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
