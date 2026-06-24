import { useApiQuery } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SettingsPage() {
  const { data: user, isLoading } = useApiQuery<any>(['me'], '/iam/users/me');

  if (isLoading) return <div>A carregar perfil...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Definições da Conta</h1>
        <p className="text-sm text-slate-500">Faça a gestão do seu perfil de Super Administrador e preferências.</p>
      </div>

      <div className="bg-white dark:bg-slate-950 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`} />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-slate-500">{user?.role}</p>
            <div className="mt-4 flex gap-3">
              <Button size="sm">Alterar Foto</Button>
              <Button size="sm" variant="outline">Remover Foto</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Completo</label>
            <Input defaultValue={user?.name} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input defaultValue={user?.email || ''} type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <Input defaultValue={user?.phone || ''} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ID de Exibição</label>
            <Input defaultValue={user?.displayId || ''} disabled className="bg-slate-50" />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button>Guardar Alterações</Button>
        </div>
      </div>

      {/* Secção de Segurança */}
      <div className="bg-white dark:bg-slate-950 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold">Segurança</h2>
          <p className="text-sm text-slate-500">Altere a sua palavra-passe e defina medidas de segurança adicionais.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nova Palavra-passe</label>
            <Input type="password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmar Palavra-passe</label>
            <Input type="password" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline">Atualizar Palavra-passe</Button>
        </div>
      </div>
    </div>
  );
}
