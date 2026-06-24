import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function BlockUserDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isLoading,
}: BlockUserDialogProps) {
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bloquear Utilizador</DialogTitle>
          <DialogDescription>
            Tem a certeza que deseja bloquear <strong>{userName}</strong>? Por
            favor, indique um motivo para esta acção.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Bloqueio</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Violação das regras de conduta"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'A Bloquear...' : 'Bloquear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
