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
import { MoreHorizontal, ShieldOff, ShieldAlert, CheckCircle } from 'lucide-react';

type Agent = {
  id: string;
  user: {
    name: string;
    phone: string;
  };
  isActive: boolean;
  dailyLimit: number;
  locationArea: string | null;
};

export function AgentsPage() {
  const { data, isLoading } = useApiQuery<{ data: Agent[], meta: any }>(['agents'], '/iam/agents');
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogAction, setDialogAction] = useState<'activate' | 'deactivate' | null>(null);

  const { mutate: activateAgent } = useApiMutation('patch', (id: string) => `/iam/agents/${id}/activate`, { invalidateKeys: [['agents']], showSuccessToast: true });
  const { mutate: deactivateAgent } = useApiMutation('patch', (id: string) => `/iam/agents/${id}/deactivate`, { invalidateKeys: [['agents']], showSuccessToast: true });

  const handleAction = () => {
    if (!selectedAgent || !dialogAction) return;
    
    if (dialogAction === 'activate') activateAgent({}, { onSuccess: () => setSelectedAgent(null) });
    if (dialogAction === 'deactivate') deactivateAgent({}, { onSuccess: () => setSelectedAgent(null) });
    
    setDialogAction(null);
  };

  const columns: ColumnDef<Agent>[] = [
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
      accessorKey: 'dailyLimit',
      header: 'Limite Diário',
      cell: ({ row }) => <span className="font-mono">{row.getValue('dailyLimit')} AKZ</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const { isActive } = row.original;
        if (!isActive) return <Badge variant="secondary">Inativo</Badge>;
        return <Badge className="bg-green-600">Ativo</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const agent = row.original;

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
              
              {agent.isActive ? (
                <DropdownMenuItem onClick={() => { setSelectedAgent(agent); setDialogAction('deactivate'); }}>
                  <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" /> Desativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { setSelectedAgent(agent); setDialogAction('activate'); }}>
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
      case 'activate': return { title: 'Ativar Agente', desc: `Deseja ativar as permissões do agente ${selectedAgent?.user?.name}?`, dest: false };
      case 'deactivate': return { title: 'Desativar Agente', desc: `Deseja remover as permissões do agente ${selectedAgent?.user?.name}?`, dest: true };
      default: return { title: '', desc: '', dest: false };
    }
  };

  const { title, desc, dest } = getDialogContent();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agentes</h1>
          <p className="text-sm text-slate-500">Gestão dos agentes no terreno e os seus limites de emissão.</p>
        </div>
        <Button>Novo Agente</Button>
      </div>

      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="name" />
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
