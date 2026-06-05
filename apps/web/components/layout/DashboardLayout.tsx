'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';

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
        <div className="loading-ring">
          <div />
          <div />
          <div />
          <div />
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
          }
          .loading-ring {
            display: inline-block;
            position: relative;
            width: 48px;
            height: 48px;
          }
          .loading-ring div {
            box-sizing: border-box;
            display: block;
            position: absolute;
            width: 38px;
            height: 38px;
            margin: 5px;
            border: 3px solid transparent;
            border-top-color: #0ea5e9;
            border-radius: 50%;
            animation: spin 1.1s cubic-bezier(0.5,0,0.5,1) infinite;
          }
          .loading-ring div:nth-child(1) { animation-delay: -0.3s; }
          .loading-ring div:nth-child(2) { animation-delay: -0.2s; }
          .loading-ring div:nth-child(3) { animation-delay: -0.1s; }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <style jsx>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }
        .main-content {
          flex: 1;
          min-width: 0;
          margin-left: 240px;
          transition: margin-left 0.25s;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding-top: 56px;
          }
        }
      `}</style>
    </div>
  );
}
