import { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    // TODO: Implement actual logout
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside 
        className={cn(
          "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden md:flex flex-col transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-center h-20">
          <div className={cn("transition-all duration-300 overflow-hidden", isExpanded ? "w-32 opacity-100" : "w-0 opacity-0")}>
            <Logo className="w-32" />
          </div>
          {!isExpanded && (
            <div className="font-bold text-xl text-blue-600">M</div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  !isExpanded && 'justify-center px-0'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn("transition-all duration-300", isExpanded ? "opacity-100" : "w-0 opacity-0 hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          <div className="pt-8 pb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium transition-colors text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
                !isExpanded && "justify-center px-0"
              )}
            >
              {isExpanded ? (
                <>
                  <ChevronLeft className="w-5 h-5 shrink-0" />
                  <span>Recolher</span>
                </>
              ) : (
                <ChevronRight className="w-5 h-5 shrink-0" />
              )}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
              isExpanded ? "justify-start" : "justify-center px-0"
            )}
            onClick={handleLogout}
            title={!isExpanded ? "Sair" : undefined}
          >
            <LogOut className={cn("w-5 h-5 shrink-0", isExpanded && "mr-3")} />
            <span className={cn("transition-all duration-300", isExpanded ? "opacity-100" : "w-0 opacity-0 hidden")}>
              Sair
            </span>
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
