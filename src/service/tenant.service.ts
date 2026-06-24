import api from '../lib/api';
import { TokenResponse } from '@/types/auth';
import {
  PerfilResponse,
  FaturaListResponse,
  FaturaDetail,
  ApiKey,
  ApiKeyCreated,
  UpdateProfileInput,
} from '@/types/tenant';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const tenantLogin = async (
  email: string,
  password: string
): Promise<{ access_token: string; token_type: string }> => {
  const { data } = await api.post<TokenResponse>('/login', { email, password });
  return data;
};

// ─── Perfil ──────────────────────────────────────────────────────────────────

export const getPerfil = async (): Promise<PerfilResponse> => {
  const { data } = await api.get<PerfilResponse>('/perfil');
  return data;
};

export const updatePerfil = async (
  payload: UpdateProfileInput
): Promise<PerfilResponse> => {
  const { data } = await api.patch<PerfilResponse>('/perfil', payload);
  return data;
};

// ─── Faturas ─────────────────────────────────────────────────────────────────

export const listFaturas = async (params?: {
  skip?: number;
  limit?: number;
  status?: string;
}): Promise<FaturaListResponse> => {
  const { data } = await api.get<FaturaListResponse>('/facturas', { params });
  return data;
};

export const getFaturaStatus = async (
  requestId: string
): Promise<FaturaDetail> => {
  const { data } = await api.get<FaturaDetail>(`/facturas/${requestId}/status`);
  return data;
};

export const consultarFatura = async (payload: {
  taxRegistrationNumber: string;
  documentNo: string;
}) => {
  const { data } = await api.post('/factura/consultar', payload);
  return data;
};

export const listarFaturasEletronicas = async (payload: {
  taxRegistrationNumber: string;
  queryStartDate: string;
  queryEndDate: string;
}) => {
  const { data } = await api.post('/facturas/listar', payload);
  return data;
};

export const validarDocumento = async (payload: {
  documentNo: string;
  action: string;
}) => {
  const { data } = await api.post('/validar', payload);
  return data;
};

// ─── Séries ──────────────────────────────────────────────────────────────────

export const listSeries = async () => {
  const { data } = await api.get('/serie');
  return data;
};

export const createSerie = async (payload: {
  seriesYear: number;
  documentType: string;
  establishmentNumber: string;
  seriesContingencyIndicator: string;
  taxRegistrationNumber: string;
}) => {
  const fullPayload = {
    schemaVersion: '1.2',
    submissionUUID: crypto.randomUUID(),
    taxRegistrationNumber: payload.taxRegistrationNumber,
    submissionTimeStamp: new Date().toISOString(),
    softwareInfo: {
      softwareInfoDetail: {
        productId: 'MobGo',
        productVersion: '1.0.0',
        softwareValidationNumber: 'FE/371/AGT/2026',
      },
      jwsSoftwareSignature: 'dummy-signature-12345678',
    },
    seriesYear: payload.seriesYear,
    documentType: payload.documentType,
    establishmentNumber: payload.establishmentNumber,
    seriesContingencyIndicator: payload.seriesContingencyIndicator,
    jwsSignature: 'dummy-signature-12345678',
  };

  const { data } = await api.post('/serie', fullPayload);
  return data;
};

// ─── Chaves AGT ──────────────────────────────────────────────────────────────

export const getChave = async () => {
  const { data } = await api.get('/chave');
  return data;
};

// ─── API Keys ────────────────────────────────────────────────────────────────

export const listApiKeys = async (): Promise<ApiKey[]> => {
  const { data } = await api.get<ApiKey[]>('/api-keys');
  return data;
};

export const createApiKey = async (label?: string): Promise<ApiKeyCreated> => {
  const { data } = await api.post<ApiKeyCreated>('/api-keys', { label });
  return data;
};

export const revokeApiKey = async (id: string): Promise<void> => {
  await api.delete(`/api-keys/${id}`);
};
