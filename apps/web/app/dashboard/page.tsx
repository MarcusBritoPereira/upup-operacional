'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

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
    client?: {
      id: string;
      tradeName: string;
    };
  }[];
  pendingActionPlans: {
    id: string;
    problem: string;
    action: string;
    dueDate?: string;
    priority: string;
    client: {
      id: string;
      tradeName: string;
    };
  }[];
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  icon: React.ReactNode;
}) {
  const colors = {
    blue: { bg: '#eff6ff', text: '#2563eb', iconBg: '#dbeafe' },
    green: { bg: '#f0fdf4', text: '#15803d', iconBg: '#dcfce7' },
    yellow: { bg: '#fefce8', text: '#a16207', iconBg: '#fef9c3' },
    red: { bg: '#fff1f2', text: '#be123c', iconBg: '#fee2e2' },
    gray: { bg: '#f8fafc', text: '#475569', iconBg: '#f1f5f9' },
  };
  const c = colors[color];

  return (
    <div className="stat-card" style={{ backgroundColor: c.bg }}>
      <div className="stat-icon" style={{ backgroundColor: c.iconBg, color: c.text }}>
        {icon}
      </div>
      <div className="stat-info">
        <p className="stat-value" style={{ color: c.text }}>{value}</p>
        <p className="stat-label">{label}</p>
      </div>
      <style jsx>{`
        .stat-card {
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(0,0,0,0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 3px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

function TodayCard({
  title,
  items,
  emptyMsg,
}: {
  title: string;
  items: { label: string; badge?: string; badgeColor?: string }[];
  emptyMsg: string;
}) {
  return (
    <div className="today-card card">
      <h3 className="today-card-title">{title}</h3>
      {items.length === 0 ? (
        <p className="today-empty">{emptyMsg}</p>
      ) : (
        <ul className="today-list">
          {items.map((item, i) => (
            <li key={i} className="today-item">
              <span className="today-dot" />
              <span className="today-item-label">{item.label}</span>
              {item.badge && (
                <span
                  className="badge"
                  style={{
                    background: item.badgeColor === 'red' ? '#fee2e2' : item.badgeColor === 'yellow' ? '#fef9c3' : '#dcfce7',
                    color: item.badgeColor === 'red' ? '#b91c1c' : item.badgeColor === 'yellow' ? '#a16207' : '#15803d',
                    borderColor: item.badgeColor === 'red' ? '#fca5a5' : item.badgeColor === 'yellow' ? '#fde047' : '#bbf7d0',
                    marginLeft: 'auto',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .today-card { margin-bottom: 0; }
        .today-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }
        .today-empty {
          font-size: 0.82rem;
          color: #94a3b8;
          font-style: italic;
        }
        .today-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .today-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.83rem;
          color: #374151;
        }
        .today-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #06b6d4;
          flex-shrink: 0;
        }
        .today-item-label {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [today, setToday] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [overviewRes, todayRes] = await Promise.all([
          api.get<OverviewData>('/dashboard/overview'),
          api.get<TodayData>('/dashboard/today'),
        ]);
        setOverview(overviewRes);
        setToday(todayRes);
      } catch (err: any) {
        console.error(err);
        setError('Erro ao carregar os dados do painel.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const riskClientsItems = overview?.riskClientsList.map((c) => ({
    label: `${c.tradeName} (Score: ${c.healthScore || 0})`,
    badge: c.healthStatus === 'red' ? 'Risco' : 'Atenção',
    badgeColor: c.healthStatus === 'red' ? 'red' : 'yellow',
  })) || [];

  const pendingPlansItems = today?.pendingActionPlans.map((p) => ({
    label: `${p.client.tradeName}: ${p.action}`,
    badge: p.dueDate ? new Date(p.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo',
    badgeColor: p.priority === 'critical' || p.priority === 'high' ? 'red' : 'yellow',
  })) || [];

  const alertItems = today?.alerts.map((a) => ({
    label: `${a.client?.tradeName || 'Alerta'}: ${a.title}`,
    badge: a.severity === 'high' ? 'Crítico' : 'Médio',
    badgeColor: a.severity === 'high' ? 'red' : 'yellow',
  })) || [];

  return (
    <DashboardLayout>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-greeting">
              Bom dia, {user?.name?.split(' ')[0] || 'gestor'} 👋 — Aqui está o resumo de hoje.
            </p>
          </div>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando métricas...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="stats-grid">
              <StatCard
                label="Clientes ativos"
                value={overview?.totalActiveClients ?? 0}
                color="blue"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
              <StatCard
                label="Clientes saudáveis"
                value={overview?.clientsHealthy ?? 0}
                color="green"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                }
              />
              <StatCard
                label="Clientes em risco"
                value={overview?.clientsAtRisk ?? 0}
                color="red"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                }
              />
              <StatCard
                label="Sem follow-up"
                value={overview?.clientsWithoutFollowup ?? 0}
                color="gray"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
              />
              <StatCard
                label="Planos pendentes"
                value={overview?.overdueActionPlans ?? 0}
                color="yellow"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
            </div>

            {/* Portfolio value */}
            <div className="portfolio-card card">
              <p className="portfolio-label">Valor total da carteira ativa</p>
              <p className="portfolio-value">{formatCurrency(overview?.totalPortfolioValue)}</p>
            </div>

            {/* Today section */}
            <div className="today-section">
              <div className="today-header">
                <div className="today-title-wrap">
                  <span className="today-pulse" />
                  <h2 className="today-title">Hoje preciso olhar</h2>
                </div>
                <a href="/today" className="today-link">Ver tudo →</a>
              </div>

              <div className="today-grid">
                <TodayCard
                  title="🔴 Clientes com Saúde Crítica/Atenção"
                  items={riskClientsItems}
                  emptyMsg="Nenhum cliente em risco ou atenção."
                />
                <TodayCard
                  title="⚠️ Planos de Ação Pendentes"
                  items={pendingPlansItems}
                  emptyMsg="Nenhum plano pendente de sua responsabilidade."
                />
                <TodayCard
                  title="🕐 Alertas Operacionais Recentes"
                  items={alertItems}
                  emptyMsg="Nenhum alerta pendente no sistema."
                />
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .dashboard {
          padding: 28px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .dashboard-greeting {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 4px;
        }

        .dashboard-date {
          font-size: 0.82rem;
          color: #94a3b8;
          text-transform: capitalize;
          padding-top: 6px;
          white-space: nowrap;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .portfolio-card {
          margin-bottom: 28px;
        }

        .portfolio-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .portfolio-value {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 4px;
        }

        .today-section {
          margin-bottom: 28px;
        }

        .today-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .today-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .today-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ef4444;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        .today-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
        }

        .today-link {
          font-size: 0.82rem;
          color: #06b6d4;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }

        .today-link:hover {
          opacity: 0.75;
        }

        .today-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .loading-state, .error-state {
          padding: 80px 0;
          text-align: center;
          color: #64748b;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #06b6d4;
          border-radius: 50%;
          margin: 0 auto 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }

          .dashboard-title {
            font-size: 1.4rem;
          }

          .dashboard-date {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .today-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-value {
            font-size: 1.6rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
