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

interface DriverDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string | null;
}

const DAYS_MAP: Record<number, string> = {
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
  0: 'Dom',
};

export function DriverDetailsDialog({
  open,
  onOpenChange,
  driverId,
}: DriverDetailsDialogProps) {
  // Query driver info
  const {
    data: driver,
    isLoading: isLoadingDriver,
    error: errorDriver,
  } = useApiQuery<any>(['driver', driverId], `/iam/drivers/${driverId}`, {
    enabled: !!driverId && open,
  });

  // Query wallet balance
  const { data: balanceData, isLoading: isLoadingBalance } = useApiQuery<any>(
    ['driver-balance', driverId],
    `/iam/drivers/${driverId}/balance`,
    { enabled: !!driverId && open }
  );

  const isLoading = isLoadingDriver || isLoadingBalance;
  const error = errorDriver;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Perfil do Motorista</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!driverId ? (
            <p className="text-slate-500">Nenhum motorista selecionado.</p>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-red-500">Erro ao carregar dados do motorista.</p>
          ) : driver ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">
                    {driver.user?.name || 'Sem Nome'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {driver.user?.phone || 'Sem telefone'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="font-mono text-sm">
                    {driver.licensePlate}
                  </Badge>
                  {driver.status === 'BLOCKED' ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : driver.status === 'INACTIVE' ? (
                    <Badge variant="secondary">Inativo</Badge>
                  ) : driver.status === 'PENDING' ? (
                    <Badge className="bg-blue-600">Pendente</Badge>
                  ) : (
                    <Badge className="bg-green-600">Ativo</Badge>
                  )}
                </div>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Saldo em Faturação
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {Number(driver.currentBalance).toLocaleString()} AKZ
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Corridas do dia/ciclo
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Carteira Principal
                  </p>
                  <p className="text-xl font-bold">
                    {balanceData?.walletBalance?.toLocaleString() || 0}{' '}
                    {balanceData?.currency || 'AKZ'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Saldo disponível
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div>
                  <span className="text-slate-500 block mb-1">
                    Dias de Trabalho
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {driver.workDays?.map((d: number) => (
                      <Badge key={d} variant="outline" className="bg-slate-100">
                        {DAYS_MAP[d]}
                      </Badge>
                    )) || 'Não definidos'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">
                    Cliente Associado
                  </span>
                  <span className="font-medium">
                    {driver.client?.name || 'Sistema'}
                  </span>
                </div>
              </div>

              {/* Lotadores Parceiros */}
              <div className="pt-4 border-t">
                <span className="text-slate-500 block mb-3 text-sm">
                  Lotadores Parceiros
                </span>
                {driver.lotadorPartnerships?.length > 0 ? (
                  <div className="space-y-2">
                    {driver.lotadorPartnerships.map((p: any) => (
                      <div
                        key={p.referenceCode}
                        className="flex justify-between items-center bg-slate-50 p-2 rounded border"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {p.lotador?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.lotador?.phone}
                          </p>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {p.referenceCode}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Nenhum parceiro associado.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
