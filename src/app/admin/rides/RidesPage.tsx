import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

type Ride = {
  id: string;
  ticketId: string;
  driverId: string;
  driver: {
    user: {
      name: string;
    };
    licensePlate: string;
  };
  passengerId: string;
  passenger: {
    name: string;
    phone: string;
  };
  status: string; // STARTED, COMPLETED, CANCELLED
  startedAt: string;
  completedAt: string | null;
  amount: number;
};

export function RidesPage() {
  const { data, isLoading } = useApiQuery<{ data: Ride[], meta: any }>(['rides'], '/rides');

  const columns: ColumnDef<Ride>[] = [
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.startedAt), 'dd/MM/yyyy HH:mm')}
        </span>
      ),
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
      accessorKey: 'driver',
      header: 'Motorista',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.driver?.user?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">{row.original.driver?.licensePlate}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => <span className="font-mono">{row.getValue('amount')} AKZ</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'CANCELLED') return <Badge variant="destructive">Cancelada</Badge>;
        if (status === 'COMPLETED') return <Badge className="bg-green-600">Concluída</Badge>;
        return <Badge className="bg-blue-600">Em curso</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Viagens (Rides)</h1>
          <p className="text-sm text-slate-500">Acompanhe o histórico de viagens em tempo real.</p>
        </div>
      </div>

      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <DataTable columns={columns} data={data?.data || []} searchKey="passenger" />
      )}
    </div>
  );
}
