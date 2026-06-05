'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileNavItems = [
  {
    href: '/dashboard',
    label: 'Início',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/clients',
    label: 'Clientes',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/today',
    label: 'Alertas',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    href: '/action-plans',
    label: 'Planos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="mobile-nav" role="navigation" aria-label="Navegação mobile">
      {mobileNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          id={`mobile-nav-${item.href.replace('/', '')}`}
          className={`mobile-nav-item ${isActive(item.href) ? 'mobile-nav-item-active' : ''}`}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </Link>
      ))}

      <style jsx>{`
        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: stretch;
          height: 64px;
          z-index: 50;
          padding: 0 4px;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .mobile-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: #94a3b8;
          text-decoration: none;
          padding: 8px 4px;
          border-radius: 8px;
          margin: 4px 2px;
          transition: color 0.15s ease, background 0.15s ease;
          min-width: 0;
        }

        .mobile-nav-item:hover {
          color: #475569;
          background: #f8fafc;
        }

        .mobile-nav-item-active {
          color: #2563eb;
        }

        .mobile-nav-item-active .mobile-nav-icon {
          background: #eff6ff;
          border-radius: 8px;
          padding: 4px 12px;
        }

        .mobile-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .mobile-nav-label {
          font-size: 0.65rem;
          font-weight: 600;
          white-space: nowrap;
        }
      `}</style>
    </nav>
  );
}
