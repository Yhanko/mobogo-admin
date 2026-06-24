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
} from 'lucide-react';

type Lotador = {
  id: string;
  name: string;
  phone: string | null;
  isActive: boolean;
  isBlocked: boolean;
};

export function LotadoresPage() {
  // Lotadores are basically users with role LOTADOR
  const { data, isLoading } = useApiQuery<{ data: Lotador[]; meta: any }>(
    ['lotadores'],
    '/iam/users?role=LOTADOR'
  );

  const [selected, setSelected] = useState<Lotador | null>(null);
  const [dialogAction, setDialogAction] = useState<
    'block' | 'unblock' | 'activate' | 'deactivate' | null
  >(null);

  const { mutate: block } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/block`,
    { invalidateKeys: [['lotadores']], showSuccessToast: true }
  );
  const { mutate: unblock } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/unblock`,
    { invalidateKeys: [['lotadores']], showSuccessToast: true }
  );
  const { mutate: activate } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/activate`,
    { invalidateKeys: [['lotadores']], showSuccessToast: true }
  );
  const { mutate: deactivate } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/deactivate`,
    { invalidateKeys: [['lotadores']], showSuccessToast: true }
  );

  const handleAction = () => {
    if (!selected || !dialogAction) return;

    if (dialogAction === 'block')
      block({ reason: 'Admin' } as any, { onSuccess: () => setSelected(null) });
    if (dialogAction === 'unblock')
      unblock({}, { onSuccess: () => setSelected(null) });
    if (dialogAction === 'activate')
      activate({}, { onSuccess: () => setSelected(null) });
    if (dialogAction === 'deactivate')
      deactivate({}, { onSuccess: () => setSelected(null) });

    setDialogAction(null);
  };

  const columns: ColumnDef<Lotador>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => (
        <div className="text-sm text-slate-500">
          {row.original.phone || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const { isActive, isBlocked } = row.original;
        if (isBlocked) return <Badge variant="destructive">Bloqueado</Badge>;
        if (!isActive) return <Badge variant="secondary">Inativo</Badge>;
        return <Badge className="bg-green-600">Ativo</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const lotador = row.original;

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

              {lotador.isBlocked ? (
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(lotador);
                    setDialogAction('unblock');
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{' '}
                  Desbloquear
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(lotador);
                    setDialogAction('block');
                  }}
                >
                  <Ban className="mr-2 h-4 w-4 text-red-600" /> Bloquear
                </DropdownMenuItem>
              )}

              {lotador.isActive ? (
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(lotador);
                    setDialogAction('deactivate');
                  }}
                >
                  <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" />{' '}
                  Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(lotador);
                    setDialogAction('activate');
                  }}
                >
                  <ShieldOff className="mr-2 h-4 w-4 text-green-600" /> Ativar
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
          title: 'Bloquear',
          desc: `Bloquear ${selected?.name}?`,
          dest: true,
        };
      case 'unblock':
        return {
          title: 'Desbloquear',
          desc: `Desbloquear ${selected?.name}?`,
          dest: false,
        };
      case 'activate':
        return {
          title: 'Ativar',
          desc: `Ativar ${selected?.name}?`,
          dest: false,
        };
      case 'deactivate':
        return {
          title: 'Desativar',
          desc: `Desativar ${selected?.name}?`,
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
          <h1 className="text-2xl font-bold tracking-tight">Lotadores</h1>
          <p className="text-sm text-slate-500">
            Gestão dos despachantes e parceiros de paragem.
          </p>
        </div>
        <Button>Novo Lotador</Button>
      </div>

      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <DataTable
          columns={columns}
          data={(data as any)?.items || (data as any)?.data || []}
          searchKey="name"
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
    </div>
  );
}
