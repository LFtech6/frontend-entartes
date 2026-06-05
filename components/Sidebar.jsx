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

function SidebarContent({ user, items, pathname, onLogout, onClose }) {
  const brandTitle = user?.perfil === 'ENCARREGADO' ? 'Portal do Encarregado' : 'Backoffice';

  return (
    <>
      <div className="sb-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="sb-brand-name">ent&apos;<em>artes</em></div>
          <div className="sb-brand-sub">{brandTitle}</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.1rem', padding: 4 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        )}
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
            onClick={onClose}
            className={`nav-link${pathname.startsWith(item.href) ? ' active' : ''}`}
          >
            <i className={`fa-solid ${item.icon}`} />
            {' '}{item.label}
          </Link>
        ))}
      </nav>

      <div className="sb-bottom">
        <button className="sb-logout" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket" />
          {' '}Terminar Sessão
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ menuOpen, setMenuOpen }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => { setUser(getUser()); }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  const role  = user?.perfil || '';
  const items = NAV_ITEMS.filter(i => i.roles.length === 0 || i.roles.includes(role));

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="sidebar">
        <SidebarContent user={user} items={items} pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Drawer mobile */}
      <aside className="sidebar-mobile-drawer" style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <SidebarContent user={user} items={items} pathname={pathname} onLogout={handleLogout} onClose={() => setMenuOpen(false)} />
      </aside>
    </>
  );
}
