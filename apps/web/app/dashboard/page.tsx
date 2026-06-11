'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import Link from 'next/link';

interface OverviewData {
  totalActiveClients: number;
  clientsHealthy: number;
  clientsAtRisk: number;
  clientsWithoutFollowup: number;
  overdueActionPlans: number;
  totalPortfolioValue: number;
  riskClientsList: {
    id: string;
    tradeName: string;
    healthStatus: string;
    healthScore: number;
  }[];
}

interface TodayData {
  alerts: {
    id: string;
    clientId: string;
    alertType: string;
    severity: string;
    title: string;
    description?: string;
    status: string;
    createdAt: string;
    client?: { id: string; tradeName: string };
  }[];
  pendingActionPlans: {
    id: string;
    problem: string;
    action: string;
    dueDate?: string;
    priority: string;
    client: { id: string; tradeName: string };
  }[];
}


function formatCurrency(val?: number) {
  if (!val) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: '#ef4444' },
  high: { label: 'Alto', color: '#f97316' },
  medium: { label: 'Médio', color: '#f59e0b' },
  low: { label: 'Baixo', color: '#22c55e' },
};

const SEVERITY_MAP: Record<string, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: '#ef4444' },
  high: { label: 'Alto', color: '#f97316' },
  medium: { label: 'Médio', color: '#f59e0b' },
  low: { label: 'Baixo', color: '#22c55e' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [today, setToday] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [dateDay, setDateDay] = useState('');
  const [dateFull, setDateFull] = useState('');

  useEffect(() => {
    // Set date/greeting on client only to avoid hydration mismatch
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
    setDateDay(now.toLocaleDateString('pt-BR', { weekday: 'long' }));
    setDateFull(now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));

    async function load() {
      try {
        const [ov, td] = await Promise.all([
          api.get<OverviewData>('/dashboard/overview'),
          api.get<TodayData>('/dashboard/today'),
        ]);
        setOverview(ov);
        setToday(td);
      } catch {
        setError('Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
        setTimeout(() => setAnimated(true), 50);
      }
    }
    load();
  }, []);

  const stats = [
    {
      label: 'Clientes ativos',
      value: overview?.totalActiveClients ?? 0,
      accent: 'var(--primary)',
      accentBg: 'color-mix(in srgb, var(--primary) 15%, transparent)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Saudáveis',
      value: overview?.clientsHealthy ?? 0,
      accent: '#22c55e',
      accentBg: 'rgba(34,197,94,0.1)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      label: 'Em risco',
      value: overview?.clientsAtRisk ?? 0,
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.1)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: 'Sem follow-up',
      value: overview?.clientsWithoutFollowup ?? 0,
      accent: 'var(--muted-foreground)',
      accentBg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      label: 'Planos vencidos',
      value: overview?.overdueActionPlans ?? 0,
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.1)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="dash">
        {/* ── TOP BAR ── */}
        <div className={`dash-header ${animated ? 'dash-anim' : ''}`}>
          <div>
            <div className="dash-greeting">
              {greeting}, <span className="dash-name">{user?.name?.split(' ')[0] || 'gestor'}</span> 👋
            </div>
            <h1 className="dash-title">Painel Operacional</h1>
          </div>
          {dateFull && (
            <div className="dash-date">
              <div className="dash-date-day">{dateDay}</div>
              <div className="dash-date-full">{dateFull}</div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="dash-loading">
            <div className="dash-skeleton" />
            <div className="dash-skeleton" style={{ width: '70%' }} />
            <div className="dash-skeleton" style={{ width: '85%' }} />
          </div>
        ) : error ? (
          <div className="dash-error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Tentar novamente</button>
          </div>
        ) : (
          <>
            {/* ── STATS ── */}
            <div className={`stats-grid ${animated ? 'dash-anim' : ''}`} style={{ animationDelay: '60ms' }}>
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="stat-card"
                  style={{ '--accent': s.accent, '--accent-bg': s.accentBg, animationDelay: `${80 + i * 40}ms` } as React.CSSProperties}
                >
                  <div className="stat-icon-wrap">{s.icon}</div>
                  <div className="stat-body">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                  <div className="stat-bar" />
                </div>
              ))}
            </div>

            {/* ── PORTFOLIO STRIP ── */}
            <div className={`portfolio-strip ${animated ? 'dash-anim' : ''}`} style={{ animationDelay: '280ms' }}>
              <div className="portfolio-inner">
                <div className="portfolio-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <div className="portfolio-label">Valor total da carteira ativa</div>
                  <div className="portfolio-value">{formatCurrency(overview?.totalPortfolioValue)}</div>
                </div>
              </div>
              <Link href="/clients" className="portfolio-cta">
                Ver carteira
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* ── TODAY SECTION ── */}
            <div className={`today-section ${animated ? 'dash-anim' : ''}`} style={{ animationDelay: '320ms' }}>
              <div className="today-header">
                <div className="today-title-row">
                  <span className="today-pulse" aria-hidden />
                  <h2 className="today-title">Hoje preciso olhar</h2>
                </div>
                <Link href="/today" className="today-link">
                  Ver tudo
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>

              <div className="today-grid">
                {/* Clientes em risco */}
                <div className="today-card">
                  <div className="today-card-head today-card-head--red">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Clientes em risco
                  </div>
                  <div className="today-card-body">
                    {(overview?.riskClientsList.length ?? 0) === 0 ? (
                      <EmptyState label="Nenhum cliente em risco no momento" />
                    ) : (
                      <ul className="item-list">
                        {overview?.riskClientsList.map((c) => (
                          <li key={c.id} className="item-row">
                            <div className="item-dot" style={{ background: c.healthStatus === 'red' ? '#ef4444' : '#f59e0b' }} />
                            <Link href={`/clients/${c.id}`} className="item-link">{c.tradeName}</Link>
                            <span className="item-badge" style={{ background: c.healthStatus === 'red' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: c.healthStatus === 'red' ? '#ef4444' : '#f59e0b' }}>
                              {c.healthStatus === 'red' ? 'Crítico' : 'Atenção'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Planos pendentes */}
                <div className="today-card">
                  <div className="today-card-head today-card-head--amber">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Planos pendentes
                  </div>
                  <div className="today-card-body">
                    {(today?.pendingActionPlans.length ?? 0) === 0 ? (
                      <EmptyState label="Nenhum plano pendente de sua responsabilidade" />
                    ) : (
                      <ul className="item-list">
                        {today?.pendingActionPlans.map((p) => {
                          const prio = PRIORITY_MAP[p.priority] ?? { label: p.priority, color: 'var(--muted-foreground)' };
                          return (
                            <li key={p.id} className="item-row">
                              <div className="item-dot" style={{ background: prio.color }} />
                              <span className="item-link">{p.client.tradeName}</span>
                              <span className="item-badge" style={{ background: `${prio.color}18`, color: prio.color }}>
                                {prio.label}
                              </span>
                              {p.dueDate && (
                                <span className="item-date">{formatDate(p.dueDate)}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Alertas */}
                <div className="today-card">
                  <div className="today-card-head today-card-head--yellow">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    Alertas operacionais
                  </div>
                  <div className="today-card-body">
                    {(today?.alerts.length ?? 0) === 0 ? (
                      <EmptyState label="Nenhum alerta pendente no sistema" />
                    ) : (
                      <ul className="item-list">
                        {today?.alerts.map((a) => {
                          const sev = SEVERITY_MAP[a.severity] ?? { label: a.severity, color: 'var(--muted-foreground)' };
                          return (
                            <li key={a.id} className="item-row">
                              <div className="item-dot" style={{ background: sev.color }} />
                              <span className="item-link">{a.client?.tradeName || 'Sistema'}</span>
                              <span className="item-badge" style={{ background: `${sev.color}18`, color: sev.color }}>
                                {sev.label}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        body { font-family: 'Inter', system-ui, sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-anim {
          animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ─── SHELL ─── */
        .dash {
          min-height: 100vh;
          background: var(--background);
          padding: 32px 32px 40px;
          max-width: 1300px;
          margin: 0 auto;
        }

        /* ─── HEADER ─── */
        .dash-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .dash-greeting {
          font-size: 0.8rem;
          color: var(--muted-foreground);
          font-weight: 500;
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }
        .dash-name { color: var(--primary); font-weight: 700; }
        .dash-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .dash-date { text-align: right; }
        .dash-date-day {
          font-size: 0.7rem;
          text-transform: capitalize;
          color: var(--muted-foreground);
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .dash-date-full {
          font-size: 0.825rem;
          color: var(--muted-foreground);
          font-weight: 500;
          text-transform: capitalize;
          margin-top: 2px;
        }

        /* ─── STATS ─── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        .stat-card {
          background: var(--card);
          border-radius: 10px;
          border: 1px solid var(--border);
          padding: 18px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .stat-bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: var(--accent);
          border-radius: 10px 0 0 10px;
        }
        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--accent-bg);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-body { padding-left: 4px; }
        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--card-foreground);
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .stat-label {
          font-size: 0.73rem;
          color: var(--muted-foreground);
          font-weight: 600;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* ─── PORTFOLIO ─── */
        .portfolio-strip {
          background: var(--card);
          border-radius: 10px;
          border: 1px solid var(--border);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .portfolio-inner {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .portfolio-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--primary) 15%, transparent);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .portfolio-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }
        .portfolio-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.03em;
        }
        .portfolio-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--card);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 9px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
          min-height: 44px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .portfolio-cta:hover {
          background: var(--secondary);
        }

        /* ─── TODAY ─── */
        .today-section { margin-bottom: 32px; }
        .today-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 8px;
        }
        .today-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .today-pulse {
          display: block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 0 0 rgba(239,68,68,0.4);
          animation: ripple 1.8s ease-out infinite;
        }
        @keyframes ripple {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .today-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }
        .today-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--primary);
          text-decoration: none;
          transition: opacity 0.15s;
          min-height: 44px;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .today-link:hover { opacity: 0.75; }

        .today-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .today-card {
          background: var(--card);
          border-radius: 10px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .today-card-head {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 16px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }
        .today-card-head--red   { color: var(--red); background: color-mix(in srgb, var(--red) 5%, transparent); }
        .today-card-head--amber { color: var(--yellow); background: color-mix(in srgb, var(--yellow) 5%, transparent); }
        .today-card-head--yellow { color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }

        .today-card-body {
          flex: 1;
          padding: 12px 16px 16px;
        }

        /* ─── LISTS ─── */
        .item-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .item-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          min-height: 28px;
        }
        .item-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .item-link {
          flex: 1;
          color: var(--foreground);
          font-weight: 500;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.1s;
        }
        a.item-link:hover { color: var(--primary); }
        .item-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          flex-shrink: 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .item-date {
          font-size: 0.68rem;
          color: var(--muted-foreground);
          font-weight: 500;
          flex-shrink: 0;
        }

        /* ─── EMPTY STATE ─── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 0 8px;
          color: var(--muted-foreground);
          text-align: center;
        }
        .empty-state p {
          font-size: 0.78rem;
          color: var(--muted-foreground);
          font-style: italic;
        }

        /* ─── LOADING ─── */
        .dash-loading {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 8px;
        }
        .dash-skeleton {
          height: 80px;
          background: linear-gradient(90deg, var(--border) 25%, var(--secondary) 50%, var(--border) 75%);
          background-size: 200% 100%;
          border-radius: 10px;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* ─── ERROR ─── */
        .dash-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 80px 0;
          color: var(--muted-foreground);
          text-align: center;
        }
        .dash-error button {
          margin-top: 4px;
          padding: 10px 20px;
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          min-height: 44px;
        }
        .dash-error button:hover { opacity: 0.85; }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .today-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .dash { padding: 16px 16px 40px; }
          .dash-title { font-size: 1.4rem; }
          .dash-date { display: none; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .portfolio-strip { padding: 16px; }
          .portfolio-value { font-size: 1.3rem; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }

        /* ─── REDUCED MOTION ─── */
        @media (prefers-reduced-motion: reduce) {
          .dash-anim, .dash-skeleton, .today-pulse { animation: none !important; }
          .stat-card { transition: none !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="empty-state">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
      <p>{label}</p>
    </div>
  );
}
