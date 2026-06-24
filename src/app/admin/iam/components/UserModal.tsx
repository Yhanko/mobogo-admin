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

const createUserSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    role: z.enum([
      'ADMIN',
      'AGENT',
      'DRIVER',
      'PASSENGER',
      'CLIENT',
      'LOTADOR',
    ]),
    phone: z.string().optional(),
    credential: z
      .string()
      .min(4, 'A senha/PIN deve ter pelo menos 4 caracteres'),
  })
  .superRefine((data, ctx) => {
    if (
      data.role !== 'PASSENGER' &&
      (!data.phone || data.phone.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Telefone é obrigatório para este cargo',
        path: ['phone'],
      });
    }
  });

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserFormValues) => void;
  isLoading?: boolean;
}

export function UserModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: UserModalProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      role: 'DRIVER',
      phone: '+244',
      credential: '',
    },
  });

  const selectedRole = form.watch('role');

  React.useEffect(() => {
    if (open) {
      form.reset({ name: '', role: 'DRIVER', phone: '+244', credential: '' });
    }
  }, [open, form]);

  const handleSubmit = (data: CreateUserFormValues) => {
    // Clean up empty phone for passengers
    const submitData = { ...data };
    if (submitData.role === 'PASSENGER' && submitData.phone === '+244') {
      delete submitData.phone;
    }
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Utilizador</DialogTitle>
          <DialogDescription>
            Adicione um novo utilizador ao sistema. As permissões serão
            aplicadas de acordo com o cargo selecionado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo (Role)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRIVER">
                        Taxista / Motorista
                      </SelectItem>
                      <SelectItem value="AGENT">Agente Autorizado</SelectItem>
                      <SelectItem value="LOTADOR">Lotador</SelectItem>
                      <SelectItem value="PASSENGER">Passageiro</SelectItem>
                      <SelectItem value="CLIENT">
                        Cliente Institucional
                      </SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Telefone{' '}
                    {selectedRole === 'PASSENGER' && (
                      <span className="text-slate-400 font-normal">
                        (Opcional)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+244900000000" {...field} />
                  </FormControl>
                  {selectedRole === 'PASSENGER' ? (
                    <FormDescription>
                      Se deixado em branco, será gerado um cartão digital
                      (Display ID).
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credential"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha / PIN</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Para passageiros com cartões (sem telefone), introduza um
                    PIN numérico (ex: 1234).
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> A Criar...
                  </>
                ) : (
                  'Criar Utilizador'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
