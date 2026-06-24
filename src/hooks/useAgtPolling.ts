import { useEffect } from 'react';
import { useRequestsStore } from '@/stores/useRequestsStore';
import { getFaturaStatus } from '@/service/tenant.service';
import { toast } from 'sonner';

export const useAgtPolling = () => {
  const { requests, updateRequest } = useRequestsStore();

  useEffect(() => {
    // Apenas pedidos que não estão terminados
    const pendingRequests = requests.filter((r) =>
      ['PENDING', 'RECEIVED', 'QUEUED', 'PROCESSING', 'SENT_TO_AGT'].includes(
        r.status
      )
    );

    if (pendingRequests.length === 0) return;

    const intervalId = setInterval(async () => {
      for (const req of pendingRequests) {
        try {
          const data = await getFaturaStatus(req.id);
          const newStatus = data.status;

          if (
            ['VALID', 'COMPLETED', 'FAILED', 'ERROR'].includes(newStatus) &&
            req.status !== newStatus
          ) {
            updateRequest(req.id, {
              status: newStatus as any,
              data: data,
            });

            // Notificar o utilizador dependendo do tipo de pedido
            const isSuccess = ['VALID', 'COMPLETED'].includes(newStatus);
            let message = '';
            switch (req.type) {
              case 'CONSULTA':
                message = isSuccess
                  ? 'Consulta de fatura finalizada!'
                  : 'Falha na consulta de fatura.';
                break;
              case 'LISTAGEM':
                message = isSuccess
                  ? 'Listagem de faturas finalizada!'
                  : 'Falha na listagem de faturas.';
                break;
              case 'VALIDACAO':
                message = isSuccess
                  ? 'Validação de documento concluída!'
                  : 'Falha ao validar documento.';
                break;
            }

            if (isSuccess) {
              toast.success(message);
            } else {
              toast.error(message);
            }
          } else if (req.status !== newStatus) {
            // Atualizar status intermédios (ex: QUEUED -> PROCESSING)
            updateRequest(req.id, { status: newStatus as any });
          }
        } catch (error) {
          console.error(`Erro ao atualizar status do pedido ${req.id}`, error);
          const currentErrors = (req.errorCount || 0) + 1;

          if (currentErrors >= 3) {
            updateRequest(req.id, {
              status: 'ERROR',
              data: {
                errorList: [
                  {
                    message:
                      'O pedido não existe na AGT ou não foi possível obter os detalhes após várias tentativas.',
                  },
                ],
              },
            });

            let message = 'Falha ao comunicar com a AGT.';
            if (req.type === 'CONSULTA')
              message = 'A fatura solicitada não foi encontrada.';
            else if (req.type === 'LISTAGEM')
              message = 'Não foi possível obter a listagem de faturas.';
            else if (req.type === 'VALIDACAO')
              message = 'Não foi possível validar o documento.';

            toast.error(message);
          } else {
            updateRequest(req.id, { errorCount: currentErrors });
          }
        }
      }
    }, 4000); // Polling a cada 4 segundos

    return () => clearInterval(intervalId);
  }, [requests, updateRequest]);
};
