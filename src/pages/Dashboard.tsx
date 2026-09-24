import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalProjects?: number;
  activeProjects?: number;
  totalTasks?: number;
  pendingTasks?: number;
  totalUsers?: number;
  activeUsers?: number;
}

export function Dashboard() {
  const user = auth.getUser();

  // Query de stats — ajusta el endpoint cuando exista en tu backend v1
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Cuando tengas un endpoint /dashboard/stats, cambia esto
      // const { data } = await api.get('/dashboard/stats');
      // return data;

      // Por ahora, datos simulados
      return {
        totalProjects: 12,
        activeProjects: 8,
        totalTasks: 47,
        pendingTasks: 23,
        totalUsers: user?.role === 'ADMIN' ? 15 : undefined,
        activeUsers: user?.role === 'ADMIN' ? 12 : undefined,
      };
    },
    enabled: !!user,
  });

  const metrics = [
    {
      label: 'Proyectos activos',
      value: stats?.activeProjects ?? '—',
      total: stats?.totalProjects,
      icon: FolderKanban,
      color: 'sky',
    },
    {
      label: 'Tareas pendientes',
      value: stats?.pendingTasks ?? '—',
      total: stats?.totalTasks,
      icon: CheckSquare,
      color: 'amber',
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            label: 'Usuarios activos',
            value: stats?.activeUsers ?? '—',
            total: stats?.totalUsers,
            icon: Users,
            color: 'emerald',
          },
        ]
      : []),
    {
      label: 'Productividad',
      value: '78%',
      icon: TrendingUp,
      color: 'violet',
    },
  ];

  const colorMap = {
    sky: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1.5">
          Hola, {user?.fullName.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-400">
          Este es tu panel de {user?.role === 'ADMIN' ? 'administración' : 'trabajo'}
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const colors = colorMap[metric.color as keyof typeof colorMap];
          return (
            <div
              key={metric.label}
              className="p-5 rounded-xl bg-white/[0.025] border border-white/[0.07] hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-lg border',
                    colors
                  )}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                {metric.total !== undefined && (
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    /{metric.total}
                  </span>
                )}
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1">
                {metric.value}
              </p>
              <p className="text-xs text-slate-400">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-6 rounded-xl bg-white/[0.025] border border-white/[0.07]">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Actividad reciente
            </h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-sky-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { action: 'Proyecto "Migración" creado', time: 'hace 2h', color: 'sky' },
                { action: 'Tarea asignada a Carlos', time: 'hace 5h', color: 'emerald' },
                { action: 'Usuario nuevo registrado', time: 'hace 1d', color: 'violet' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      item.color === 'sky' && 'bg-sky-400',
                      item.color === 'emerald' && 'bg-emerald-400',
                      item.color === 'violet' && 'bg-violet-400'
                    )}
                  />
                  <p className="text-sm text-slate-300 flex-1">{item.action}</p>
                  <span className="text-xs text-slate-500 font-mono">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Acciones rápidas
          </h2>
          <div className="space-y-2">
            <a
              href="/projects"
              className="block p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-slate-300 hover:text-sky-400 hover:border-sky-400/30 transition-all"
            >
              Ver proyectos
            </a>
            <a
              href="/tasks"
              className="block p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-slate-300 hover:text-sky-400 hover:border-sky-400/30 transition-all"
            >
              Mis tareas
            </a>
            {user?.role === 'ADMIN' && (
              <a
                href="/users"
                className="block p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-slate-300 hover:text-sky-400 hover:border-sky-400/30 transition-all"
              >
                Gestionar usuarios
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}