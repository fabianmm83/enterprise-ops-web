import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  ScrollText,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/auth';

interface SidebarProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Array<'ADMIN' | 'MANAGER' | 'USER'>;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { to: '/projects', label: 'Proyectos', icon: FolderKanban, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { to: '/tasks', label: 'Tareas', icon: CheckSquare, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { to: '/users', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { to: '/audit-logs', label: 'Auditoría', icon: ScrollText, roles: ['ADMIN'] },
  { to: '/profile', label: 'Mi perfil', icon: User, roles: ['ADMIN', 'MANAGER', 'USER'] },
];

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col',
          'bg-[#131c2e] border-r border-white/[0.06]',
          'transition-transform duration-300 ease-premium',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
              <span className="text-[#0b1220] font-extrabold text-sm">EO</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight truncate">
                Enterprise Ops
              </p>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider truncate">
                v2 · Web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-sky-400/10 text-sky-400 border border-sky-400/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                      )
                    }
                  >
                    <Icon size={17} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">
            Rol
          </p>
          <p className="text-xs text-slate-300 font-medium">{user.role}</p>
        </div>
      </aside>
    </>
  );
}