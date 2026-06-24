import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  Wallet,
  Ticket,
  UserCog,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/Button';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Utilizadores', href: '/admin/users' },
  { icon: Car, label: 'Motoristas', href: '/admin/drivers' },
  { icon: ShieldCheck, label: 'Agentes', href: '/admin/agents' },
  { icon: UserCog, label: 'Lotadores', href: '/admin/lotadores' },
  { icon: Car, label: 'Viagens', href: '/admin/rides' },
  { icon: MapPin, label: 'Localizações', href: '/admin/location' },
  { icon: Wallet, label: 'Carteira', href: '/admin/wallet' },
  { icon: Ticket, label: 'Tickets', href: '/admin/tickets' },
  { icon: UserCog, label: 'Definições', href: '/admin/settings' },
];

export function AdminLayout() {
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Implement actual logout
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col hidden md:flex">
        <div className="p-6">
          <Logo className="w-32" />
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                A
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
