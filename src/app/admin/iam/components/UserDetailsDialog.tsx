import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiQuery } from '@/hooks/useApi';
import { Badge } from '@/components/ui/Badge';
import { Loader2 } from 'lucide-react';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailsDialog({
  open,
  onOpenChange,
  userId,
}: UserDetailsDialogProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useApiQuery<any>(['user', userId], `/iam/users/${userId}`, {
    enabled: !!userId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Utilizador</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!userId ? (
            <p className="text-slate-500">Nenhum utilizador selecionado.</p>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-500">
              Erro ao carregar dados do utilizador.
            </p>
          ) : user ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">
                    {user.name || user.displayId || 'Sem Nome'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {user.phone || 'Sem contacto associado'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                  {user.isBlocked ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : !user.isActive ? (
                    <Badge variant="secondary">Inativo</Badge>
                  ) : (
                    <Badge className="bg-green-600">Ativo</Badge>
                  )}
                </div>
              </div>

              {/* Wallet Info */}
              {user.wallet && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Carteira Digital
                  </p>
                  <p className="text-xl font-bold">
                    {user.wallet.balance?.toLocaleString() || 0}{' '}
                    {user.wallet.currency}
                  </p>
                </div>
              )}

              {/* Blocking Info */}
              {user.isBlocked && user.blockReason && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-1">
                    Motivo do Bloqueio
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {user.blockReason}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Display ID</span>
                  <span className="font-medium">{user.displayId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">
                    Data de Criação
                  </span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>

              {/* Driver Profile */}
              {user.driverProfile && (
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-3 text-sm">
                    Perfil de Motorista
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block mb-1">
                        Matrícula
                      </span>
                      <span className="font-medium">
                        {user.driverProfile.licensePlate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">
                        Estado (Motorista)
                      </span>
                      <span className="font-medium">
                        {user.driverProfile.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Agent Profile */}
              {user.agentProfile && (
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-3 text-sm">Perfil de Agente</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 block mb-1">
                        Limite Diário de Tickets
                      </span>
                      <span className="font-medium">
                        {user.agentProfile.dailyTicketLimit?.toLocaleString() ||
                          'Ilimitado'}{' '}
                        AKZ
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">
                        Permissões Especiais
                      </span>
                      <span className="font-medium">
                        {user.agentProfile.permissions?.length
                          ? user.agentProfile.permissions.join(', ')
                          : 'Padrão'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
