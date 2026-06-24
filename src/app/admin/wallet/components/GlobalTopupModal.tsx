import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiQuery } from '@/hooks/useApi';
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
  userId: z.string().min(1, 'Selecione o utilizador'),
  amount: z
    .string()
    .min(1, 'Introduza o valor')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Valor inválido',
    }),
  reference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GlobalTopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, amount: number, reference?: string) => void;
  isLoading?: boolean;
}

export function GlobalTopupModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: GlobalTopupModalProps) {
  // Busca apenas utilizadores da plataforma
  const { data, isLoading: loadingUsers } = useApiQuery<{ data: { id: string; name: string; phone: string }[]; items?: any; meta: any }>(
    ['users-for-topup'],
    '/iam/users?limit=100'
  );

  const users = data?.items || data?.data || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      amount: '',
      reference: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ userId: '', amount: '', reference: '' });
    }
  }, [open, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data.userId, Number(data.amount), data.reference);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1a1a1a]">
        <DialogHeader>
          <DialogTitle>Carregar Carteira</DialogTitle>
          <DialogDescription>
            Adicionar saldo à carteira de um passageiro ou utilizador.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utilizador</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-[#1a1a1a]">
                        <SelectValue placeholder={loadingUsers ? "A carregar utilizadores..." : "Selecione o utilizador"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#1a1a1a]">
                      {users.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.phone})
                        </SelectItem>
                      ))}
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
                  <FormLabel>Valor a Carregar (AKZ)</FormLabel>
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
                    Referência / Observação{' '}
                    <span className="text-slate-400 font-normal">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Pagamento Presencial, Depósito"
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isLoading || loadingUsers}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> A
                    Processar...
                  </>
                ) : (
                  'Confirmar Recarga'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
