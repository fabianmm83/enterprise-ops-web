import { LoginForm } from '@/components/forms/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#0b1220]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Enterprise Ops Web
          </h1>
          <p className="text-sm text-slate-400">
            Inicia sesión para gestionar tus proyectos y tareas
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.025] border border-white/[0.07] backdrop-blur">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Problemas para acceder? Contacta al administrador.
        </p>
      </div>
    </div>
  );
}