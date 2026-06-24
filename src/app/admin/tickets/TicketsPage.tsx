import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { Ban } from 'lucide-react';
import { TicketModal } from './components/TicketModal';
import { CancelTicketDialog } from './components/CancelTicketDialog';

type Ticket = {
  id: string;
  reference: string;
  passenger: { name: string; phone: string };
  status: string; // PENDING, USED, CANCELLED
  expiresAt: string;
  price: number;
};

export function TicketsPage() {
  const { data, isLoading } = useApiQuery<{ data: Ticket[]; meta: any }>(
    ['tickets'],
    '/tickets'
  );

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { mutate: createTicket, isPending: isCreating } = useApiMutation(
    'post',
    '/tickets',
    { invalidateKeys: [['tickets']], showSuccessToast: true }
  );
  const { mutate: cancelTicket, isPending: isCanceling } = useApiMutation(
    'patch',
    (id: string) => `/tickets/${id}/cancel`,
    { invalidateKeys: [['tickets']], showSuccessToast: true }
  );

  const { mutate: simulateScan, isPending: isSimulating } = useApiMutation(
    'post',
    (id: string) => `/tickets/admin/${id}/simulate-scan`,
    { invalidateKeys: [['tickets'], ['wallet-history'], ['wallets']], showSuccessToast: true }
  );

  const handleCancelConfirm = (reason: string) => {
    if (!selectedTicket) return;
    cancelTicket({ reason } as any, {
      onSuccess: () => {
        setIsCancelOpen(false);
        setSelectedTicket(null);
      },
    });
  };

  const handleCreateSubmit = (data: any) => {
    createTicket(data, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'reference',
      header: 'Referência',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue('reference')}</span>
      ),
    },
    {
      accessorKey: 'passenger',
      header: 'Passageiro',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.passenger?.name || 'N/A'}
          </div>
          <div className="text-xs text-slate-500">
            {row.original.passenger?.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => (
        <span className="font-mono">{row.getValue('price')} AKZ</span>
      ),
    },
    {
      accessorKey: 'expiresAt',
      header: 'Expira Em',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.expiresAt), 'dd/MM/yyyy HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'USED')
          return <Badge className="bg-slate-800">Utilizado</Badge>;
        if (status === 'CANCELLED')
          return <Badge variant="destructive">Cancelado</Badge>;
        return <Badge className="bg-green-600">Pendente</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ticket = row.original;
        if (ticket.status !== 'PENDING') return null;

        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => simulateScan(ticket.id as any)}
              disabled={isSimulating}
            >
              Simular Scan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setSelectedTicket(ticket);
                setIsCancelOpen(true);
              }}
            >
              <Ban className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500">
            Gestão de bilhetes digitais emitidos.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>Emitir Ticket</Button>
      </div>

      {isLoading ? (
        <div>A carregar tickets...</div>
      ) : (
        <DataTable
          columns={columns}
          data={(data as any)?.items || (data as any)?.data || []}
          searchKey="reference"
        />
      )}

      <CancelTicketDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        reference={selectedTicket?.reference || ''}
        onConfirm={handleCancelConfirm}
        isLoading={isCanceling}
      />

      <TicketModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
}
