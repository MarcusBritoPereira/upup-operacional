'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { ActionPlan } from '@/lib/types';
import Link from 'next/link';

export default function ActionPlansPage() {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get<ActionPlan[]>('/action-plans');
      setPlans(res || []);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao buscar planos de ação.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Concluído', className: 'status-completed' };
      case 'in_progress':
        return { label: 'Em Progresso', className: 'status-progress' };
      case 'cancelled':
        return { label: 'Cancelado', className: 'status-cancelled' };
      default:
        return { label: 'Aberto', className: 'status-open' };
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'priority-high';
      default:
        return 'priority-normal';
    }
  };

  return (
    <DashboardLayout>
      <div className="plans-container">
        {/* Header */}
        <div className="plans-header">
          <div>
            <h1 className="plans-title">Planos de Ação</h1>
            <p className="plans-subtitle">
              Acompanhamento e execução de estratégias de mitigação e contorno para clientes.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
          >
            Todos ({plans.length})
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`}
          >
            Abertos ({plans.filter((p) => p.status === 'open').length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
          >
            Em Progresso ({plans.filter((p) => p.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
          >
            Concluídos ({plans.filter((p) => p.status === 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
          >
            Cancelados ({plans.filter((p) => p.status === 'cancelled').length})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando planos de ação...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum plano de ação encontrado para o filtro selecionado.</p>
          </div>
        ) : (
          <div className="plans-grid">
            {filteredPlans.map((plan) => {
              const statusInfo = getStatusBadge(plan.status);
              return (
                <div key={plan.id} className="plan-card">
                  <div className="card-header">
                    <span className="client-name">{plan.client?.tradeName}</span>
                    <span className={`status-badge ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="card-body">
                    <h3 className="plan-title">⚠️ {plan.problem}</h3>
                    {plan.probableCause && (
                      <p className="plan-text">
                        <strong>Causa Provável:</strong> {plan.probableCause}
                      </p>
                    )}
                    <p className="plan-text">
                      <strong>Ação:</strong> {plan.action}
                    </p>
                  </div>

                  <div className="card-meta">
                    <div className="meta-item">
                      <span className="meta-label">Responsável</span>
                      <span className="meta-val">{plan.responsible?.name || 'Não atribuído'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Criador</span>
                      <span className="meta-val">{plan.creator?.name || 'Sistema'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Prazo</span>
                      <span className={`meta-val ${plan.status !== 'completed' && plan.dueDate && new Date(plan.dueDate) < new Date() ? 'text-red' : ''}`}>
                        {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                      </span>
                    </div>
                  </div>

                  {plan.status === 'completed' && plan.result && (
                    <div className="resolution-notes">
                      <p className="resolution-text"><strong>Resultado:</strong> {plan.result}</p>
                      {plan.learning && <p className="resolution-text"><strong>Aprendizado:</strong> {plan.learning}</p>}
                    </div>
                  )}

                  <div className="card-footer">
                    <Link href={`/clients/${plan.clientId}?tab=action-plans`} className="details-link">
                      Acessar no Cliente →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .plans-container {
          padding: 28px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .plans-header {
          margin-bottom: 24px;
        }

        .plans-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fafafa;
        }

        .plans-subtitle {
          font-size: 0.9rem;
          color: #a1a1aa;
          margin-top: 4px;
        }

        .filter-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .filter-btn {
          white-space: nowrap;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #27272a;
          background: #09090b;
          color: #a1a1aa;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-btn:hover {
          border-color: #3f3f46;
          background: #18181b;
        }

        .filter-btn.active {
          background: #ecfeff;
          color: #06b6d4;
          border-color: #a5f3fc;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .plan-card {
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .plan-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .client-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #06b6d4;
          text-transform: uppercase;
        }

        .status-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .status-open { background: #27272a; color: #a1a1aa; }
        .status-progress { background: #fef9c3; color: #a16207; }
        .status-completed { background: #dcfce7; color: #15803d; }
        .status-cancelled { background: #fee2e2; color: #b91c1c; }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .plan-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fafafa;
        }

        .plan-text {
          font-size: 0.85rem;
          color: #a1a1aa;
          line-height: 1.4;
        }

        .card-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 12px;
          background: #18181b;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .meta-label {
          font-size: 0.7rem;
          color: #a1a1aa;
          font-weight: 500;
        }

        .meta-val {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .text-red {
          color: #ef4444;
        }

        .resolution-notes {
          padding: 12px;
          background: #f0fdf4;
          border-radius: 8px;
          border: 1px solid #dcfce7;
          font-size: 0.82rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .resolution-text {
          color: #166534;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: flex-end;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .details-link {
          font-size: 0.82rem;
          font-weight: 600;
          color: #06b6d4;
          text-decoration: none;
        }

        .details-link:hover {
          text-decoration: underline;
        }

        .loading-state, .error-state {
          padding: 80px 0;
          text-align: center;
          color: #a1a1aa;
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
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
