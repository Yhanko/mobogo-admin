export interface TenantSummary {
  id: string;
  name: string;
  nif: string;
  status: string;
  created_at: string;
}

export interface TenantUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantDetail extends TenantSummary {
  establishment_number?: string;
  users?: TenantUser[];
}

export interface CreateTenantInput {
  name: string;
  nif: string;
  establishment_number?: string;
}

export interface CreateTenantUserInput {
  email: string;
  password: string;
  role?: string;
}

export type RequestStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR'
  | 'CANCELLED';

export interface RequestLog {
  requestId: string;
  serviceType: string;
  status: RequestStatus;
  agtRequestId?: string;
  agtResultCode?: string;
  tenantId?: string;
  createdAt: string;
  finalAt?: string;
}

export interface RequestDetail extends RequestLog {
  agtResponse?: Record<string, unknown>;
  errorList?: string[];
  requestPayload?: Record<string, unknown>;
}

export interface RequestListResponse {
  total: number;
  skip: number;
  limit: number;
  results: RequestLog[];
}

export interface AuditLog {
  id: string;
  tenant_id?: string;
  user_id?: string;
  ip_address?: string;
  method: string;
  path: string;
  status_code: number;
  api_key_prefix?: string;
  created_at: string;
}

export interface AdminStats {
  total_requests: number;
  success_count: number;
  error_count: number;
  pending_count: number;
  total_tenants: number;
  active_tenants: number;
}

export interface GrowthPoint {
  date: string;
  type: string;
  count: number;
}

export interface RabbitMQDebug {
  url: { masked: string; hostname: string; port: number; scheme: string };
  dns: { status: string; resolved_ips?: string[]; error?: string };
  tcp: { status: string; detail?: string };
  dramatiq: { status: string; detail?: string; error?: string };
  overall: 'ok' | 'error';
}
