import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Wallet as WalletIcon } from 'lucide-react';

interface ViewBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  balance: number;
  currency: string;
}

export function ViewBalanceModal({
  open,
  onOpenChange,
  userName,
  balance,
  currency,
}: ViewBalanceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Saldo Atual</DialogTitle>
          <DialogDescription>
            Carteira digital de <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <WalletIcon className="w-12 h-12" />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-900 font-mono">
              {balance} <span className="text-2xl text-slate-500">{currency}</span>
            </h2>
            <p className="text-sm text-slate-500 mt-2">Valor disponível para operações</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
