import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateUser } from '@/hooks/useUsers';
import type { UserDetail } from '@/types/user';

const userSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
  active: z.enum(['true', 'false']),
});

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user: UserDetail;
  onSuccess: () => void;
  onCancel: () => void;
}

const roleOptions = [
  { value: 'USER', label: 'Usuario' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Administrador' },
];

const activeOptions = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
];

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: String(user.active) as 'true' | 'false',
    },
  });

  useEffect(() => {
    reset({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: String(user.active) as 'true' | 'false',
    });
  }, [user, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        payload: {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          active: data.active === 'true',
        },
      });
      onSuccess();
    } catch {
      // Error manejado por React Query
    }
  };

  const isPending = isSubmitting || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Nombre completo"
        placeholder="Ej. Juan Pérez"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="usuario@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Rol"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />
        <Select
          label="Estado"
          options={activeOptions}
          error={errors.active?.message}
          {...register('active')}
        />
      </div>

      {updateUser.isError && (
        <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-sm text-red-300">
          {(() => {
            const err = updateUser.error as {
              response?: { status?: number; data?: { message?: string } };
            };
            if (err?.response?.status === 403) {
              return 'No tienes permisos para editar usuarios.';
            }
            if (err?.response?.data?.message) {
              return err.response.data.message;
            }
            return 'Error al guardar. Intenta de nuevo.';
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
        <Button type="submit" loading={isPending}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}