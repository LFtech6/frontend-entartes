'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function MainLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/');
  }, [router]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-wrapper">
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
