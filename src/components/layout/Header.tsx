import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/auth';
import type { User } from '@/types/auth';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth.clear();
    navigate('/login', { replace: true });
  };

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 sm:px-6 bg-[#0b1220]/85 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Menu mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block">
        <h1 className="text-sm font-medium text-slate-400">
          Panel de administración
        </h1>
      </div>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          aria-label="Menú de usuario"
          aria-expanded={menuOpen}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
            <span className="text-[#0b1220] text-xs font-bold">{initials}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">
              {user.fullName}
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
          </div>
          <ChevronDown
            size={14}
            className={`text-slate-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-[#131c2e] border border-white/[0.08] shadow-2xl shadow-black/40">
            <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1.5">
              <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/20 text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                navigate('/profile');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <UserIcon size={15} />
              Mi perfil
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/[0.06] transition-colors"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}