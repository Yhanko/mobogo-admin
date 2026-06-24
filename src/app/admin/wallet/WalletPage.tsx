import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type Transaction = {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
  status: string;
};

export function WalletPage() {
  const { data, isLoading } = useApiQuery<{ data: Transaction[], meta: any }>(['wallet-history'], '/wallet/history');

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        if (type === 'CREDIT') {
          return (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Crédito
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <ArrowDownRight className="w-3 h-3 mr-1" /> Débito
          </Badge>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const color = type === 'CREDIT' ? 'text-green-600' : 'text-red-600';
        const sign = type === 'CREDIT' ? '+' : '-';
        return (
          <span className={`font-mono font-bold ${color}`}>
            {sign} {row.original.amount} AKZ
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'COMPLETED') return <Badge className="bg-slate-800">Concluído</Badge>;
        if (status === 'PENDING') return <Badge variant="secondary">Pendente</Badge>;
        return <Badge variant="destructive">Falhou</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carteira & Transações</h1>
          <p className="text-sm text-slate-500">Histórico de carregamentos, levantamentos e pagamentos.</p>
        </div>
      </div>

      {isLoading ? (
        <div>A carregar transações...</div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="description" />
      )}
    </div>
  );
}
