'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard',         icon: 'fa-house',          label: 'Dashboard',         roles: ['ADMIN','SUPER_ADMIN'] },
  { href: '/calendario',        icon: 'fa-calendar-days',  label: 'Calendário',        roles: [] },
  { href: '/alunos',            icon: 'fa-user-graduate',  label: 'Alunos',            roles: ['ADMIN','SUPER_ADMIN'] },
  { href: '/turmas',            icon: 'fa-users',          label: 'Turmas',            roles: ['ADMIN','SUPER_ADMIN','PROFESSOR'] },
  { href: '/sessoes',           icon: 'fa-clock',          label: 'Aulas',             roles: ['ADMIN','SUPER_ADMIN','PROFESSOR'] },
  { href: '/coachings',         icon: 'fa-bolt',           label: 'Coachings',         roles: [] },
  { href: '/presencas',         icon: 'fa-check',          label: 'Presenças',         roles: ['ADMIN','SUPER_ADMIN','PROFESSOR'] },
  { href: '/presencas-validar', icon: 'fa-circle-check',   label: 'Validar Presenças', roles: ['ENCARREGADO','ALUNO'] },
  { href: '/eventos',           icon: 'fa-bullhorn',       label: 'Eventos',           roles: ['ADMIN','SUPER_ADMIN','ENCARREGADO'] },
  { href: '/inventario',        icon: 'fa-boxes-stacked',  label: 'Inventário',        roles: ['ADMIN','SUPER_ADMIN','ENCARREGADO'] },
  { href: '/marketplace',       icon: 'fa-store',          label: 'Marketplace',       roles: ['ADMIN','SUPER_ADMIN','ENCARREGADO'] },
  { href: '/pagamentos',        icon: 'fa-euro-sign',      label: 'Pagamentos',        roles: ['ADMIN','SUPER_ADMIN','ENCARREGADO'] },
  { href: '/utilizadores',      icon: 'fa-user-gear',      label: 'Utilizadores',      roles: ['ADMIN','SUPER_ADMIN'] },
  { href: '/notificacoes',      icon: 'fa-bell',           label: 'Notificações',      roles: [] },
];

function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => { setUser(getUser()); }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  const role       = user?.perfil || '';
  const brandTitle = role === 'ENCARREGADO' ? 'Portal do Encarregado' : 'Backoffice';
  const items      = NAV_ITEMS.filter(i => i.roles.length === 0 || i.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-name">ent&apos;<em>artes</em></div>
        <div className="sb-brand-sub">{brandTitle}</div>
      </div>

      <div className="sb-user">
        <div className="sb-avatar">{getInitials(user?.nome)}</div>
        <div>
          <div className="sb-user-name">{user?.nome || '—'}</div>
          <div className="sb-user-role">{user?.perfil || '—'}</div>
        </div>
      </div>

      <div className="sb-section-label">Menu</div>

      <nav className="sb-nav">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${pathname.startsWith(item.href) ? ' active' : ''}`}
          >
            <i className={`fa-solid ${item.icon}`} />
            {' '}{item.label}
          </Link>
        ))}
      </nav>

      <div className="sb-bottom">
        <button className="sb-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" />
          {' '}Terminar Sessão
        </button>
      </div>
    </aside>
  );
}
