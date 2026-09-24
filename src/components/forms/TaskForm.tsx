import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { taskStatusOptions, taskPriorityOptions } from '@/components/ui/TaskBadges';
import { api } from '@/lib/api';
import type { Task } from '@/types/task';
import type { Page } from '@/types/api';
import type { Project } from '@/types/project';

const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  description: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(1000, 'Máximo 1000 caracteres'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().min(1, 'Selecciona un proyecto'),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, projectId, onSuccess, onCancel }: TaskFormProps) {
  const isEdit = !!task;
  const lockedProjectId = projectId ?? task?.project?.id;

  const createTask = useCreateTask(lockedProjectId ?? '');
  const updateTask = useUpdateTask();

  const { data: usersData } = useUsers({ size: 100 });
  const users = usersData?.content ?? [];

  const { data: projectsData } = useQuery<Page<Project>>({
    queryKey: ['projects', 'for-task-form'],
    queryFn: async () => {
      const { data } = await api.get<Page<Project>>('/projects?page=0&size=100');
      return data;
    },
    enabled: !lockedProjectId,
  });
  const projects = projectsData?.content ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: null,
      assigneeId: null,
      projectId: lockedProjectId ?? '',
    },
  });

  const selectedProjectId = watch('projectId');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : null,
        assigneeId: task.assignee?.id ?? null,
        projectId: task.project?.id ?? lockedProjectId ?? '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: null,
        assigneeId: null,
        projectId: lockedProjectId ?? '',
      });
    }
  }, [task, reset, lockedProjectId]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || null,
        assigneeId: data.assigneeId || null,
      };

      if (isEdit && task) {
        await updateTask.mutateAsync({ id: task.id, payload });
      } else if (lockedProjectId) {
        await createTask.mutateAsync(payload);
      } else {
        const { data: createdTask } = await api.post<Task>(
          `/projects/${data.projectId}/tasks`,
          payload
        );
        void createdTask;
      }
      onSuccess();
    } catch {
      // Error manejado por React Query
    }
  };

  const isPending = isSubmitting || createTask.isPending || updateTask.isPending;

  const assigneeOptions = [
    { value: '', label: 'Sin asignar' },
    ...users.map((u) => ({
      value: u.id,
      label: `${u.fullName} (${u.email})`,
    })),
  ];

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {!lockedProjectId && !isEdit && (
        <Select
          label="Proyecto"
          options={[
            { value: '', label: 'Selecciona un proyecto...' },
            ...projectOptions,
          ]}
          error={errors.projectId?.message}
          {...register('projectId')}
        />
      )}

      <Input
        label="Título de la tarea"
        placeholder="Ej. Configurar CI/CD en GitHub Actions"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Descripción"
        placeholder="Describe qué hay que hacer..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Estado"
          options={taskStatusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
        <Select
          label="Prioridad"
          options={taskPriorityOptions}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Fecha límite"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />
        <Select
          label="Asignar a"
          options={assigneeOptions}
          error={errors.assigneeId?.message}
          {...register('assigneeId')}
        />
      </div>

      {(createTask.isError || updateTask.isError) && (
        <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-sm text-red-300">
          {(() => {
            const err = (createTask.error ?? updateTask.error) as {
              response?: { status?: number; data?: { message?: string } };
            };
            if (err?.response?.status === 403) {
              return 'No tienes permisos para crear o editar tareas.';
            }
            if (err?.response?.data?.message) {
              return err.response.data.message;
            }
            return 'Error al guardar. Verifica los datos e intenta de nuevo.';
          })()}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isPending}
          disabled={!selectedProjectId}
        >
          {isEdit ? 'Actualizar tarea' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  );
}