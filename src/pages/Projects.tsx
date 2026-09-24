import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FolderKanban,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { PageSpinner, EmptyState } from '@/components/ui/Spinner';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { auth } from '@/lib/auth';
import type { Project, ProjectStatus } from '@/types/project';

const statusVariant: Record<
  ProjectStatus,
  'success' | 'warning' | 'info' | 'neutral'
> = {
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'info',
  ARCHIVED: 'neutral',
};

const statusLabel: Record<ProjectStatus, string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  ARCHIVED: 'Archivado',
};

export function Projects() {
  const user = auth.getUser();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useProjects({ page, size: 20 });
  const deleteProject = useDeleteProject();

  const handleCreate = () => {
    setEditingProject(undefined);
    setModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de archivar este proyecto?')) return;
    setDeletingId(id);
    try {
      await deleteProject.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(undefined);
  };

  const filteredProjects =
    data?.content.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const errorMessage = (() => {
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
    };
    if (err?.response?.status === 403) {
      return 'No tienes permisos para ver esta lista. Contacta al administrador.';
    }
    if (err?.response?.status === 401) {
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    }
    return err?.response?.data?.message ?? 'Error al cargar proyectos';
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Proyectos
          </h1>
          <p className="text-sm text-slate-400">
            {data
              ? `${data.totalElements} proyecto${data.totalElements !== 1 ? 's' : ''}`
              : 'Cargando...'}
          </p>
        </div>

        {canManage && (
          <Button icon={<Plus size={16} />} onClick={handleCreate}>
            Nuevo proyecto
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Buscar proyectos..."
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
            <div className="w-12 h-12 rounded-full bg-red-400/10 border border-red-400/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <p className="text-sm text-red-400 mb-2">Error al cargar proyectos</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {errorMessage}
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            message={
              search
                ? 'No hay proyectos que coincidan con tu búsqueda'
                : canManage
                  ? 'Aún no hay proyectos. Crea el primero.'
                  : 'No tienes proyectos asignados'
            }
          />
        ) : (
          <Table<Project>
            data={filteredProjects}
            keyExtractor={(p) => p.id}
            columns={[
              {
                key: 'name',
                header: 'Proyecto',
                render: (p) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center flex-shrink-0">
                      <FolderKanban size={14} className="text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-md">
                        {p.description}
                      </p>
                      {p.owner?.fullName && (
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Owner: {p.owner.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: (p) => (
                  <Badge variant={statusVariant[p.status]}>
                    {statusLabel[p.status]}
                  </Badge>
                ),
              },
              {
                key: 'dates',
                header: 'Inicio',
                render: (p) => (
                  <span className="text-xs text-slate-400 font-mono">
                    {p.startDate
                      ? new Date(p.startDate).toLocaleDateString('es-MX')
                      : '—'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: (p) =>
                  canManage ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(p);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        disabled={deletingId === p.id}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                        aria-label="Archivar"
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
        title={editingProject ? 'Editar proyecto' : 'Nuevo proyecto'}
        description={
          editingProject
            ? 'Actualiza los datos del proyecto'
            : 'Completa los datos para crear un nuevo proyecto'
        }
        size="lg"
      >
        <ProjectForm
          project={editingProject}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}