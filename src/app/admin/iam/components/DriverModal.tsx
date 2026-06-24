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

const createDriverSchema = z.object({
  userId: z.string().min(1, 'Selecione um utilizador'),
  licensePlate: z.string().regex(/^[A-Z]{2}-\d{2}-\d{2}-[A-Z]{2}$/, {
    message: 'Formato inválido. Exemplo: LD-12-34-AB',
  }),
  workDays: z.array(z.number()).min(1, 'Selecione pelo menos um dia'),
});

type CreateDriverFormValues = z.infer<typeof createDriverSchema>;

interface DriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDriverFormValues) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

export function DriverModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: DriverModalProps) {
  // Buscar utilizadores com a role DRIVER para popular o select
  const { data: usersData, isLoading: isLoadingUsers } = useApiQuery<any>(
    ['users', 'role-driver'],
    '/iam/users?role=DRIVER&limit=50',
    { enabled: open }
  );

  const form = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      userId: '',
      licensePlate: '',
      workDays: [1, 2, 3, 4, 5],
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        userId: '',
        licensePlate: '',
        workDays: [1, 2, 3, 4, 5],
      });
    }
  }, [open, form]);

  const handleSubmit = (data: CreateDriverFormValues) => {
    onSubmit(data);
  };

  const users = usersData?.items || usersData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associar Viatura a Motorista</DialogTitle>
          <DialogDescription>
            Selecione uma conta de utilizador (Taxista) existente e associe-lhe
            uma viatura e dias de trabalho.
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
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingUsers
                              ? 'A carregar...'
                              : 'Selecione um motorista'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum motorista disponível
                        </SelectItem>
                      ) : (
                        users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.phone || user.displayId})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Apenas utilizadores com o cargo de "Motorista" aparecem
                    aqui.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="LD-00-00-AA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de Trabalho</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = field.value?.includes(day.id);
                      return (
                        <label
                          key={day.id}
                          className={`flex items-center space-x-2 border p-2 rounded cursor-pointer ${isSelected ? 'bg-primary/10 border-primary text-primary font-medium' : 'hover:bg-slate-50'}`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...(field.value || []), day.id]
                                : (field.value || []).filter(
                                    (id) => id !== day.id
                                  );
                              field.onChange(newValue);
                            }}
                          />
                          <span className="text-sm">{day.label}</span>
                        </label>
                      );
                    })}
                  </div>
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
              <Button type="submit" disabled={isLoading || users.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> A
                    Guardar...
                  </>
                ) : (
                  'Guardar Motorista'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
