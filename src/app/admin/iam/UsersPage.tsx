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
  CheckCircle,
  ShieldOff,
  ShieldAlert,
  Trash2,
  Eye,
  Wallet as WalletIcon,
} from 'lucide-react';
import { BlockUserDialog } from './components/BlockUserDialog';
import { UserDetailsDialog } from './components/UserDetailsDialog';
import { UserModal } from './components/UserModal';
import { ViewBalanceModal } from '../wallet/components/ViewBalanceModal';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  displayId: string | null;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
};

export function UsersPage() {
  const { data, isLoading } = useApiQuery<{ data: User[]; meta: any }>(
    ['users'],
    '/iam/users'
  );

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogAction, setDialogAction] = useState<
    'unblock' | 'activate' | 'deactivate' | 'delete' | null
  >(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isViewBalanceOpen, setIsViewBalanceOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Mutations
  const { mutate: createUser, isPending: isCreating } = useApiMutation(
    'post',
    '/iam/users',
    { invalidateKeys: [['users']], showSuccessToast: true }
  );
  const { mutate: blockUser, isPending: isBlocking } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/block`,
    { invalidateKeys: [['users']], showSuccessToast: true }
  );
  const { mutate: unblockUser } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/unblock`,
    { invalidateKeys: [['users']], showSuccessToast: true }
  );
  const { mutate: activateUser } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/activate`,
    { invalidateKeys: [['users']], showSuccessToast: true }
  );
  const { mutate: deactivateUser } = useApiMutation(
    'patch',
    (id: string) => `/iam/users/${id}/deactivate`,
    { invalidateKeys: [['users']], showSuccessToast: true }
  );
  const { mutate: deleteUser } = useApiMutation(
    'delete',
    (id: string) => `/iam/users/${id}`,
    { invalidateKeys: [['users']], showSuccessToast: true }
  );

  const handleAction = () => {
    if (!selectedUser || !dialogAction) return;

    if (dialogAction === 'unblock')
      unblockUser({}, { onSuccess: () => setSelectedUser(null) });
    if (dialogAction === 'activate')
      activateUser({}, { onSuccess: () => setSelectedUser(null) });
    if (dialogAction === 'deactivate')
      deactivateUser({}, { onSuccess: () => setSelectedUser(null) });
    if (dialogAction === 'delete')
      deleteUser({}, { onSuccess: () => setSelectedUser(null) });

    setDialogAction(null);
  };

  const handleBlockConfirm = (reason: string) => {
    if (!selectedUser) return;
    blockUser({ reason } as any, {
      onSuccess: () => {
        setIsBlockOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const handleCreateSubmit = (data: any) => {
    createUser(data, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name || row.original.displayId || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telefone/Email',
      cell: ({ row }) => (
        <div className="text-sm text-slate-500">
          {row.original.phone || row.original.email || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue('role')}
        </Badge>
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
        const user = row.original;

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
                  setSelectedUser(user);
                  setIsDetailsOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setIsViewBalanceOpen(true);
                }}
              >
                <WalletIcon className="mr-2 h-4 w-4" /> Ver Saldo
              </DropdownMenuItem>

              {user.isBlocked ? (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialogAction('unblock');
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{' '}
                  Desbloquear
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setIsBlockOpen(true);
                  }}
                >
                  <Ban className="mr-2 h-4 w-4 text-red-600" /> Bloquear
                </DropdownMenuItem>
              )}

              {user.isActive ? (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialogAction('deactivate');
                  }}
                >
                  <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" />{' '}
                  Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setDialogAction('activate');
                  }}
                >
                  <ShieldOff className="mr-2 h-4 w-4 text-green-600" /> Ativar
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedUser(user);
                  setDialogAction('delete');
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const getDialogContent = () => {
    switch (dialogAction) {
      case 'unblock':
        return {
          title: 'Desbloquear Utilizador',
          desc: `Deseja remover o bloqueio de ${selectedUser?.name}?`,
          dest: false,
        };
      case 'activate':
        return {
          title: 'Ativar Utilizador',
          desc: `Deseja ativar a conta de ${selectedUser?.name}?`,
          dest: false,
        };
      case 'deactivate':
        return {
          title: 'Desativar Utilizador',
          desc: `Deseja desativar temporariamente ${selectedUser?.name}?`,
          dest: true,
        };
      case 'delete':
        return {
          title: 'Eliminar Utilizador',
          desc: `Atenção! Esta ação eliminará ${selectedUser?.name} do sistema.`,
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
          <h1 className="text-2xl font-bold tracking-tight">Utilizadores</h1>
          <p className="text-sm text-slate-500">
            Faça a gestão dos utilizadores registados na plataforma.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>Novo Utilizador</Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={8} />
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

      <BlockUserDialog
        open={isBlockOpen}
        onOpenChange={setIsBlockOpen}
        userName={selectedUser?.name || selectedUser?.displayId || 'Utilizador'}
        onConfirm={handleBlockConfirm}
        isLoading={isBlocking}
      />

      <UserDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        userId={selectedUser?.id || null}
      />

      <UserModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />

      <ViewBalanceModal
        open={isViewBalanceOpen}
        onOpenChange={setIsViewBalanceOpen}
        userName={selectedUser?.name || ''}
        balance={selectedUser?.wallet?.balance || 0}
        currency={selectedUser?.wallet?.currency || 'AKZ'}
      />
    </div>
  );
}
