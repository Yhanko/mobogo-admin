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

interface CancelTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function CancelTicketDialog({
  open,
  onOpenChange,
  reference,
  onConfirm,
  isLoading,
}: CancelTicketDialogProps) {
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
          <DialogTitle>Cancelar Ticket</DialogTitle>
          <DialogDescription>
            Tem a certeza que deseja cancelar o ticket{' '}
            <strong>{reference}</strong>? Esta ação não pode ser revertida e o
            passageiro será notificado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Cancelamento</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Emitido por engano"
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
            Manter Ticket
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'A Cancelar...' : 'Cancelar Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
