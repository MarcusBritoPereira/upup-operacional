'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/today',
    label: 'Hoje preciso olhar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    badge: true,
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/action-plans',
    label: 'Planos de ação',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/followups',
    label: 'Follow-ups',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/teams',
    label: 'Squads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Configurações',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    diretoria: 'Diretoria',
    gerencia: 'Gerência',
    gestor_cliente: 'Gestor',
    colaborador: 'Colaborador',
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="mobile-brand">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="#0ea5e9" />
            <path d="M8 22L12 10L16 18L20 13L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>UP Gestão</span>
        </div>
        <div className="mobile-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#0ea5e9" />
              <path d="M8 22L12 10L16 18L20 13L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">UP Gestão</span>
            <span className="sidebar-brand-sub">Operacional</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Label */}
        <div className="sidebar-section-label">MENU</div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.replace('/', '')}`}
              className={`sidebar-link ${isActive(item.href) ? 'sidebar-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {item.badge && <span className="sidebar-link-badge" />}
              {isActive(item.href) && <span className="sidebar-link-indicator" />}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name || 'Usuário'}</p>
              <p className="sidebar-user-role">{roleLabel[user?.role || ''] || user?.role || ''}</p>
            </div>
          </div>
          <button
            id="btn-logout"
            onClick={logout}
            className="sidebar-logout"
            title="Sair"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Bottom nav for mobile */}
        <style jsx>{`
          /* ─────────────────────────── MOBILE TOPBAR ─── */
          .mobile-topbar {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: #0f172a;
            z-index: 50;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }

          .mobile-menu-btn {
            background: none;
            border: none;
            color: #cbd5e1;
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            display: flex;
            min-width: 44px;
            min-height: 44px;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
          }
          .mobile-menu-btn:hover { background: rgba(255,255,255,0.08); }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 0.95rem;
            font-weight: 700;
          }

          .mobile-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #0ea5e9;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 700;
          }

          .mobile-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 45;
            backdrop-filter: blur(2px);
          }

          /* ─────────────────────────── SIDEBAR ─── */
          .sidebar {
            width: 240px;
            height: 100vh;
            background: #0f172a;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 46;
            border-right: 1px solid rgba(255,255,255,0.06);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 18px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }

          .sidebar-brand-text {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .sidebar-brand-name {
            font-size: 0.925rem;
            font-weight: 700;
            color: #f8fafc;
            line-height: 1.2;
          }

          .sidebar-brand-sub {
            font-size: 0.65rem;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          .sidebar-close-btn {
            display: none;
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 6px;
            border-radius: 4px;
            min-width: 32px;
            min-height: 32px;
            align-items: center;
            justify-content: center;
            transition: color 0.15s, background 0.15s;
          }
          .sidebar-close-btn:hover { color: white; background: rgba(255,255,255,0.08); }

          .sidebar-section-label {
            padding: 16px 16px 6px;
            font-size: 0.6rem;
            font-weight: 700;
            color: #334155;
            letter-spacing: 0.1em;
          }

          .sidebar-nav {
            flex: 1;
            padding: 4px 10px;
            display: flex;
            flex-direction: column;
            gap: 1px;
            overflow-y: auto;
          }

          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 6px;
            color: #64748b;
            font-size: 0.825rem;
            font-weight: 500;
            transition: all 0.15s ease;
            text-decoration: none;
            position: relative;
            min-height: 44px;
          }

          .sidebar-link:hover {
            background: rgba(255,255,255,0.05);
            color: #e2e8f0;
          }

          .sidebar-link-active {
            background: rgba(14, 165, 233, 0.12);
            color: #38bdf8;
            font-weight: 600;
          }

          .sidebar-link-icon {
            flex-shrink: 0;
            display: flex;
          }

          .sidebar-link-label { flex: 1; }

          .sidebar-link-badge {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #f59e0b;
            animation: blink 2s ease-in-out infinite;
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }

          .sidebar-link-indicator {
            position: absolute;
            right: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 18px;
            background: #0ea5e9;
            border-radius: 2px 0 0 2px;
          }

          .sidebar-footer {
            padding: 12px;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .sidebar-user {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 9px;
            min-width: 0;
          }

          .sidebar-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0ea5e9, #06b6d4);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 700;
            flex-shrink: 0;
          }

          .sidebar-user-info { min-width: 0; flex: 1; }

          .sidebar-user-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sidebar-user-role {
            font-size: 0.67rem;
            color: #475569;
            text-transform: capitalize;
          }

          .sidebar-logout {
            padding: 8px;
            border: none;
            background: none;
            color: #475569;
            cursor: pointer;
            border-radius: 6px;
            display: flex;
            min-width: 34px;
            min-height: 34px;
            align-items: center;
            justify-content: center;
            transition: color 0.15s ease, background 0.15s ease;
            flex-shrink: 0;
          }

          .sidebar-logout:hover {
            color: #f87171;
            background: rgba(248, 113, 113, 0.1);
          }

          /* ─────────────────────────── RESPONSIVE ─── */
          @media (max-width: 768px) {
            .mobile-topbar { display: flex; }
            .mobile-overlay { display: block; }

            .sidebar {
              transform: translateX(-100%);
            }
            .sidebar-open {
              transform: translateX(0);
            }
            .sidebar-close-btn { display: flex; }
          }
        `}</style>
      </aside>
    </>
  );
}
