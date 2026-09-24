import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail, Shield, Calendar, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { User } from '@/types/auth';

const profileSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const currentUser = auth.getUser();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: currentUser?.fullName ?? '',
      email: currentUser?.email ?? '',
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      fullName: currentUser?.fullName ?? '',
      email: currentUser?.email ?? '',
    });
    setErrorMessage('');
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!currentUser) return;
    try {
      setErrorMessage('');
      setSuccessMessage('');

      const { data: updated } = await api.put<User>(
        `/users/${currentUser.id}`,
        data
      );

      // Actualizar el usuario en localStorage
      auth.setSession(
        auth.getAccessToken() ?? '',
        auth.getRefreshToken() ?? '',
        updated
      );

      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);

      // Recargar después de 1.5s para reflejar cambios en el header
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (error.response?.status === 403) {
        setErrorMessage('No tienes permisos para editar tu perfil.');
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error al guardar los cambios.');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center text-slate-400">
        No hay usuario cargado
      </div>
    );
  }

  const initials = currentUser.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleVariant =
    currentUser.role === 'ADMIN'
      ? 'info'
      : currentUser.role === 'MANAGER'
        ? 'warning'
        : 'neutral';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
          Mi perfil
        </h1>
        <p className="text-sm text-slate-400">
          Administra tu información personal
        </p>
      </div>

      {/* Avatar + summary card */}
      <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07] mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0">
            <span className="text-[#0b1220] text-xl font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white truncate">
              {currentUser.fullName}
            </h2>
            <p className="text-sm text-slate-400 truncate">{currentUser.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={roleVariant}>{currentUser.role}</Badge>
              {currentUser.active && (
                <Badge variant="success">Activo</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="p-6 rounded-xl bg-white/[0.025] border border-white/[0.07]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Información personal
          </h3>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              icon={<UserIcon size={14} />}
              onClick={handleEdit}
            >
              Editar
            </Button>
          )}
        </div>

        {successMessage && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                icon={<X size={14} />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                icon={<Save size={14} />}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UserIcon size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Nombre completo
                </p>
                <p className="text-sm text-white">{currentUser.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Email
                </p>
                <p className="text-sm text-white break-all">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Rol
                </p>
                <p className="text-sm text-white">{currentUser.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Miembro desde
                </p>
                <p className="text-sm text-white">
                  {new Date(currentUser.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}