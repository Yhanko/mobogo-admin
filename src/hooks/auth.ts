import { create } from 'zustand';
import { AuthSession, UserRole } from '@/types/auth';

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  apiKey: string | null;

  setAuth: (
    token: string,
    user: {
      id: string;
      email: string;
      role: UserRole;
      is_active: boolean;
      created_at: string;
      tenant_id?: string;
    },
    apiKey?: string
  ) => void;
  setApiKey: (apiKey: string) => void;
  logout: () => void;
}

/* ── Cookie helpers ─────────────────────────────────────────────────────────── */

const COOKIE_NAME = 'agt_session';

const setCookie = (name: string, value: string, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict; ${secure}`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split('=')[1]);
  } catch {
    return null;
  }
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/`;
};

/* ── Store ───────────────────────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>((set, get) => {
  // Rehydrate from cookie on init
  let parsedSession: AuthSession | null = null;
  try {
    const raw = getCookie(COOKIE_NAME);
    parsedSession = raw ? JSON.parse(raw) : null;
  } catch {
    parsedSession = null;
  }

  return {
    session: parsedSession,
    isAuthenticated: !!parsedSession?.token,
    role: parsedSession?.role ?? null,
    apiKey: parsedSession?.apiKey ?? null,

    setAuth: (token, user, apiKey) => {
      const session: AuthSession = {
        token,
        user,
        role: user.role,
        apiKey: apiKey || '',
      };
      setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(session)));
      set({
        session,
        isAuthenticated: true,
        role: user.role,
        apiKey: apiKey || '',
      });
    },

    setApiKey: (apiKey: string) => {
      const currentSession = get().session;
      if (currentSession) {
        const session = { ...currentSession, apiKey };
        setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(session)));
        set({ session, apiKey });
      }
    },

    logout: () => {
      deleteCookie(COOKIE_NAME);
      set({ session: null, isAuthenticated: false, role: null, apiKey: null });
    },
  };
});
