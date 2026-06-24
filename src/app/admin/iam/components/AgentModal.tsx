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

const createAgentSchema = z.object({
  userId: z.string().min(1, 'Selecione um utilizador'),
  dailyTicketLimit: z.coerce.number().min(1, 'O limite deve ser no mínimo 1').max(1000, 'O limite máximo é 1000').optional(),
});

type CreateAgentFormValues = z.infer<typeof createAgentSchema>;

interface AgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgentFormValues) => void;
  isLoading?: boolean;
}

export function AgentModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AgentModalProps) {
  // Buscar utilizadores com a role AGENT para popular o select
  const { data: usersData, isLoading: isLoadingUsers } = useApiQuery<any>(
    ['users', 'role-agent'],
    '/iam/users?role=AGENT&limit=50',
    { enabled: open }
  );

  const form = useForm<CreateAgentFormValues>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      userId: '',
      dailyTicketLimit: 100,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        userId: '',
        dailyTicketLimit: 100,
      });
    }
  }, [open, form]);

  const handleSubmit = (data: CreateAgentFormValues) => {
    onSubmit(data);
  };

  const users = usersData?.items || usersData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associar Perfil de Agente</DialogTitle>
          <DialogDescription>
            Selecione uma conta de utilizador (Agente) existente para ativar
            os seus limites e permissões de emissão.
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
                              : 'Selecione um agente'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhum agente disponível
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
                    Apenas utilizadores com o cargo de "Agente Autorizado"
                    aparecem aqui.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyTicketLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite Diário de Emissão (Bilhetes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
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
              <Button type="submit" disabled={isLoading || users.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> A Guardar...
                  </>
                ) : (
                  'Guardar Agente'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
