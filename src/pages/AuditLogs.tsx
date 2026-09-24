import { useState } from 'react';
import {
  ScrollText,
  AlertCircle,
  Search,
  Clock,
  User as UserIcon,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { PageSpinner, EmptyState } from '@/components/ui/Spinner';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type { AuditLog } from '@/types/audit';

const actionVariant = (action: string): 'success' | 'danger' | 'info' | 'warning' | 'neutral' => {
  const upper = action.toUpperCase();
  if (upper.includes('CREATE') || upper.includes('REGISTER')) return 'success';
  if (upper.includes('DELETE') || upper.includes('ARCHIVE')) return 'danger';
  if (upper.includes('UPDATE') || upper.includes('PATCH')) return 'warning';
  if (upper.includes('LOGIN') || upper.includes('LOGOUT')) return 'info';
  return 'neutral';
};

export function AuditLogs() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error } = useAuditLogs({ page, size: 20 });

  const filteredLogs =
    data?.content.filter((log) => {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.userEmail?.toLowerCase().includes(q)
      );
    }) ?? [];

  const errorMessage = (() => {
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
    };
    if (err?.response?.status === 404) {
      return 'El endpoint de auditoría aún no está implementado en el backend.';
    }
    if (err?.response?.status === 403) {
      return 'No tienes permisos para ver los logs de auditoría.';
    }
    if (err?.response?.status === 401) {
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    }
    return err?.response?.data?.message ?? 'Error al cargar los logs';
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Auditoría
          </h1>
          <p className="text-sm text-slate-400">
            {data
              ? `${data.totalElements} registro${data.totalElements !== 1 ? 's' : ''}`
              : 'Cargando...'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Buscar por acción, entidad o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:border-sky-400/60 focus:bg-white/[0.05] transition-all outline-none"
        />
      </div>

      {/* Content */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={20} className="text-amber-400" />
            </div>
            <p className="text-sm text-amber-400 mb-2">Auditoría no disponible</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMessage}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            message={
              search
                ? 'No hay registros que coincidan con tu búsqueda'
                : 'No hay registros de auditoría aún'
            }
          />
        ) : (
          <Table<AuditLog>
            data={filteredLogs}
            keyExtractor={(log) => log.id}
            columns={[
              {
                key: 'action',
                header: 'Acción',
                render: (log) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center flex-shrink-0">
                      <ScrollText size={14} className="text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <Badge variant={actionVariant(log.action)}>
                        {log.action}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {log.entityType}
                        {log.entityId ? ` · ${log.entityId.slice(0, 8)}...` : ''}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'user',
                header: 'Usuario',
                render: (log) => (
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <UserIcon size={12} />
                    {log.userEmail ?? log.userName ?? '—'}
                  </span>
                ),
              },
              {
                key: 'ip',
                header: 'IP',
                render: (log) => (
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Globe size={12} />
                    {log.ipAddress ?? '—'}
                  </span>
                ),
              },
              {
                key: 'timestamp',
                header: 'Fecha',
                render: (log) => (
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-slate-500">
            Página {data.number + 1} de {data.totalPages} · {data.totalElements}{' '}
            registros
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}