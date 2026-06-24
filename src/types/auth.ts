export type UserRole = 'client' | 'super_admin' | 'admin';

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  tenant_id?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  role: UserRole;
  apiKey: string;
}

// Tipos legacy compatíveis com o hooks/auth.ts existente
export interface AuthResponse {
  token: string;
  user: AuthUser;
}
