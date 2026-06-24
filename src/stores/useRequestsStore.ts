import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RequestType = 'CONSULTA' | 'LISTAGEM' | 'VALIDACAO';
export type RequestStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT_TO_AGT'
  | 'VALID'
  | 'FAILED'
  | 'COMPLETED'
  | 'ERROR';

export interface AGTRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  data?: any; // Resultados do backend (agtResponse, errorList, etc)
  createdAt: number;
  errorCount?: number;
}

interface RequestsState {
  requests: AGTRequest[];
  addRequest: (req: AGTRequest) => void;
  updateRequest: (id: string, updates: Partial<AGTRequest>) => void;
  removeRequest: (id: string) => void;
  clearRequests: () => void;
}

export const useRequestsStore = create<RequestsState>()(
  persist(
    (set) => ({
      requests: [],

      addRequest: (req) =>
        set((state) => ({
          // Prevent duplicates by replacing if same ID exists, or just prepend
          requests: [req, ...state.requests.filter((r) => r.id !== req.id)],
        })),

      updateRequest: (id, updates) =>
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === id ? { ...req, ...updates } : req
          ),
        })),

      removeRequest: (id) =>
        set((state) => ({
          requests: state.requests.filter((req) => req.id !== id),
        })),

      clearRequests: () => set({ requests: [] }),
    }),
    {
      name: 'mobgo_requests', // Key in localStorage
    }
  )
);
