import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type { UserDetail, UpdateUserRequest, UserRole } from '@/types/user';

interface UseUsersParams {
  page?: number;
  size?: number;
  role?: UserRole;
}

export function useUsers({ page = 0, size = 20, role }: UseUsersParams = {}) {
  return useQuery<Page<UserDetail>>({
    queryKey: ['users', { page, size, role }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
      });
      if (role) params.append('role', role);

      const { data } = await api.get<Page<UserDetail>>(`/users?${params}`);
      return data;
    },
  });
}

export function useUser(id: string | undefined) {
  return useQuery<UserDetail>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get<UserDetail>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateUserRequest }) => {
      const { data } = await api.put<UserDetail>(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}