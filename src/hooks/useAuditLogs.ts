import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type { AuditLog } from '@/types/audit';

interface UseAuditLogsParams {
  page?: number;
  size?: number;
  action?: string;
}

export function useAuditLogs({ page = 0, size = 20, action }: UseAuditLogsParams = {}) {
  return useQuery<Page<AuditLog>>({
    queryKey: ['audit-logs', { page, size, action }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      });
      if (action) params.append('action', action);

      const { data } = await api.get<Page<AuditLog>>(`/audit-logs?${params}`);
      return data;
    },
    // No reintentar si el endpoint no existe (404)
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });
}