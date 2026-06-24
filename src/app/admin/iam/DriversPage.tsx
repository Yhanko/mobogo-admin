import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Ban,
  ShieldOff,
  ShieldAlert,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { DriverModal } from './components/DriverModal';
import { DriverDetailsDialog } from './components/DriverDetailsDialog';

type Driver = {
  id: string;
  userId: string;
  user: {
    name: string;
    phone: string;
  };
  licensePlate: string;
  status: string; // ACTIVE, INACTIVE, BLOCKED, PENDING
  workDays: number[];
  balance: number;
};

export function DriversPage() {
  const { data, isLoading } = useApiQuery<{ data: Driver[]; meta: any }>(
    ['drivers'],
    '/iam/drivers'
  );

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [dialogAction, setDialogAction] = useState<
    'block' | 'activate' | 'deactivate' | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { mutate: createDriver, isPending: isCreating } = useApiMutation(
    'post',
    '/iam/drivers',
    { invalidateKeys: [['drivers']], showSuccessToast: true }
  );
  const { mutate: blockDriver } = useApiMutation(
    'patch',
    (id: string) => `/iam/drivers/${id}/block`,
    { invalidateKeys: [['drivers']], showSuccessToast: true }
  );
  const { mutate: activateDriver } = useApiMutation(
    'patch',
    (id: string) => `/iam/drivers/${id}/activate`,
    { invalidateKeys: [['drivers']], showSuccessToast: true }
  );
  const { mutate: deactivateDriver } = useApiMutation(
    'patch',
    (id: string) => `/iam/drivers/${id}/deactivate`,
    { invalidateKeys: [['drivers']], showSuccessToast: true }
  );

  const handleAction = () => {
    if (!selectedDriver || !dialogAction) return;

    if (dialogAction === 'block')
      blockDriver({}, { onSuccess: () => setSelectedDriver(null) });
    if (dialogAction === 'activate')
      activateDriver({}, { onSuccess: () => setSelectedDriver(null) });
    if (dialogAction === 'deactivate')
      deactivateDriver({}, { onSuccess: () => setSelectedDriver(null) });

    setDialogAction(null);
  };

  const handleCreateSubmit = (data: any) => {
    createDriver(data, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.user?.name || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => (
        <div className="text-sm text-slate-500">
          {row.original.user?.phone || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'licensePlate',
      header: 'Matrícula',
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue('licensePlate')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'BLOCKED')
          return <Badge variant="destructive">Bloqueado</Badge>;
        if (status === 'INACTIVE')
          return <Badge variant="secondary">Inativo</Badge>;
        if (status === 'PENDING')
          return <Badge className="bg-yellow-600">Pendente</Badge>;
        return <Badge className="bg-green-600">Ativo</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const driver = row.original;
        const status = driver.status;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDriver(driver);
                  setIsDetailsOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
              </DropdownMenuItem>

              {status !== 'BLOCKED' && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedDriver(driver);
                    setDialogAction('block');
                  }}
                >
                  <Ban className="mr-2 h-4 w-4 text-red-600" /> Bloquear
                </DropdownMenuItem>
              )}

              {status === 'ACTIVE' ? (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedDriver(driver);
                    setDialogAction('deactivate');
                  }}
                >
                  <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" />{' '}
                  Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedDriver(driver);
                    setDialogAction('activate');
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Ativar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const getDialogContent = () => {
    switch (dialogAction) {
      case 'block':
        return {
          title: 'Bloquear Motorista',
          desc: `Tem a certeza que deseja bloquear o motorista ${selectedDriver?.user?.name}?`,
          dest: true,
        };
      case 'activate':
        return {
          title: 'Ativar Motorista',
          desc: `Deseja ativar a conta do motorista ${selectedDriver?.user?.name}?`,
          dest: false,
        };
      case 'deactivate':
        return {
          title: 'Desativar Motorista',
          desc: `Deseja desativar temporariamente o motorista ${selectedDriver?.user?.name}?`,
          dest: true,
        };
      default:
        return { title: '', desc: '', dest: false };
    }
  };

  const { title, desc, dest } = getDialogContent();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Motoristas</h1>
          <p className="text-sm text-slate-500">
            Gestão de motoristas e veículos registados na plataforma.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>Novo Motorista</Button>
      </div>

      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <DataTable
          columns={columns}
          data={(data as any)?.items || (data as any)?.data || []}
          searchKey="licensePlate"
        />
      )}

      <ConfirmDialog
        open={!!dialogAction}
        onOpenChange={(open) => !open && setDialogAction(null)}
        title={title}
        description={desc}
        onConfirm={handleAction}
        destructive={dest}
      />

      <DriverDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        driverId={selectedDriver?.id || null}
      />

      <DriverModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
}
