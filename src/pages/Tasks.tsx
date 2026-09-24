import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckSquare,
  AlertCircle,
  User as UserIcon,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { PageSpinner, EmptyState } from '@/components/ui/Spinner';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  taskStatusOptions,
} from '@/components/ui/TaskBadges';
import { TaskForm } from '@/components/forms/TaskForm';
import { useMyTasks, useDeleteTask, useUpdateTaskStatus } from '@/hooks/useTasks';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { Task, TaskStatus } from '@/types/task';
import type { Page } from '@/types/api';
import type { Project } from '@/types/project';

export function Tasks() {
  const user = auth.getUser();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useMyTasks({ page, size: 20 });
  const deleteTask = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();

  // Necesitamos projects para poder crear tareas (el botón "Nueva tarea" solo se muestra si hay al menos uno)
  const { data: projects } = useQuery<Page<Project>>({
    queryKey: ['projects', 'for-task-form'],
    queryFn: async () => {
      const { data } = await api.get<Page<Project>>('/projects?page=0&size=100');
      return data;
    },
    enabled: canManage,
  });

  const handleCreate = () => {
    setEditingTask(undefined);
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    setDeletingId(id);
    try {
      await deleteTask.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch {
      // Error manejado por React Query
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(undefined);
  };

  const filteredTasks =
    data?.content.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) ?? [];

  const errorMessage = (() => {
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
    };
    if (err?.response?.status === 403)
      return 'No tienes permisos para ver esta lista.';
    if (err?.response?.status === 401)
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    return err?.response?.data?.message ?? 'Error al cargar tareas';
  })();

  const hasProjects = (projects?.content.length ?? 0) > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Mis tareas
          </h1>
          <p className="text-sm text-slate-400">
            {data
              ? `${data.totalElements} tarea${data.totalElements !== 1 ? 's' : ''} asignadas`
              : 'Cargando...'}
          </p>
        </div>

        {canManage && hasProjects && (
          <Button icon={<Plus size={16} />} onClick={handleCreate}>
            Nueva tarea
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:border-sky-400/60 focus:bg-white/[0.05] transition-all outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
          className="px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-sky-400/60 outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-[#0b1220]">
            Todos los estados
          </option>
          {taskStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0b1220]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <PageSpinner />
        ) : isError ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-400/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <p className="text-sm text-red-400 mb-2">Error al cargar tareas</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMessage}</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            message={
              search || statusFilter !== 'ALL'
                ? 'No hay tareas que coincidan con tus filtros'
                : 'No tienes tareas asignadas'
            }
          />
        ) : (
          <Table<Task>
            data={filteredTasks}
            keyExtractor={(t) => t.id}
            columns={[
              {
                key: 'title',
                header: 'Tarea',
                render: (t) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center flex-shrink-0">
                      <CheckSquare size={14} className="text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md">
                        {t.project?.name}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: (t) => (
                  <select
                    value={t.status}
                    onChange={(e) =>
                      handleStatusChange(t.id, e.target.value as TaskStatus)
                    }
                    disabled={updateStatus.isPending}
                    className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs text-white cursor-pointer focus:border-sky-400/60 outline-none disabled:opacity-50"
                  >
                    {taskStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0b1220]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ),
              },
              {
                key: 'priority',
                header: 'Prioridad',
                render: (t) => <TaskPriorityBadge priority={t.priority} />,
              },
              {
                key: 'assignee',
                header: 'Asignada',
                render: (t) => (
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <UserIcon size={12} />
                    {t.assignee?.fullName ?? '—'}
                  </span>
                ),
              },
              {
                key: 'dueDate',
                header: 'Vence',
                render: (t) => (
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar size={12} />
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString('es-MX')
                      : '—'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: (t) =>
                  canManage ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(t);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        disabled={deletingId === t.id}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : null,
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

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Editar tarea' : 'Nueva tarea'}
        description={
          editingTask
            ? 'Actualiza los datos de la tarea'
            : 'Completa los datos para crear una nueva tarea'
        }
        size="lg"
      >
        <TaskForm
          task={editingTask}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}