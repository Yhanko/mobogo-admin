import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useApiQuery } from '@/hooks/useApi';
import { Users, Car, MapPin, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockChartData = [
  { name: 'Seg', rides: 400, revenue: 2400 },
  { name: 'Ter', rides: 300, revenue: 1398 },
  { name: 'Qua', rides: 200, revenue: 9800 },
  { name: 'Qui', rides: 278, revenue: 3908 },
  { name: 'Sex', rides: 189, revenue: 4800 },
  { name: 'Sáb', rides: 239, revenue: 3800 },
  { name: 'Dom', rides: 349, revenue: 4300 },
];

function MetricCard({ title, value, icon: Icon, trend, trendValue }: any) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend === 'up' ? (
          <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" /> {trendValue}
          </span>
        ) : (
          <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
            <ArrowDownRight className="w-3 h-3 mr-1" /> {trendValue}
          </span>
        )}
        <span className="text-slate-500 ml-2">vs último mês</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  // These endpoints might not exist with these exact URLs, using placeholders that the API should ideally provide
  // const { data: stats } = useApiQuery(['stats'], '/reporting/summary');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Central</h1>
        <p className="text-sm text-slate-500">Bem-vindo ao centro de controlo MobGo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Utilizadores Ativos" value="12,450" icon={Users} trend="up" trendValue="+14%" />
        <MetricCard title="Viagens Realizadas" value="8,234" icon={Car} trend="up" trendValue="+8%" />
        <MetricCard title="Transações (AKZ)" value="4.2M" icon={Wallet} trend="down" trendValue="-2%" />
        <MetricCard title="Taxistas Online" value="342" icon={MapPin} trend="up" trendValue="+24%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Viagens */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Viagens nos últimos 7 dias</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="rides" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Receitas */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Receita (AKZ)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
