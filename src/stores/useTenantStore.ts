import { create } from 'zustand';
import { getPerfil, listFaturas } from '@/service/tenant.service';
import { PerfilResponse, FaturaListResponse } from '@/types/tenant';
import api from '@/lib/api';

interface TenantState {
  perfil: PerfilResponse | null;
  faturas: FaturaListResponse | null;
  growthStats: Record<string, any>;
  series: any;
  chave: any;

  isLoadingPerfil: boolean;
  isLoadingFaturas: boolean;
  isLoadingGrowth: boolean;
  isLoadingSeries: boolean;
  isLoadingChave: boolean;

  fetchPerfil: (force?: boolean) => Promise<void>;
  fetchFaturas: (
    skip?: number,
    limit?: number,
    status?: string,
    force?: boolean
  ) => Promise<void>;
  fetchGrowthStats: (
    from: string,
    to: string,
    force?: boolean
  ) => Promise<void>;
  fetchSeries: (force?: boolean) => Promise<void>;
  fetchChave: (force?: boolean) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  perfil: null,
  faturas: null,
  growthStats: {},
  series: null,
  chave: null,

  isLoadingPerfil: false,
  isLoadingFaturas: false,
  isLoadingGrowth: false,
  isLoadingSeries: false,
  isLoadingChave: false,

  fetchChave: async (force = false) => {
    if (!force && get().chave) return;
    set({ isLoadingChave: true });
    try {
      const { data } = await api.get('/chave');
      set({ chave: data, isLoadingChave: false });
    } catch (e) {
      set({ isLoadingChave: false });
    }
  },

  fetchPerfil: async (force = false) => {
    if (!force && get().perfil) return;
    set({ isLoadingPerfil: true });
    try {
      const data = await getPerfil();
      set({ perfil: data, isLoadingPerfil: false });
    } catch (e) {
      set({ isLoadingPerfil: false });
    }
  },

  fetchFaturas: async (
    skip = 0,
    limit = 50,
    status?: string,
    force = false
  ) => {
    const current = get().faturas as any;
    if (
      !force &&
      current?.skip === skip &&
      current?.limit === limit &&
      current?.status === status
    )
      return;
    set({ isLoadingFaturas: true });
    try {
      const data = await listFaturas({ skip, limit, status });
      set({ faturas: { ...data, status } as any, isLoadingFaturas: false });
    } catch (e) {
      set({ isLoadingFaturas: false });
    }
  },

  fetchGrowthStats: async (from: string, to: string, force = false) => {
    const key = `${from}_${to}`;
    if (!force && get().growthStats[key]) return;

    set({ isLoadingGrowth: true });
    try {
      const { data } = await api.get('/stats/growth', { params: { from, to } });
      set((state) => ({
        growthStats: { ...state.growthStats, [key]: data },
        isLoadingGrowth: false,
      }));
    } catch (e) {
      set({ isLoadingGrowth: false });
    }
  },

  fetchSeries: async (force = false) => {
    if (!force && get().series) return;
    set({ isLoadingSeries: true });
    try {
      const { data } = await api.get('/serie');
      set({ series: data, isLoadingSeries: false });
    } catch (e) {
      set({ isLoadingSeries: false });
    }
  },
}));
