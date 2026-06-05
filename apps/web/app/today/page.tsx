'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { Alert, ActionPlan } from '@/lib/types';
import Link from 'next/link';

export default function TodayPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ alerts: Alert[]; pendingActionPlans: ActionPlan[] }>('/dashboard/today');
      setAlerts(res.alerts || []);
      setActionPlans(res.pendingActionPlans || []);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar alertas e planos de ação.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`, {});
      // Update local state
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao marcar alerta como resolvido.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="today-container">
        {/* Header */}
        <div className="today-header">
          <div>
            <h1 className="today-title">Hoje preciso olhar</h1>
            <p className="today-subtitle">
              Prioridades operacionais, alertas de termômetro e planos de ação sob sua responsabilidade.
            </p>
          </div>
          <button onClick={loadData} className="refresh-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando pendências de hoje...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : (
          <div className="today-grid">
            {/* Column 1: Alerts */}
            <div className="today-column">
              <div className="column-header">
                <span className="column-badge badge-red">{alerts.length}</span>
                <h2 className="column-title">Alertas de Atenção e Crise</h2>
              </div>

              {alerts.length === 0 ? (
                <div className="empty-state">
                  <p>Tudo sob controle! Nenhum alerta em aberto.</p>
                </div>
              ) : (
                <div className="cards-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="alert-card">
                      <div className="alert-card-header">
                        <span className={`severity-indicator ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span className="alert-client-name">{alert.client?.tradeName}</span>
                      </div>
                      <h3 className="alert-card-title">{alert.title}</h3>
                      {alert.description && <p className="alert-card-desc">{alert.description}</p>}
                      <div className="alert-card-footer">
                        <span className="alert-date">
                          {new Date(alert.createdAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="resolve-btn"
                        >
                          Marcar como resolvido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Action Plans */}
            <div className="today-column">
              <div className="column-header">
                <span className="column-badge badge-cyan">{actionPlans.length}</span>
                <h2 className="column-title">Meus Planos de Ação Pendentes</h2>
              </div>

              {actionPlans.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum plano de ação pendente sob sua responsabilidade.</p>
                </div>
              ) : (
                <div className="cards-list">
                  {actionPlans.map((plan) => (
                    <div key={plan.id} className="plan-card">
                      <div className="plan-card-header">
                        <span className="plan-client-name">{plan.client?.tradeName}</span>
                        <span className={`plan-priority-badge ${plan.priority === 'critical' || plan.priority === 'high' ? 'priority-high' : 'priority-medium'}`}>
                          {plan.priority}
                        </span>
                      </div>
                      <h3 className="plan-card-problem">⚠️ {plan.problem}</h3>
                      <p className="plan-card-action"><strong>Ação:</strong> {plan.action}</p>
                      <div className="plan-card-footer">
                        <span className="plan-due-date">
                          Prazo: {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                        </span>
                        <Link href={`/clients/${plan.clientId}?tab=action-plans`} className="go-to-client-link">
                          Ver cliente →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .today-container {
          padding: 28px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .today-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .today-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
        }

        .today-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 4px;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .refresh-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .today-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .today-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f5f9;
        }

        .column-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .badge-red {
          background: #fee2e2;
          color: #ef4444;
        }

        .badge-cyan {
          background: #ecfeff;
          color: #06b6d4;
        }

        .column-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .empty-state {
          padding: 32px;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.88rem;
          background: #f8fafc;
        }

        .cards-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-card, .plan-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .alert-card:hover, .plan-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .alert-card-header, .plan-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .severity-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .alert-client-name, .plan-client-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #06b6d4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .alert-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        .alert-card-desc {
          font-size: 0.83rem;
          color: #64748b;
          margin-top: 6px;
          line-height: 1.4;
        }

        .alert-card-footer, .plan-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .alert-date, .plan-due-date {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .resolve-btn {
          font-size: 0.78rem;
          font-weight: 600;
          color: #10b981;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .resolve-btn:hover {
          background: #d1fae5;
          color: #047857;
        }

        .plan-priority-badge {
          margin-left: auto;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .priority-high {
          background: #fee2e2;
          color: #be123c;
        }

        .priority-medium {
          background: #fef9c3;
          color: #a16207;
        }

        .plan-card-problem {
          font-size: 0.92rem;
          font-weight: 700;
          color: #1e293b;
        }

        .plan-card-action {
          font-size: 0.83rem;
          color: #475569;
          margin-top: 6px;
          line-height: 1.4;
        }

        .go-to-client-link {
          font-size: 0.78rem;
          font-weight: 600;
          color: #06b6d4;
          text-decoration: none;
        }

        .go-to-client-link:hover {
          text-decoration: underline;
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

        @media (max-width: 900px) {
          .today-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
