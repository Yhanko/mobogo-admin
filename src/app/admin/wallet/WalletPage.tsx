import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet as WalletIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { TopupWithdrawModal } from './components/TopupWithdrawModal';
import { GlobalTopupModal } from './components/GlobalTopupModal';
import { ViewBalanceModal } from './components/ViewBalanceModal';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  wallet: { balance: number; currency: string; user: { name: string; phone: string } };
  createdAt: string;
  reference: string;
};

type Wallet = {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  user: { name: string; phone: string; role: string };
};

const TYPE_MAP: Record<string, string> = {
  TOPUP: 'Recarga',
  PAYMENT: 'Pagamento de Ticket',
  WITHDRAWAL: 'Levantamento',
  REFUND: 'Reembolso',
  TRANSFER_IN: 'Transferência Recebida',
  TRANSFER_OUT: 'Transferência Enviada',
};

export function WalletPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGlobalTopupOpen, setIsGlobalTopupOpen] = useState(false);
  const [isViewBalanceOpen, setIsViewBalanceOpen] = useState(false);

  const { data: txData, isLoading: txLoading } = useApiQuery<{
    data: Transaction[];
    meta: any;
  }>(['wallet-history'], '/wallet/transactions');
  const { data: walletsData, isLoading: walletsLoading } = useApiQuery<{
    data: Wallet[];
    meta: any;
  }>(['wallets'], '/wallet/all');

  const { mutate: doTopup, isPending: isTopuping } = useApiMutation(
    'post',
    (vars: { id: string; data: any }) => `/wallet/admin/${vars.id}/topup`,
    {
      invalidateKeys: [['wallets'], ['wallet-history']],
      showSuccessToast: true,
    }
  );
  const { mutate: doWithdraw, isPending: isWithdrawing } = useApiMutation(
    'post',
    (vars: { id: string; data: any }) => `/wallet/admin/${vars.id}/withdraw`,
    {
      invalidateKeys: [['wallets'], ['wallet-history']],
      showSuccessToast: true,
    }
  );

  const handleActionSubmit = (
    action: 'topup' | 'withdraw',
    amount: number,
    reference?: string
  ) => {
    if (!selectedWallet) return;

    const dto = { amount, reference: reference || undefined };
    const options = { onSuccess: () => setIsModalOpen(false) };

    if (action === 'topup') {
      doTopup({ id: selectedWallet.userId, data: dto } as any, options);
    } else {
      doWithdraw({ id: selectedWallet.userId, data: dto } as any, options);
    }
  };

  const handleGlobalTopupSubmit = (userId: string, amount: number, reference?: string) => {
    const dto = { amount, reference: reference || undefined };
    doTopup({ id: userId, data: dto } as any, { onSuccess: () => setIsGlobalTopupOpen(false) });
  };

  const txColumns: ColumnDef<Transaction>[] = [
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
      accessorKey: 'user',
      header: 'Utilizador',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.wallet?.user?.name || 'N/A'}
          </div>
          <div className="text-xs text-slate-500">
            {row.original.wallet?.user?.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Operação',
      cell: ({ row }) => {
        const type = row.original.type;
        const isCredit = row.original.balanceAfter > row.original.balanceBefore;
        
        let label = TYPE_MAP[type] || type;
        if (type === 'PAYMENT') {
          label = isCredit ? 'Recebimento (Entrada)' : 'Pagamento (Saída)';
        } else if (isCredit) {
          label += ' (Entrada)';
        } else {
          label += ' (Saída)';
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium">{label}</span>
            <span className="text-xs text-slate-500 font-mono">
              {row.original.reference || 'Sem Ref.'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => {
        const type = row.original.type;
        const isCredit = row.original.balanceAfter > row.original.balanceBefore;
        const color = isCredit ? 'text-green-600' : 'text-red-600';
        const sign = isCredit ? '+' : '-';
        return (
          <span className={`font-mono font-bold ${color}`}>
            {sign} {row.original.amount} AKZ
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-blue-600"
          onClick={() => {
            setSelectedWallet({
              id: row.original.wallet.id || '',
              userId: '',
              balance: row.original.wallet.balance,
              currency: row.original.wallet.currency || 'AKZ',
              user: {
                name: row.original.wallet.user?.name,
                phone: row.original.wallet.user?.phone,
                role: ''
              }
            } as Wallet);
            setIsViewBalanceOpen(true);
          }}
        >
          <Eye className="w-4 h-4 mr-2" /> Ver Saldo Atual
        </Button>
      ),
    },
  ];

  const walletColumns: ColumnDef<Wallet>[] = [
    {
      accessorKey: 'user',
      header: 'Utilizador',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.user?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">
            {row.original.user?.phone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Tipo de Conta',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.user?.role}</Badge>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Saldo Atual',
      cell: () => (
        <span className="font-mono font-bold text-slate-400">
          ****
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedWallet(row.original);
              setIsViewBalanceOpen(true);
            }}
          >
            <Eye className="w-4 h-4 mr-2" /> Ver Saldo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedWallet(row.original);
              setIsModalOpen(true);
            }}
          >
            <WalletIcon className="w-4 h-4 mr-2" /> Ajustar Saldo
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão Financeira
          </h1>
          <p className="text-sm text-slate-500">
            Histórico de transações e saldos das carteiras digitais.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsGlobalTopupOpen(true)}>
            <WalletIcon className="w-4 h-4 mr-2" /> Carregar Carteira
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="transactions">Histórico Global</TabsTrigger>
          <TabsTrigger value="wallets">Saldos (Carteiras)</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {txLoading ? (
            <TableSkeleton columns={6} rows={8} />
          ) : (
            <DataTable
              columns={txColumns}
              data={(txData as any)?.items || (txData as any)?.data || []}
              searchKey="type"
            />
          )}
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          {walletsLoading ? (
            <TableSkeleton columns={4} rows={8} />
          ) : (
            <DataTable
              columns={walletColumns}
              data={
                (walletsData as any)?.items || (walletsData as any)?.data || []
              }
              searchKey="user"
            />
          )}
        </TabsContent>
      </Tabs>

      <TopupWithdrawModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleActionSubmit}
        userName={selectedWallet?.user?.name || ''}
        isLoading={isTopuping || isWithdrawing}
      />
      
      <GlobalTopupModal
        open={isGlobalTopupOpen}
        onOpenChange={setIsGlobalTopupOpen}
        onSubmit={handleGlobalTopupSubmit}
        isLoading={isTopuping}
      />

      <ViewBalanceModal
        open={isViewBalanceOpen}
        onOpenChange={setIsViewBalanceOpen}
        userName={selectedWallet?.user?.name || ''}
        balance={selectedWallet?.balance || 0}
        currency={selectedWallet?.currency || 'AKZ'}
      />
    </div>
  );
}
