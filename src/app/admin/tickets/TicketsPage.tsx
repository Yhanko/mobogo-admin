import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { Ban } from 'lucide-react';

type Ticket = {
  id: string;
  reference: string;
  passenger: { name: string; phone: string };
  status: string; // PENDING, USED, CANCELLED
  expiresAt: string;
  price: number;
};

export function TicketsPage() {
  // Using /tickets/my as a placeholder for a global tickets endpoint
  const { data, isLoading } = useApiQuery<{ data: Ticket[], meta: any }>(['tickets'], '/tickets/my');
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { mutate: cancelTicket } = useApiMutation('patch', (id: string) => `/tickets/${id}/cancel`, { invalidateKeys: [['tickets']], showSuccessToast: true });

  const handleCancel = () => {
    if (!selectedTicket) return;
    cancelTicket({ reason: 'Cancelado pelo Super Admin' } as any, { onSuccess: () => setSelectedTicket(null) });
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'reference',
      header: 'Referência',
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('reference')}</span>,
    },
    {
      accessorKey: 'passenger',
      header: 'Passageiro',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.passenger?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">{row.original.passenger?.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) => <span className="font-mono">{row.getValue('price')} AKZ</span>,
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
        if (status === 'USED') return <Badge className="bg-slate-800">Utilizado</Badge>;
        if (status === 'CANCELLED') return <Badge variant="destructive">Cancelado</Badge>;
        return <Badge className="bg-green-600">Pendente</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ticket = row.original;
        if (ticket.status !== 'PENDING') return null;

        return (
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setSelectedTicket(ticket)}>
            <Ban className="w-4 h-4 mr-2" /> Cancelar
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500">Gestão de bilhetes digitais emitidos.</p>
        </div>
        <Button>Emitir Ticket</Button>
      </div>

      {isLoading ? (
        <div>A carregar tickets...</div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="reference" />
      )}

      <ConfirmDialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        title="Cancelar Ticket"
        description={`Tem a certeza que deseja cancelar o ticket ${selectedTicket?.reference}? Esta ação não pode ser revertida.`}
        onConfirm={handleCancel}
        destructive={true}
      />
    </div>
  );
}
