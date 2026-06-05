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

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  diretoria: 'Diretoria',
  gerencia: 'Gerência',
  gestor_cliente: 'Gestor',
  colaborador: 'Colaborador',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <header className="mobile-bar">
        <button className="mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="mobile-logo">
          <LogoIcon />
          <span>UP Gestão</span>
        </div>
        <div className="mobile-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
      </header>

      {/* ── OVERLAY ── */}
      {mobileOpen && (
        <div className="overlay" onClick={() => setMobileOpen(false)} role="presentation" />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>

        {/* Brand */}
        <div className="brand">
          <LogoIcon />
          <div className="brand-text">
            <span className="brand-name">UP Gestão</span>
            <span className="brand-sub">Operacional</span>
          </div>
          <button className="close-btn" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Section label */}
        <div className="section-label">NAVEGAÇÃO</div>

        {/* Nav items */}
        <nav className="nav">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.href.replace(/\//g, '') || 'dashboard'}`}
                className={`nav-item${active ? ' nav-item--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge" />}
                {active && <span className="nav-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="footer">
          <div className="user">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'Usuário'}</p>
              <p className="user-role">{roleLabel[user?.role ?? ''] ?? user?.role ?? ''}</p>
            </div>
          </div>
          <button id="btn-logout" onClick={logout} className="logout-btn" title="Sair">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <style jsx>{`
        /* ── MOBILE BAR ── */
        .mobile-bar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          z-index: 50;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }
        .mobile-btn {
          background: none; border: none;
          color: #94a3b8; cursor: pointer;
          padding: 8px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          min-width: 44px; min-height: 44px;
          transition: background 0.15s;
        }
        .mobile-btn:hover { background: rgba(255,255,255,0.08); }
        .mobile-logo {
          display: flex; align-items: center; gap: 8px;
          color: #f1f5f9; font-size: 0.9rem; font-weight: 700;
        }
        .mobile-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: #0ea5e9; color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700;
        }

        /* ── OVERLAY ── */
        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(2px);
          z-index: 45;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 240px;
          background: #0f172a;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          z-index: 46;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── BRAND ── */
        .brand {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .brand-text { flex: 1; }
        .brand-name {
          display: block;
          font-size: 0.9rem; font-weight: 700; color: #f1f5f9;
          line-height: 1.3;
        }
        .brand-sub {
          display: block;
          font-size: 0.6rem; font-weight: 600;
          color: #475569;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .close-btn {
          display: none;
          background: none; border: none;
          color: #475569; cursor: pointer;
          padding: 5px; border-radius: 4px;
          min-width: 28px; min-height: 28px;
          align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .close-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.07); }

        /* ── SECTION LABEL ── */
        .section-label {
          padding: 14px 18px 6px;
          font-size: 0.6rem; font-weight: 700;
          color: #475569;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }

        /* ── NAV ── */
        .nav {
          flex: 1;
          overflow-y: auto;
          padding: 4px 10px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 7px;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          position: relative;
          min-height: 44px;
          transition: background 0.15s, color 0.15s;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
        }

        .nav-item--active {
          background: rgba(14,165,233,0.14);
          color: #38bdf8;
          font-weight: 600;
        }

        .nav-icon {
          display: flex; align-items: center;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .nav-label { flex: 1; }

        .nav-badge {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f59e0b;
          flex-shrink: 0;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .nav-indicator {
          position: absolute;
          right: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 18px;
          background: #0ea5e9;
          border-radius: 2px;
        }

        /* ── FOOTER ── */
        .footer {
          padding: 12px 14px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }
        .user {
          flex: 1; display: flex; align-items: center; gap: 9px;
          min-width: 0;
        }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
        }
        .user-info { min-width: 0; flex: 1; }
        .user-name {
          font-size: 0.8rem; font-weight: 600; color: #e2e8f0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .user-role {
          font-size: 0.67rem; color: #475569; text-transform: capitalize;
        }
        .logout-btn {
          background: none; border: none; color: #475569;
          cursor: pointer; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          min-width: 34px; min-height: 34px;
          transition: color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .logout-btn:hover {
          color: #f87171;
          background: rgba(248,113,113,0.1);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .mobile-bar { display: flex; }
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .close-btn { display: flex; }
        }
      `}</style>
    </>
  );
}

function LogoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0ea5e9" />
      <path d="M8 22L12 10L16 18L20 13L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
