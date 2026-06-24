import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  action: z.enum(['topup', 'withdraw']),
  amount: z
    .string()
    .min(1, 'Introduza o valor')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Valor inválido',
    }),
  reference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TopupWithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    action: 'topup' | 'withdraw',
    amount: number,
    reference?: string
  ) => void;
  userName: string;
  isLoading?: boolean;
}

export function TopupWithdrawModal({
  open,
  onOpenChange,
  onSubmit,
  userName,
  isLoading,
}: TopupWithdrawModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: 'topup',
      amount: '',
      reference: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ action: 'topup', amount: '', reference: '' });
    }
  }, [open, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data.action, Number(data.amount), data.reference);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajustar Saldo</DialogTitle>
          <DialogDescription>
            Alterar o saldo da carteira de <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a operação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="topup">Carregar (Crédito)</SelectItem>
                      <SelectItem value="withdraw">
                        Levantar (Débito)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (AKZ)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Referência do Movimento{' '}
                    <span className="text-slate-400 font-normal">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Transf. Multicaixa / Caixa Dinheiro"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Usado para identificar de onde veio ou para onde foi o
                    dinheiro.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> A
                    Processar...
                  </>
                ) : (
                  'Confirmar Operação'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
