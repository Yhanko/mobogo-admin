import { useState } from 'react';
import { useApiQuery } from '@/hooks/useApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Users,
  Ticket,
  Car,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Tipagem da API Backend (/reports/system)
interface SystemReport {
  period: { start: string; end: string };
  tickets: Array<{ status: string; count: number; total: number }>;
  transactions: Array<{ type: string; count: number; total: number }>;
  activeDrivers: number;
  newUsers: number;
}

const COLORS = {
  PENDING: '#eab308', // Amarelo
  USED: '#22c55e', // Verde
  CANCELLED: '#ef4444', // Vermelho
  EXPIRED: '#64748b', // Cinza
};

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Pendentes',
  USED: 'Utilizados',
  CANCELLED: 'Cancelados',
  EXPIRED: 'Expirados',
};

export function DashboardPage() {
  const [period, setPeriod] = useState<string>('day');

  const { data: report, isLoading } = useApiQuery<SystemReport>(
    ['reports-system', period],
    `/reports/system?period=${period}`
  );

  // Helper para somar totals de tickets
  const totalTickets =
    report?.tickets.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const usedTicketsTotal =
    report?.tickets.find((t) => t.status === 'USED')?.total || 0;

  // Prepara dados para o gráfico circular (Tickets por Status)
  const pieData =
    report?.tickets.map((t) => ({
      name: STATUS_MAP[t.status] || t.status,
      value: t.count,
      color: COLORS[t.status as keyof typeof COLORS] || '#000',
    })) || [];

  // Prepara dados para transações (Entradas vs Saídas)
  const topups =
    report?.transactions.find((t) => t.type === 'TOPUP')?.total || 0;
  const withdrawals =
    report?.transactions.find((t) => t.type === 'WITHDRAWAL')?.total || 0;

  const txData = [
    { name: 'Carregamentos', total: topups, fill: '#22c55e' },
    { name: 'Levantamentos', total: withdrawals, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Central
          </h1>
          <p className="text-slate-500">
            Visão geral do desempenho e saúde do sistema MobGo.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border rounded-md p-1 shadow-sm">
          <Filter className="w-4 h-4 ml-2 text-slate-500" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] border-0 focus:ring-0 shadow-none bg-transparent">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Cartões Estatísticos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Faturação (Corridas)
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {usedTicketsTotal.toLocaleString()} AKZ
                  </h3>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Total de bilhetes consumidos.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Bilhetes Emitidos
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{totalTickets}</h3>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                No período selecionado.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Motoristas no Activo
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {report?.activeDrivers}
                  </h3>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                  <Car className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Tiveram atividade neste período.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Novos Utilizadores
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    +{report?.newUsers}
                  </h3>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Contas criadas recentemente.
              </p>
            </div>
          </div>

          {/* Gráficos e Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1: Tickets */}
            <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm p-6">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" /> Estado dos
                  Bilhetes
                </h3>
              </div>
              {pieData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => [
                          `${value} Tickets`,
                          'Quantidade',
                        ]}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 italic">
                  Sem dados para apresentar.
                </div>
              )}
            </div>

            {/* Gráfico 2: Fluxo Financeiro */}
            <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-500" /> Fluxo de
                  Carteiras (AKZ)
                </h3>
              </div>
              {topups > 0 || withdrawals > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={txData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.3}
                      />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          `${value.toLocaleString()} AKZ`,
                          'Valor Total',
                        ]}
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Bar
                        dataKey="total"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 italic">
                  Nenhuma transação registada.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
