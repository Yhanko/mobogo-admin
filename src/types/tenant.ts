export interface TenantInfo {
  id: string;
  name: string;
  nif: string;
  status: string;
  establishment_number?: string;
  created_at: string;
}

export interface PerfilResponse {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  tenant: TenantInfo;
}

export type FaturaStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR'
  | 'CANCELLED'
  | 'RECEIVED'
  | 'QUEUED'
  | 'SENT_TO_AGT'
  | 'VALID'
  | 'FAILED'
  | 'COMPLETED';

export interface Fatura {
  requestId: string;
  serviceType: string;
  documentType?: string;
  documentNo?: string;
  status: FaturaStatus;
  agtRequestId?: string;
  agtResultCode?: string;
  createdAt: string;
  finalAt?: string;
}

export interface FaturaDetail extends Fatura {
  agtResponse?: Record<string, unknown>;
  errorList?: string[];
}

export interface FaturaListResponse {
  total: number;
  skip: number;
  limit: number;
  results: Fatura[];
}

export interface Serie {
  id: string;
  document_type: string;
  series_year: number;
  series_contingency_indicator: string;
  tenant_id: string;
  created_at: string;
}

export interface ChaveAGT {
  id: string;
  tenant_id: string;
  has_private_key: boolean;
  agt_username?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiKey {
  id: string;
  key_prefix: string;
  label?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface ApiKeyCreated extends ApiKey {
  raw_key: string; // só aparece na criação
}

export interface UpdateProfileInput {
  email?: string;
  password?: string;
  name?: string;
}
