import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Page } from '@/types/api';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  TaskStatus,
} from '@/types/task';

interface UseTasksParams {
  page?: number;
  size?: number;
  status?: TaskStatus;
  projectId?: string;
}

// Tareas de un proyecto específico
export function useProjectTasks(projectId: string | undefined, { page = 0, size = 20 }: UseTasksParams = {}) {
  return useQuery<Page<Task>>({
    queryKey: ['tasks', 'project', projectId, { page, size }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      const { data } = await api.get<Page<Task>>(`/projects/${projectId}/tasks?${params}`);
      return data;
    },
    enabled: !!projectId,
  });
}

// Mis tareas (asignadas a mí)
export function useMyTasks({ page = 0, size = 20 }: UseTasksParams = {}) {
  return useQuery<Page<Task>>({
    queryKey: ['tasks', 'me', { page, size }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      const { data } = await api.get<Page<Task>>(`/tasks/me?${params}`);
      return data;
    },
  });
}

export function useTask(id: string | undefined) {
  return useQuery<Task>({
    queryKey: ['task', id],
    queryFn: async () => {
      const { data } = await api.get<Task>(`/tasks/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskRequest) => {
      const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTaskRequest }) => {
      const { data } = await api.put<Task>(`/tasks/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const payload: UpdateTaskStatusRequest = { status };
      const { data } = await api.patch<Task>(`/tasks/${id}/status`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}