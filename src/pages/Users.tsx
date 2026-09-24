import { useState } from 'react';
import {
  Pencil,
  Trash2,
  Search,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { PageSpinner, EmptyState } from '@/components/ui/Spinner';
import { UserForm } from '@/components/forms/UserForm';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import type { UserDetail, UserRole } from '@/types/user';

const roleVariant: Record<UserRole, 'info' | 'warning' | 'neutral'> = {
  ADMIN: 'info',
  MANAGER: 'warning',
  USER: 'neutral',
};

const roleLabel: Record<UserRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'Usuario',
};

export function Users() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetail | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useUsers({
    page,
    size: 20,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
  });
  const deleteUser = useDeleteUser();

  const handleEdit = (user: UserDetail) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
    setDeletingId(id);
    try {
      await deleteUser.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(undefined);
  };

  const filteredUsers =
    data?.content.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const errorMessage = (() => {
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
    };
    if (err?.response?.status === 403) return 'No tienes permisos para ver esta lista.';
    if (err?.response?.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    return err?.response?.data?.message ?? 'Error al cargar usuarios';
  })();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Usuarios
          </h1>
          <p className="text-sm text-slate-400">
            {data
              ? `${data.totalElements} usuario${data.totalElements !== 1 ? 's' : ''} registrado${data.totalElements !== 1 ? 's' : ''}`
              : 'Cargando...'}
          </p>
        </div>
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
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:border-sky-400/60 focus:bg-white/[0.05] transition-all outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | 'ALL');
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white focus:border-sky-400/60 outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-[#0b1220]">Todos los roles</option>
          <option value="ADMIN" className="bg-[#0b1220]">Administrador</option>
          <option value="MANAGER" className="bg-[#0b1220]">Manager</option>
          <option value="USER" className="bg-[#0b1220]">Usuario</option>
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
            <p className="text-sm text-red-400 mb-2">Error al cargar usuarios</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMessage}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            message={
              search || roleFilter !== 'ALL'
                ? 'No hay usuarios que coincidan con tus filtros'
                : 'Aún no hay usuarios registrados'
            }
          />
        ) : (
          <Table<UserDetail>
            data={filteredUsers}
            keyExtractor={(u) => u.id}
            columns={[
              {
                key: 'user',
                header: 'Usuario',
                render: (u) => {
                  const initials = u.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#0b1220] text-xs font-bold">
                          {initials}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'role',
                header: 'Rol',
                render: (u) => (
                  <Badge variant={roleVariant[u.role]}>{roleLabel[u.role]}</Badge>
                ),
              },
              {
                key: 'active',
                header: 'Estado',
                render: (u) =>
                  u.active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 size={12} />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <XCircle size={12} />
                      Inactivo
                    </span>
                  ),
              },
              {
                key: 'createdAt',
                header: 'Registro',
                render: (u) => (
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(u.createdAt).toLocaleDateString('es-MX')}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: (u) => (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(u);
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(u.id);
                      }}
                      disabled={deletingId === u.id}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      aria-label="Desactivar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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

      {/* Modal editar */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Editar usuario"
        description="Actualiza los datos del usuario"
        size="lg"
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
}