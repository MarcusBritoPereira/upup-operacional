'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="mobile-bottom-nav">
        <MobileNav />
      </div>

      <style jsx>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
        }

        .desktop-sidebar {
          display: none;
        }

        .main-content {
          flex: 1;
          min-width: 0;
          padding-bottom: 80px; /* space for mobile nav */
        }

        .mobile-bottom-nav {
          display: block;
        }

        @media (min-width: 1024px) {
          .desktop-sidebar {
            display: block;
            width: 260px;
            flex-shrink: 0;
          }

          .main-content {
            margin-left: 260px;
            padding-bottom: 0;
          }

          .mobile-bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
