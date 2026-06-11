'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { Client, MonthlyCycle, WeeklyFollowup, AuthUser } from '@/lib/types';

export default function FollowupsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [cycles, setCycles] = useState<MonthlyCycle[]>([]);
  const [followups, setFollowups] = useState<WeeklyFollowup[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [groupActivated, setGroupActivated] = useState('yes');
  const [clientResponded, setClientResponded] = useState('yes');
  const [agencyRespondedOnTime, setAgencyRespondedOnTime] = useState('yes');
  const [calendarOnTrack, setCalendarOnTrack] = useState('yes');
  const [hasDelayedDelivery, setHasDelayedDelivery] = useState(false);
  const [clientShowedDissatisfaction, setClientShowedDissatisfaction] = useState(false);
  const [churnRisk, setChurnRisk] = useState('none');
  const [managerNotes, setManagerNotes] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');

  // Calculate current week dates (Monday to Sunday)
  const calculateWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setWeekStart(monday.toISOString().split('T')[0]);
    setWeekEnd(sunday.toISOString().split('T')[0]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsData, followupsData, usersData] = await Promise.all([
        api.get<Client[]>('/clients'),
        api.get<WeeklyFollowup[]>('/followups'),
        api.get<AuthUser[]>('/users'),
      ]);

      setClients(clientsData.filter((c) => c.status === 'active'));
      setFollowups(followupsData);
      setUsers(usersData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados do dashboard de acompanhamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    calculateWeekDates();
  }, []);

  const handleOpenForm = async (client: Client) => {
    setSelectedClient(client);
    setFormError(null);
    
    // Fetch or initialize cycle for the current client
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const cycle = await api.post<MonthlyCycle>('/monthly-cycles/initialize', {
        clientId: client.id,
        month,
        year,
      });
      
      // Store cycle to submit alongside followup
      setSelectedClient({ ...client, id: client.id, managerId: cycle.id }); // Using managerId to temporarily carry cycleId in state
      setModalOpen(true);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao inicializar o ciclo mensal para este cliente: ' + err.message);
    }
  };

  const handleSubmitFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSubmitting(true);
    setFormError(null);

    const payload = {
      clientId: selectedClient.id,
      monthlyCycleId: selectedClient.managerId, // Carries cycleId
      weekStart,
      weekEnd,
      groupActivated,
      clientResponded,
      agencyRespondedOnTime,
      calendarOnTrack,
      hasDelayedDelivery,
      clientShowedDissatisfaction,
      churnRisk,
      managerNotes: managerNotes || undefined,
      recommendedAction: recommendedAction || undefined,
    };

    try {
      await api.post('/followups', payload);
      setGroupActivated('yes');
      setClientResponded('yes');
      setAgencyRespondedOnTime('yes');
      setCalendarOnTrack('yes');
      setHasDelayedDelivery(false);
      setClientShowedDissatisfaction(false);
      setChurnRisk('none');
      setManagerNotes('');
      setRecommendedAction('');
      setModalOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao registrar acompanhamento.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if a client has a follow-up for the current week
  const isFilledThisWeek = (clientId: string) => {
    return followups.some((f) => {
      if (f.clientId !== clientId) return false;
      const fStart = new Date(f.weekStart).toISOString().split('T')[0];
      return fStart === weekStart;
    });
  };

  const getWeeklyFollowup = (clientId: string) => {
    return followups.find((f) => {
      if (f.clientId !== clientId) return false;
      const fStart = new Date(f.weekStart).toISOString().split('T')[0];
      return fStart === weekStart;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#fafafa] sm:text-3xl">
            Acompanhamento Semanal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Preencha e visualize o diagnóstico semanal dos seus clientes ativos.
          </p>
        </div>

        {/* Current Week Card */}
        <div className="bg-[#18181b] rounded-xl border border-[#3f3f46]/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Semana Operacional</span>
            <span className="text-sm font-semibold text-slate-300 mt-0.5 block">
              {weekStart ? new Date(weekStart).toLocaleDateString('pt-BR') : ''} até{' '}
              {weekEnd ? new Date(weekEnd).toLocaleDateString('pt-BR') : ''}
            </span>
          </div>
          <span className="text-xs text-slate-400 italic">
            Os acompanhamentos devem ser atualizados até sexta-feira às 18h.
          </span>
        </div>

        {/* Loading / Error states */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-slate-400 text-sm mt-3">Carregando lista de acompanhamento...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm">
            {error}
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-[#09090b] rounded-xl border border-[#27272a] p-12 text-center">
            <h3 className="text-slate-200 font-semibold">Nenhum cliente ativo</h3>
            <p className="text-slate-400 text-sm mt-1">Nenhum cliente ativo foi encontrado na sua carteira.</p>
          </div>
        ) : (
          <div className="bg-[#09090b] rounded-xl border border-[#27272a] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#18181b] text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-[#27272a]">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Gestor</th>
                    <th className="px-6 py-4">Status da Semana</th>
                    <th className="px-6 py-4 text-center">Score Semanal</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-300">
                  {clients.map((client) => {
                    const manager = users.find((u) => u.id === client.managerId);
                    const filled = isFilledThisWeek(client.id);
                    const weeklyData = getWeeklyFollowup(client.id);

                    return (
                      <tr key={client.id} className="hover:bg-[#18181b]/50 transition">
                        <td className="px-6 py-4 font-semibold text-[#fafafa]">
                          {client.tradeName}
                          <span className="block text-xs font-normal text-slate-400 mt-0.5">
                            {client.segment || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {manager?.name || 'Sem Gestor'}
                        </td>
                        <td className="px-6 py-4">
                          {filled ? (
                            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Respondido
                            </span>
                          ) : (
                            <span className="badge bg-amber-50 text-amber-700 border border-amber-100">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {filled && weeklyData ? (
                            <span className={`badge border font-bold ${getScoreColor(weeklyData.weeklyScore)}`}>
                              {weeklyData.weeklyScore} / 100
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {filled ? (
                            <span className="text-slate-400 font-semibold text-xs">Acompanhamento concluído</span>
                          ) : (
                            <button
                              onClick={() => handleOpenForm(client)}
                              className="btn-primary py-1.5 px-3 text-xs shadow-xs"
                            >
                              Preencher Diagnóstico
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Preencher Acompanhamento */}
        {modalOpen && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
            <div className="bg-[#09090b] rounded-xl shadow-2xl border border-[#27272a] max-w-lg w-full z-10 overflow-hidden">
              <form onSubmit={handleSubmitFollowup}>
                <div className="px-6 py-5 bg-[#18181b] border-b border-[#27272a] flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#fafafa]">Diagnóstico Semanal</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedClient.tradeName}</p>
                  </div>
                  <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {formError && <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-xs">{formError}</div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Data de Início da Semana</label>
                      <input type="date" required value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Data de Fim da Semana</label>
                      <input type="date" required value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} className="form-input" />
                    </div>
                  </div>

                  <hr className="border-[#27272a]" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perguntas Objetivas</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Grupo WhatsApp Ativo? *</label>
                      <select value={groupActivated} onChange={(e) => setGroupActivated(e.target.value)} className="form-input">
                        <option value="yes">Sim (100% ativo)</option>
                        <option value="no">Não (sem movimentação)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Cliente Respondeu Ativamente? *</label>
                      <select value={clientResponded} onChange={(e) => setClientResponded(e.target.value)} className="form-input">
                        <option value="yes">Sim (respondeu no prazo)</option>
                        <option value="no">Não (demorou/vácuo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Agência Respondeu no Prazo? *</label>
                      <select value={agencyRespondedOnTime} onChange={(e) => setAgencyRespondedOnTime(e.target.value)} className="form-input">
                        <option value="yes">Sim (sempre no prazo)</option>
                        <option value="no">Não (houve atraso interno)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Cronograma em Dia? *</label>
                      <select value={calendarOnTrack} onChange={(e) => setCalendarOnTrack(e.target.value)} className="form-input">
                        <option value="yes">Sim (calendário em ordem)</option>
                        <option value="no">Não (houve atrasos relevantes)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={hasDelayedDelivery}
                        onChange={(e) => setHasDelayedDelivery(e.target.checked)}
                        className="rounded border-[#52525b] text-yellow-500 focus:ring-yellow-500 w-4.5 h-4.5"
                      />
                      Houve atraso em algum entregável contratado?
                    </label>
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={clientShowedDissatisfaction}
                        onChange={(e) => setClientShowedDissatisfaction(e.target.checked)}
                        className="rounded border-[#52525b] text-yellow-500 focus:ring-yellow-500 w-4.5 h-4.5"
                      />
                      O cliente manifestou alguma insatisfação?
                    </label>
                  </div>

                  <hr className="border-[#27272a]" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnóstico de Churn</h4>

                  <div>
                    <label className="form-label">Risco de Cancelamento (Churn)</label>
                    <select value={churnRisk} onChange={(e) => setChurnRisk(e.target.value)} className="form-input">
                      <option value="none">Nenhum Risco Detectado</option>
                      <option value="low">Baixo (risco leve)</option>
                      <option value="medium">Médio (necessita atenção)</option>
                      <option value="high">Alto (risco crítico)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Observações e Comentários</label>
                    <textarea rows={2} value={managerNotes} onChange={(e) => setManagerNotes(e.target.value)} placeholder="Detalhes adicionais sobre a percepção do cliente ou andamento do cronograma..." className="form-input resize-none" />
                  </div>

                  <div>
                    <label className="form-label">Ação Recomendada (Caso haja riscos)</label>
                    <textarea rows={2} value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)} placeholder="Ação corretiva para reverter insatisfações ou gargalos operacionais..." className="form-input resize-none" />
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#18181b] border-t border-[#27272a] flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-300">Cancelar</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">Enviar Diagnóstico</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
