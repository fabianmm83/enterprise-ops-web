import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, LogIn } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          {...register('email')}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:border-sky-400/60 focus:bg-white/[0.05] transition-all duration-300 outline-none"
        />
        {errors.email && (
          <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 focus:border-sky-400/60 focus:bg-white/[0.05] transition-all duration-300 outline-none"
        />
        {errors.password && (
          <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {login.isError && (
        <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-sm text-red-300">
          Credenciales inválidas. Verifica tu email y contraseña.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || login.isPending}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 text-[#0b1220] font-semibold hover:shadow-lg hover:shadow-sky-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {login.isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Iniciar sesión
          </>
        )}
      </button>
    </form>
  );
}