'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/');
  }, [router]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* overlay escuro no mobile quando menu aberto */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
        />
      )}

      <div className="main-wrapper">
        {/* topbar mobile com hamburger */}
        <div className="topbar-mobile">
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>
            <i className="fa-solid fa-bars" />
          </button>
          <div className="topbar-brand">ent&apos;<em>artes</em></div>
        </div>

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
