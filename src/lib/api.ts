import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

// ─── Request interceptor: injeta JWT e API Key ────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    // Segurança: Apenas injetar tokens se o destino for a nossa API (evitar token leak)
    const requestUrl = config.url || '';
    const isApiRequest =
      config.baseURL?.startsWith(BASE_URL) ||
      requestUrl.startsWith(BASE_URL) ||
      requestUrl.startsWith('/');

    if (isApiRequest) {
      const cookies = document.cookie.split('; ');
      const sessionCookie = cookies.find((c) => c.startsWith('agt_session='));
      if (sessionCookie) {
        const raw = sessionCookie.split('=')[1];
        const session = JSON.parse(decodeURIComponent(raw));
        if (session?.token) {
          config.headers['Authorization'] = `Bearer ${session.token}`;
        }
        if (session?.apiKey) {
          config.headers['x-api-key'] = session.apiKey;
        }
      }
    }
  } catch {
    // cookie inválido — ignora
  }
  return config;
});

// ─── Response interceptor: 401 → logout ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/login');
      // Apenas redireciona e limpa a sessão se não for um erro do próprio login
      if (!isLoginRequest) {
        document.cookie = 'agt_session=; Max-Age=0; path=/';
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
