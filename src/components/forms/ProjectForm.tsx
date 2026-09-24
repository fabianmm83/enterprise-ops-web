import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import type { Project } from '@/types/project';

const projectSchema = z.object({
  name: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  description: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'ARCHIVED', label: 'Archivado' },
];

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const isEdit = !!project;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate ? project.startDate.split('T')[0] : null,
        endDate: project.endDate ? project.endDate.split('T')[0] : null,
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'ACTIVE',
        startDate: null,
        endDate: null,
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      if (isEdit && project) {
        await updateProject.mutateAsync({ id: project.id, payload });
      } else {
        await createProject.mutateAsync(payload);
      }
      onSuccess();
    } catch {
      // Error manejado por React Query
    }
  };

  const isPending =
    isSubmitting || createProject.isPending || updateProject.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Nombre del proyecto"
        placeholder="Ej. Migración a la nube"
        error={errors.name?.message}
        {...register('name')}
      />

      <Textarea
        label="Descripción"
        placeholder="Describe el objetivo del proyecto..."
        error={errors.description?.message}
        {...register('description')}
      />

      <Select
        label="Estado"
        options={statusOptions}
        error={errors.status?.message}
        {...register('status')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Fecha de inicio"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <Input
          label="Fecha de fin"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />
      </div>

      {(createProject.isError || updateProject.isError) && (
        <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-sm text-red-300">
          Error al guardar. Verifica los datos e intenta de nuevo.
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
          {isEdit ? 'Actualizar' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  );
}