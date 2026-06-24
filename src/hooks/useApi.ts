import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

interface ApiOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
}

// Hook genérico para GET
export function useApiQuery<T>(key: string[], url: string, params?: any) {
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<T> => {
      const { data } = await api.get(url, { params });
      return data?.data ?? data;
    },
  });
}

// Hook genérico para POST/PUT/PATCH/DELETE
export function useApiMutation<TData = any, TVariables = any>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string | ((vars: TVariables) => string),
  options?: ApiOptions & { invalidateKeys?: string[][] }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      let endpoint = '';
      let body = variables;

      if (typeof url === 'function') {
        endpoint = url(variables);
        
        // Se passamos um objecto contendo id e data, o body será apenas o data
        if (
          variables && 
          typeof variables === 'object' && 
          'data' in variables && 
          Object.keys(variables).includes('id') // pode ter outros também
        ) {
          body = (variables as any).data;
        } 
        // Se passamos apenas uma string (ex: um ID), o body não deve ser a string
        else if (typeof variables === 'string' || typeof variables === 'number') {
          body = {} as any;
        }
      } else {
        endpoint = url;
      }

      let response;

      switch (method) {
        case 'delete':
          response = await api.delete(endpoint, { data: body });
          break;
        case 'post':
          response = await api.post(endpoint, body);
          break;
        case 'put':
          response = await api.put(endpoint, body);
          break;
        case 'patch':
          response = await api.patch(endpoint, body);
          break;
      }
      return response?.data;
    },
    onSuccess: () => {
      if (options?.showSuccessToast) {
        toast.success(
          options.successMessage || 'Operação realizada com sucesso!'
        );
      }
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
    onError: (error: any) => {
      if (options?.showErrorToast !== false) {
        const msg =
          error.response?.data?.message || error.message || 'Ocorreu um erro';
        toast.error(msg);
      }
    },
  });
}
