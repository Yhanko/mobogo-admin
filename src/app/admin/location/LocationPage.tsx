import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/Badge';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';

type ActiveDriver = {
  driverId: string;
  lat: number;
  lng: number;
  status: string; // 'ONLINE', 'IN_RIDE', etc.
  lastUpdatedAt: string;
  driver?: {
    licensePlate: string;
    user: {
      name: string;
      phone: string;
    };
  };
};

export function LocationPage() {
  const { data, isLoading } = useApiQuery<ActiveDriver[]>(['location-drivers'], '/location/drivers/active');

  const columns: ColumnDef<ActiveDriver>[] = [
    {
      accessorKey: 'driver',
      header: 'Motorista',
      cell: ({ row }) => {
        const name = row.original.driver?.user?.name || `Driver ID: ${row.original.driverId.substring(0, 8)}`;
        const phone = row.original.driver?.user?.phone || '';
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-slate-500">{phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'licensePlate',
      header: 'Matrícula',
      cell: ({ row }) => <span className="font-mono">{row.original.driver?.licensePlate || 'N/A'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === 'IN_RIDE') return <Badge className="bg-blue-600">Em Viagem</Badge>;
        return <Badge className="bg-green-600">Online Livre</Badge>;
      },
    },
    {
      accessorKey: 'location',
      header: 'Localização GPS',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4" />
          <span>{row.original.lat.toFixed(4)}, {row.original.lng.toFixed(4)}</span>
        </div>
      ),
    },
    {
      accessorKey: 'lastUpdatedAt',
      header: 'Última Atualização',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.lastUpdatedAt ? format(new Date(row.original.lastUpdatedAt), 'HH:mm:ss') : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monitorização de Frota</h1>
          <p className="text-sm text-slate-500">Visualização em tempo real dos motoristas ativos.</p>
        </div>
      </div>

      {isLoading ? (
        <div>A carregar localizações...</div>
      ) : (
        <DataTable columns={columns} data={data || []} searchKey="driver" />
      )}
    </div>
  );
}
