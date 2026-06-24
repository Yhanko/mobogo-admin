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
import { useApiQuery } from '@/hooks/useApi';

const createTicketSchema = z.object({
  passengerId: z.string().min(1, 'Selecione um passageiro'),
  driverId: z.string().min(1, 'Selecione um motorista'),
  amount: z.string().optional(),
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function TicketModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: TicketModalProps) {
  // Query passageiros
  const { data: passengersData, isLoading: isLoadingPassengers } =
    useApiQuery<any>(
      ['users', 'role-passenger'],
      '/iam/users?role=PASSENGER&limit=100',
      { enabled: open }
    );

  // Query motoristas (perfis de taxista)
  const { data: driversData, isLoading: isLoadingDrivers } = useApiQuery<any>(
    ['drivers', 'all'],
    '/iam/drivers?limit=100',
    { enabled: open }
  );

  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      passengerId: '',
      driverId: '',
      amount: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ passengerId: '', driverId: '', amount: '' });
    }
  }, [open, form]);

  const handleSubmit = (data: CreateTicketFormValues) => {
    onSubmit({
      passengerId: data.passengerId,
      driverId: data.driverId,
      amount: data.amount ? Number(data.amount) : undefined,
    });
  };

  const passengers = passengersData?.items || passengersData?.data || [];
  const drivers = driversData?.items || driversData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Emitir Ticket Digital</DialogTitle>
          <DialogDescription>
            Gere um bilhete digital que ficará disponível na carteira do
            passageiro para uso no táxi selecionado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="passengerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passageiro</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingPassengers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingPassengers
                              ? 'A carregar...'
                              : 'Selecione um passageiro'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {passengers.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum passageiro disponível
                        </SelectItem>
                      ) : (
                        passengers.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name || 'Sem Nome'} ({p.phone || p.displayId})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Viatura / Motorista</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingDrivers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingDrivers
                              ? 'A carregar...'
                              : 'Selecione uma viatura'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum motorista disponível
                        </SelectItem>
                      ) : (
                        drivers.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.licensePlate} — {d.user?.name}
                          </SelectItem>
                        ))
                      )}
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
                  <FormLabel>
                    Valor do Ticket (AKZ){' '}
                    <span className="text-slate-400 font-normal">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 150" {...field} />
                  </FormControl>
                  <FormDescription>
                    Se deixado em branco, será aplicado o valor padrão do
                    sistema (150 AKZ).
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
              <Button
                type="submit"
                disabled={
                  isLoading || passengers.length === 0 || drivers.length === 0
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> A
                    Emitir...
                  </>
                ) : (
                  'Emitir Ticket'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
