'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

const mainNav = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/today',
    label: 'Hoje preciso olhar',
    badge: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/action-plans',
    label: 'Planos de ação',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: '/followups',
    label: 'Follow-ups',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/teams',
    label: 'Squads',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const bottomNav = [
  {
    href: '/settings',
    label: 'Configurações',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  // ── Style helpers ──
  function navItemStyle(href: string): React.CSSProperties {
    const active = isActive(href);
    const hovered = hoveredHref === href;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: active ? 600 : 500,
      color: active ? '#0284c7' : hovered ? '#1e293b' : '#64748b',
      background: active ? '#e0f2fe' : hovered ? '#f8fafc' : 'transparent',
      transition: 'background 0.15s, color 0.15s',
      minHeight: 40,
      cursor: 'pointer',
      position: 'relative',
    };
  }

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        zIndex: 50, alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', display: 'none',
      }} className="sb-mobile-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          style={{
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
            padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center',
            minWidth: 44, minHeight: 44,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
          <Logo /><span>UP Gestão</span>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#0ea5e9',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 700,
        }}>{initial}</div>
      </header>

      {/* ── BACKDROP ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          role="presentation"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 45, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 200,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        zIndex: 46,
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }} className={mobileOpen ? '' : 'sb-desktop-sidebar'}>

        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 16px 16px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          <Logo />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>UP Gestão</span>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar"
            className="sb-close-btn"
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 4,
              display: 'none', alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Main Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.replace(/\//g, '') || 'dashboard'}`}
              style={navItemStyle(item.href)}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={() => setHoveredHref(item.href)}
              onMouseLeave={() => setHoveredHref(null)}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0,
                }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '0 16px', flexShrink: 0 }} />

        {/* Bottom Nav */}
        <div style={{ padding: '10px 10px 4px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.href.replace(/\//g, '') || 'settings'}`}
              style={navItemStyle(item.href)}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={() => setHoveredHref(item.href)}
              onMouseLeave={() => setHoveredHref(null)}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '0 16px', flexShrink: 0 }} />

        {/* User + Logout */}
        <div style={{ padding: '12px 14px 16px', flexShrink: 0 }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            CONTA ATIVA
          </p>
          <p style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500, marginBottom: 10, wordBreak: 'break-all' }}>
            {user?.name ?? 'Usuário'}
            <br />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
              {roleLabel[user?.role ?? ''] ?? user?.role ?? ''}
            </span>
          </p>
          <button
            id="btn-logout"
            onClick={logout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              color: '#ef4444', fontSize: '0.82rem', fontWeight: 600,
              padding: '6px 0', minHeight: 36,
              transition: 'opacity 0.15s',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .sb-mobile-topbar { display: flex !important; }
          .sb-desktop-sidebar { transform: translateX(-100%); }
          .sb-close-btn { display: flex !important; }
        }
        .sb-desktop-sidebar { transform: translateX(0); }
      `}</style>
    </>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="7" fill="#0ea5e9" />
      <path d="M8 22L12 10L16 18L20 13L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
