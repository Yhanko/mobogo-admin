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
} from 'lucide-react';
import { TopupWithdrawModal } from './components/TopupWithdrawModal';

import { GlobalTopupModal } from './components/GlobalTopupModal';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  wallet: { user: { name: string; phone: string } };
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
        const isCredit = ['TOPUP', 'PAYMENT', 'TRANSFER_IN', 'REFUND'].includes(
          type
        );

        return (
          <div className="flex flex-col">
            <span className="font-medium">{TYPE_MAP[type] || type}</span>
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
        const isCredit = ['TOPUP', 'PAYMENT', 'TRANSFER_IN', 'REFUND'].includes(
          type
        );
        const color = isCredit ? 'text-green-600' : 'text-red-600';
        const sign = isCredit ? '+' : '-';
        return (
          <span className={`font-mono font-bold ${color}`}>
            {sign} {row.original.amount} AKZ
          </span>
        );
      },
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
      cell: ({ row }) => (
        <span className="font-mono font-bold text-blue-600">
          {row.original.balance} {row.original.currency}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
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
        <Button onClick={() => setIsGlobalTopupOpen(true)}>
          <WalletIcon className="w-4 h-4 mr-2" /> Carregar Carteira
        </Button>
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
            <div>A carregar transações...</div>
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
            <div>A carregar carteiras...</div>
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
    </div>
  );
}
