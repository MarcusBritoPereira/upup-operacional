'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { ClientCredentials } from '@/components/clients/ClientCredentials';
import {
  Client,
  Squad,
  AuthUser,
  ClientStatus,
  Contract,
  MonthlyCycle,
  MonthlyDeliverable,
  DeliverableType,
  WeeklyFollowup,
  ActionPlan,
  ClientTimeline,
} from '@/lib/types';

const formatCurrencyInput = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  if (!numericValue) return '';
  const floatValue = (parseInt(numericValue, 10) / 100).toFixed(2);
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(floatValue));
};

const unformatCurrency = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuth();

  // Core Data States
  const [client, setClient] = useState<Client | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [cycles, setCycles] = useState<MonthlyCycle[]>([]);
  const [deliverableTypes, setDeliverableTypes] = useState<DeliverableType[]>([]);
  const [followups, setFollowups] = useState<WeeklyFollowup[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [timeline, setTimeline] = useState<ClientTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'cadastro' | 'contratos' | 'followup' | 'action-plans' | 'timeline' | 'senhas'>('cadastro');

  // Selected Cycle State (for deliverables table)
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // Modals & Panels State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [actionPlanModalOpen, setActionPlanModalOpen] = useState(false);
  const [resolvePlanModalOpen, setResolvePlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Action Plan Form Fields
  const [planProblem, setPlanProblem] = useState('');
  const [planProbableCause, setPlanProbableCause] = useState('');
  const [planAction, setPlanAction] = useState('');
  const [planResponsibleId, setPlanResponsibleId] = useState('');
  const [planDueDate, setPlanDueDate] = useState('');
  const [planPriority, setPlanPriority] = useState('medium');
  
  // Resolve Action Plan Fields
  const [planResult, setPlanResult] = useState('');
  const [planLearning, setPlanLearning] = useState('');
  const [planTargetStatus, setPlanTargetStatus] = useState<'completed' | 'cancelled'>('completed');

  // 1. Edit Client Form Fields
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [segment, setSegment] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [managerId, setManagerId] = useState('');
  const [decisionMakerName, setDecisionMakerName] = useState('');
  const [decisionMakerPhone, setDecisionMakerPhone] = useState('');
  const [decisionMakerEmail, setDecisionMakerEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [clickupUrl, setClickupUrl] = useState('');
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');
  const [clientProfile, setClientProfile] = useState('');
  const [marketingMaturity, setMarketingMaturity] = useState('');
  const [strategicNotes, setStrategicNotes] = useState('');

  // 2. Add Contract Form Fields
  const [contractValue, setContractValue] = useState('');
  const [contractStart, setContractStart] = useState(new Date().toISOString().split('T')[0]);
  const [contractEnd, setContractEnd] = useState('');
  const [contractTaxPercentage, setContractTaxPercentage] = useState('');
  const [contractGeeType, setContractGeeType] = useState<'percentage' | 'fixed'>('percentage');
  const [contractGeePercentage, setContractGeePercentage] = useState('');
  const [contractGeeFixedValue, setContractGeeFixedValue] = useState('');
  const [contractNotes, setContractNotes] = useState('');
  const [contractDocumentUrl, setContractDocumentUrl] = useState('');

  // 3. Edit Deliverable Fields
  const [editingDeliverable, setEditingDeliverable] = useState<MonthlyDeliverable | null>(null);
  const [contractedQty, setContractedQty] = useState(0);
  const [deliveredQty, setDeliveredQty] = useState(0);
  const [inProgressQty, setInProgressQty] = useState(0);
  const [delayedQty, setDelayedQty] = useState(0);
  const [deliverableStatus, setDeliverableStatus] = useState('pending');
  const [deliverableNotes, setDeliverableNotes] = useState('');

  // 4. Followup Form Fields
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [groupActivated, setGroupActivated] = useState('yes');
  const [clientResponded, setClientResponded] = useState('yes');
  const [agencyRespondedOnTime, setAgencyRespondedOnTime] = useState('yes');
  const [calendarOnTrack, setCalendarOnTrack] = useState('yes');
  const [hasDelayedDelivery, setHasDelayedDelivery] = useState(false);
  const [clientShowedDissatisfaction, setClientShowedDissatisfaction] = useState(false);
  const [churnRisk, setChurnRisk] = useState('none');
  const [contentGeneratedQuantity, setContentGeneratedQuantity] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');

  // Calculate current week dates
  const calculateWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setWeekStart(monday.toISOString().split('T')[0]);
    setWeekEnd(sunday.toISOString().split('T')[0]);
  };

  // Fetch all client related data
  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [clientData, usersData, contractsData, cyclesData, typesData, followupsData, actionPlansData, timelineData] = await Promise.all([
        api.get<Client>(`/clients/${id}`),
        api.get<AuthUser[]>('/users'),
        api.get<Contract[]>(`/contracts?clientId=${id}`),
        api.get<MonthlyCycle[]>(`/monthly-cycles?clientId=${id}`),
        api.get<DeliverableType[]>('/deliverable-types'),
        api.get<WeeklyFollowup[]>(`/followups?clientId=${id}`),
        api.get(`/action-plans?clientId=${id}`),
        api.get(`/clients/${id}/timeline`),
      ]);

      setClient(clientData);
      setUsers(usersData);
      setContracts(contractsData);
      setCycles(cyclesData);
      setDeliverableTypes(typesData);
      setFollowups(followupsData);
      setActionPlans(actionPlansData as any);
      setTimeline(timelineData as any);

      // Auto select current cycle if available
      if (cyclesData.length > 0 && !selectedCycleId) {
        setSelectedCycleId(cyclesData[0].id);
      }

      // Populate edit client fields
      setTradeName(clientData.tradeName || '');
      setLegalName(clientData.legalName || '');
      setSegment(clientData.segment || '');
      setStatus(clientData.status || 'active');
      setEntryDate(clientData.entryDate ? new Date(clientData.entryDate).toISOString().split('T')[0] : '');
      setExitDate(clientData.exitDate ? new Date(clientData.exitDate).toISOString().split('T')[0] : '');
      setExitReason(clientData.exitReason || '');
      setManagerId(clientData.managerId || '');
      setDecisionMakerName(clientData.decisionMakerName || '');
      setDecisionMakerPhone(clientData.decisionMakerPhone || '');
      setDecisionMakerEmail(clientData.decisionMakerEmail || '');
      setCity(clientData.city || '');
      setState(clientData.state || '');
      setInstagramUrl(clientData.instagramUrl || '');
      setDriveUrl(clientData.driveUrl || '');
      setClickupUrl(clientData.clickupUrl || '');
      setWhatsappGroupUrl(clientData.whatsappGroupUrl || '');
      setClientProfile(clientData.clientProfile || '');
      setMarketingMaturity(clientData.marketingMaturity || '');
      setStrategicNotes(clientData.strategicNotes || '');

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar os dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
    calculateWeekDates();
  }, [id]);

  // Handle Updates
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      tradeName,
      legalName: legalName || null,
      segment: segment || null,
      status,
      entryDate,
      exitDate: exitDate || null,
      exitReason: exitReason || null,
      managerId: managerId || null,
      decisionMakerName: decisionMakerName || null,
      decisionMakerPhone: decisionMakerPhone || null,
      decisionMakerEmail: decisionMakerEmail || null,
      city: city || null,
      state: state || null,
      instagramUrl: instagramUrl || null,
      driveUrl: driveUrl || null,
      clickupUrl: clickupUrl || null,
      whatsappGroupUrl: whatsappGroupUrl || null,
      clientProfile: clientProfile || null,
      marketingMaturity: marketingMaturity || null,
      strategicNotes: strategicNotes || null,
    };

    try {
      await api.patch(`/clients/${id}`, payload);
      setDrawerOpen(false);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao atualizar dados do cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add New Contract
  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      clientId: id,
      startDate: contractStart,
      endDate: contractEnd || undefined,
      monthlyValue: unformatCurrency(contractValue),
      taxPercentage: contractTaxPercentage ? parseFloat(contractTaxPercentage) : undefined,
      geePercentage: (contractGeeType === 'percentage' && contractGeePercentage) ? parseFloat(contractGeePercentage) : undefined,
      geeFixedValue: (contractGeeType === 'fixed' && contractGeeFixedValue) ? unformatCurrency(contractGeeFixedValue) : undefined,
      notes: contractNotes || undefined,
      documentUrl: contractDocumentUrl || undefined,
      status: 'active',
    };

    try {
      await api.post('/contracts', payload);
      setContractValue('');
      setContractTaxPercentage('');
      setContractGeeType('percentage');
      setContractGeePercentage('');
      setContractGeeFixedValue('');
      setContractNotes('');
      setContractDocumentUrl('');
      setContractStart(new Date().toISOString().split('T')[0]);
      setContractEnd('');
      setContractModalOpen(false);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao cadastrar contrato.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Contract
  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Deseja realmente excluir este contrato? Isso afetará o valor total da carteira.')) return;
    try {
      await api.delete(`/contracts/${contractId}`);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao excluir contrato: ' + err.message);
    }
  };

  // Initialize current month cycle
  const handleInitializeCycle = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      const response = await api.post<MonthlyCycle>('/monthly-cycles/initialize', {
        clientId: id,
        month,
        year,
      });
      setSelectedCycleId(response.id);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao inicializar ciclo: ' + err.message);
    }
  };

  // Edit Deliverable Quantities
  const handleEditDeliverable = (deliv: MonthlyDeliverable) => {
    setEditingDeliverable(deliv);
    setContractedQty(deliv.contractedQuantity);
    setDeliveredQty(deliv.deliveredQuantity);
    setInProgressQty(deliv.inProgressQuantity);
    setDelayedQty(deliv.delayedQuantity);
    setDeliverableStatus(deliv.status);
    setDeliverableNotes(deliv.notes || '');
    setDeliverableModalOpen(true);
  };

  const handleUpdateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliverable) return;
    setSubmitting(true);
    setFormError(null);

    const payload = {
      contractedQuantity: contractedQty,
      deliveredQuantity: deliveredQty,
      inProgressQuantity: inProgressQty,
      delayedQuantity: delayedQty,
      status: deliverableStatus,
      notes: deliverableNotes || null,
    };

    try {
      await api.patch(`/monthly-cycles/deliverables/${editingDeliverable.id}`, payload);
      setDeliverableModalOpen(false);
      setEditingDeliverable(null);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao atualizar entregável.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit weekly followup
  const handleOpenFollowupForm = async () => {
    setFormError(null);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const cycle = await api.post<MonthlyCycle>('/monthly-cycles/initialize', {
        clientId: id,
        month,
        year,
      });
      
      // Cycle ID retrieved
      setSelectedCycleId(cycle.id);
      setFollowupModalOpen(true);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao carregar o ciclo operacional atual: ' + err.message);
    }
  };

  const handleSubmitFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      clientId: id,
      monthlyCycleId: selectedCycleId,
      weekStart,
      weekEnd,
      groupActivated,
      clientResponded,
      agencyRespondedOnTime,
      calendarOnTrack,
      hasDelayedDelivery,
      clientShowedDissatisfaction,
      churnRisk,
      contentGeneratedQuantity: contentGeneratedQuantity ? parseInt(contentGeneratedQuantity) : undefined,
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
      setContentGeneratedQuantity('');
      setManagerNotes('');
      setRecommendedAction('');
      setFollowupModalOpen(false);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao registrar acompanhamento.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Action Plan
  const handleAddActionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      clientId: id,
      monthlyCycleId: selectedCycleId || undefined,
      problem: planProblem,
      probableCause: planProbableCause || undefined,
      action: planAction,
      responsibleId: planResponsibleId || undefined,
      dueDate: planDueDate || undefined,
      priority: planPriority,
      status: 'open',
    };

    try {
      await api.post('/action-plans', payload);
      setPlanProblem('');
      setPlanProbableCause('');
      setPlanAction('');
      setPlanResponsibleId('');
      setPlanDueDate('');
      setPlanPriority('medium');
      setActionPlanModalOpen(false);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao criar plano de ação.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve Action Plan
  const handleOpenResolvePlanModal = (plan: ActionPlan, targetStatus: 'completed' | 'cancelled') => {
    setSelectedPlan(plan);
    setPlanTargetStatus(targetStatus);
    setPlanResult('');
    setPlanLearning('');
    setResolvePlanModalOpen(true);
  };

  const handleUpdateActionPlanStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    setFormError(null);

    const payload = {
      status: planTargetStatus,
      result: planResult || undefined,
      learning: planLearning || undefined,
    };

    try {
      await api.patch(`/action-plans/${selectedPlan.id}`, payload);
      setResolvePlanModalOpen(false);
      setSelectedPlan(null);
      fetchClientData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao atualizar plano de ação.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: ClientStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'inactive':
        return 'bg-[var(--border)] text-[var(--muted-foreground)] border-[var(--border)]';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)]';
    }
  };

  const getStatusLabel = (status: ClientStatus) => {
    const labels: Record<ClientStatus, string> = {
      active: 'Ativo',
      paused: 'Pausado',
      inactive: 'Inativo',
      cancelled: 'Cancelado',
      churned: 'Churn',
    };
    return labels[status] || status;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-[var(--muted-foreground)] text-sm mt-3">Carregando detalhes do cliente...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto space-y-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>{error || 'Cliente não encontrado.'}</div>
          </div>
          <Link href="/clients" className="text-[var(--foreground)] font-bold hover:underline inline-block">
            ← Voltar para Clientes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const manager = users.find((u) => u.id === client.managerId);
  const selectedCycle = cycles.find((c) => c.id === selectedCycleId);

  // Check if current month cycle exists
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const hasCurrentCycle = cycles.some((c) => c.month === currentMonth && c.year === currentYear);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-3">
          <Link href="/clients" className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] transition flex items-center gap-1">
            ← Voltar para Clientes
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">
                  {client.tradeName}
                </h1>
                <span className={`badge border ${getStatusBadgeClass(client.status)}`}>
                  {getStatusLabel(client.status)}
                </span>
              </div>
              {client.legalName && (
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{client.legalName}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] rounded-lg text-[var(--muted-foreground)] font-semibold text-sm hover:bg-[var(--secondary)] transition inline-flex items-center gap-2"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Editar Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="border-b border-[var(--border)] flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cadastro')}
            className={`pb-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'cadastro' ? 'border-primary text-primary' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]'
            }`}
          >
            Cadastro & Contatos
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contratos' ? 'border-slate-900 text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]'
            }`}
          >
            Contratos e Escopo
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'followup' ? 'border-slate-900 text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]'
            }`}
          >
            Diagnóstico Semanal
          </button>
          <button
            onClick={() => setActiveTab('action-plans')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'action-plans' ? 'border-slate-900 text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]'
            }`}
          >
            Planos de Ação
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'timeline' ? 'border-slate-900 text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]'
            }`}
          >
            Timeline
          </button>
          {(user?.role === 'admin' || user?.role === 'diretoria') && (
            <button
              onClick={() => setActiveTab('senhas')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'senhas' ? 'border-slate-900 text-[var(--foreground)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]'
              }`}
            >
              Senhas
            </button>
          )}
        </div>

        {/* Tab 1 Content: Basic Info */}
        {activeTab === 'cadastro' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-5 shadow-xs">
                <h3 className="font-bold text-[var(--foreground)] border-b border-slate-50 pb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
                  Informações Estratégicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium block">Segmento</span>
                    <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">{client.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium block">Perfil</span>
                    <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block">{client.clientProfile || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium block">Valor Contratual (Total)</span>
                    <span className="text-sm font-semibold text-slate-950 mt-0.5 block">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.monthlyContractValue || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium block">Maturidade de Marketing</span>
                    <span className="text-sm font-semibold text-[var(--foreground)] mt-0.5 block capitalize">{client.marketingMaturity || '—'}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="text-xs text-[var(--muted-foreground)] font-medium block">Notas Estratégicas</span>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1.5 bg-[var(--secondary)] p-3 rounded-lg border border-[var(--border)] whitespace-pre-wrap leading-relaxed">
                    {client.strategicNotes || 'Nenhuma nota estratégica cadastrada.'}
                  </p>
                </div>
              </div>

              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-[var(--foreground)] border-b border-slate-50 pb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
                  Atalhos Rápidos e Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client.whatsappGroupUrl ? (
                    <a href={client.whatsappGroupUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition text-emerald-800 font-semibold text-sm">
                      <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">🟢</span>Grupo do WhatsApp
                    </a>
                  ) : <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] text-sm"><span className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center">⚪</span>WhatsApp não configurado</div>}

                  {client.driveUrl ? (
                    <a href={client.driveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-[rgba(250,204,21,0.1)]/50 hover:bg-[rgba(250,204,21,0.1)] transition text-[var(--foreground)] font-semibold text-sm">
                      <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">📁</span>Pasta no Google Drive
                    </a>
                  ) : <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] text-sm"><span className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center">⚪</span>Drive não configurado</div>}

                  {client.clickupUrl ? (
                    <a href={client.clickupUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-cyan-100 bg-cyan-50/50 hover:bg-cyan-50 transition text-cyan-800 font-semibold text-sm">
                      <span className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">🎯</span>Pasta no ClickUp
                    </a>
                  ) : <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] text-sm"><span className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center">⚪</span>ClickUp não configurado</div>}

                  {client.instagramUrl ? (
                    <a href={client.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-pink-100 bg-pink-50/50 hover:bg-pink-50 transition text-pink-800 font-semibold text-sm">
                      <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">📸</span>Instagram Comercial
                    </a>
                  ) : <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] text-sm"><span className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center">⚪</span>Instagram não configurado</div>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-[var(--foreground)] border-b border-slate-50 pb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Atribuições e Squad</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[var(--muted-foreground)] block font-medium">Gestor da Conta</span>
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 text-[var(--foreground)] font-bold flex items-center justify-center text-xs">{manager?.name?.charAt(0) || 'G'}</div>
                      <div>
                        <span className="text-sm font-semibold text-[var(--foreground)] block">{manager?.name || 'Sem gestor'}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{manager?.email || ''}</span>
                      </div>
                    </div>
                  </div>
                  </div>
              </div>

              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 shadow-xs">
                <h3 className="font-bold text-[var(--foreground)] border-b border-slate-50 pb-3 text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Contato (Decisor)</h3>
                <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
                  <div><span className="text-xs text-[var(--muted-foreground)] block font-medium">Nome</span><span className="font-semibold text-[var(--foreground)] mt-0.5 block">{client.decisionMakerName || '—'}</span></div>
                  <div><span className="text-xs text-[var(--muted-foreground)] block font-medium">E-mail</span><span className="font-semibold text-[var(--foreground)] mt-0.5 block">{client.decisionMakerEmail || '—'}</span></div>
                  <div><span className="text-xs text-[var(--muted-foreground)] block font-medium">Telefone</span><span className="font-semibold text-[var(--foreground)] mt-0.5 block">{client.decisionMakerPhone || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Contracts & Scope */}
        {activeTab === 'contratos' && (
          <div className="space-y-6">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h3 className="font-bold text-[var(--foreground)] text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Contratos Ativos e Histórico</h3>
                <button onClick={() => setContractModalOpen(true)} className="btn-primary py-1.5 px-3 text-xs shadow-xs">Adicionar Contrato</button>
              </div>
              {contracts.length === 0 ? <p className="text-[var(--muted-foreground)] text-sm italic py-2">Nenhum contrato cadastrado.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[var(--secondary)] text-[var(--muted-foreground)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--border)]">
                        <th className="px-4 py-3">Início</th><th className="px-4 py-3">Fim</th><th className="px-4 py-3">Valor Mensal</th><th className="px-4 py-3">% GEE</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Anexo</th><th className="px-4 py-3">Notas</th><th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[var(--muted-foreground)]">
                      {contracts.map(c => (
                        <tr key={c.id} className="hover:bg-[var(--secondary)]/20 transition">
                          <td className="px-4 py-3">{new Date(c.startDate).toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-3">{c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : 'Sem prazo'}</td>
                          <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.monthlyValue)}</td>
                          <td className="px-4 py-3 font-medium text-[var(--muted-foreground)]">{c.geePercentage ? `${c.geePercentage}%` : '—'}</td>
                          <td className="px-4 py-3"><span className={`badge text-[10px] ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-[var(--border)] text-[var(--muted-foreground)]'}`}>{c.status === 'active' ? 'Ativo' : 'Encerrado'}</span></td>
                          <td className="px-4 py-3 text-center">{c.documentUrl ? <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="Ver Anexo"><svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></a> : '—'}</td>
                          <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] max-w-[200px] truncate">{c.notes || '—'}</td>
                          <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteContract(c.id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold">Remover</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-slate-50 gap-4">
                <div>
                  <h3 className="font-bold text-[var(--foreground)] text-sm uppercase tracking-wider text-[var(--muted-foreground)]">Escopo Operacional</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Acompanhamento de entregáveis por ciclo mensal.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {cycles.length > 0 && (
                    <select value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)} className="form-input text-xs py-1.5 px-3 w-44">
                      {cycles.map(c => <option key={c.id} value={c.id}>{monthNames[c.month - 1]} / {c.year}</option>)}
                    </select>
                  )}
                  {!hasCurrentCycle && <button onClick={handleInitializeCycle} className="btn-primary py-1.5 px-3 text-xs shadow-xs ml-auto whitespace-nowrap">Inicializar Ciclo</button>}
                </div>
              </div>

              {!selectedCycle ? <div className="text-center py-10"><p className="text-[var(--muted-foreground)] text-sm italic">Nenhum ciclo operacional encontrado.</p></div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[var(--secondary)] text-[var(--muted-foreground)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--border)]">
                        <th className="px-4 py-3">Tipo de Entregável</th><th className="px-4 py-3 text-center">Contratado</th><th className="px-4 py-3 text-center">Concluído</th><th className="px-4 py-3 text-center">Em Progresso</th><th className="px-4 py-3 text-center">Atrasado</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Obs</th><th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-[var(--muted-foreground)]">
                      {selectedCycle.monthlyDeliverables.map(d => (
                        <tr key={d.id} className="hover:bg-[var(--secondary)]/20 transition">
                          <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{d.deliverableType.name}</td>
                          <td className="px-4 py-3 text-center font-bold">{d.contractedQuantity}</td>
                          <td className="px-4 py-3 text-center text-emerald-600 font-bold">{d.deliveredQuantity}</td>
                          <td className="px-4 py-3 text-center text-[var(--foreground)] font-bold">{d.inProgressQuantity}</td>
                          <td className="px-4 py-3 text-center text-[var(--muted-foreground)] font-medium">{d.delayedQuantity}</td>
                          <td className="px-4 py-3"><span className={`badge text-[10px] ${d.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : d.status === 'in_progress' ? 'bg-[rgba(250,204,21,0.1)] text-[var(--foreground)]' : d.status === 'delayed' ? 'bg-rose-50 text-rose-700' : 'bg-[var(--border)]'}`}>{d.status === 'completed' ? 'Concluído' : d.status === 'in_progress' ? 'Em Progresso' : d.status === 'delayed' ? 'Atrasado' : 'Pendente'}</span></td>
                          <td className="px-4 py-3 text-[var(--muted-foreground)] text-sm">{d.notes || '-'}</td>
                          <td className="px-4 py-3 text-right"><button onClick={() => handleEditDeliverable(d)} className="text-[var(--foreground)] hover:text-[var(--muted-foreground)] text-xs font-bold">Lançar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3 Content: Weekly Diagnosis History */}
        {activeTab === 'followup' && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-5 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <div>
                <h3 className="font-bold text-[var(--foreground)] text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
                  Histórico de Diagnósticos Semanais
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Diagnósticos e score de saúde do cliente.</p>
              </div>
              <button
                onClick={handleOpenFollowupForm}
                className="btn-primary py-1.5 px-3 text-xs shadow-xs"
              >
                Lançar Acompanhamento
              </button>
            </div>

            {followups.length === 0 ? (
              <p className="text-[var(--muted-foreground)] text-sm italic py-4 text-center">Nenhum acompanhamento semanal lançado para este cliente.</p>
            ) : (
              <div className="space-y-4">
                {followups.map((f) => (
                  <div key={f.id} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--secondary)]/50 hover:bg-[var(--secondary)]/80 transition">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-[var(--foreground)] text-sm">
                          Semana: {new Date(f.weekStart).toLocaleDateString('pt-BR')} até{' '}
                          {new Date(f.weekEnd).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="block text-xs text-[var(--muted-foreground)] mt-0.5">
                          Lançado por: {f.manager?.name || 'Gestor'}
                        </span>
                      </div>
                      <span className={`badge border font-bold text-xs ${getScoreColor(f.weeklyScore)}`}>
                        Score: {f.weeklyScore} / 100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[var(--muted-foreground)] bg-[var(--card)] p-2.5 rounded-lg border border-[var(--border)]">
                      <div>Grupo Whats: <span className="font-semibold text-[var(--foreground)]">{f.groupActivated === 'yes' ? 'Sim' : 'Não'}</span></div>
                      <div>Respondeu: <span className="font-semibold text-[var(--foreground)]">{f.clientResponded === 'yes' ? 'Sim' : 'Não'}</span></div>
                      <div>Prazo interno: <span className="font-semibold text-[var(--foreground)]">{f.agencyRespondedOnTime === 'yes' ? 'Sim' : 'Não'}</span></div>
                      <div>Cronograma: <span className="font-semibold text-[var(--foreground)]">{f.calendarOnTrack === 'yes' ? 'Sim' : 'Não'}</span></div>
                      <div className="col-span-2">Atrasos de entregáveis: <span className="font-semibold text-[var(--foreground)]">{f.hasDelayedDelivery ? 'Sim' : 'Não'}</span></div>
                      <div className="col-span-2 font-medium">Insatisfação: <span className={`font-semibold ${f.clientShowedDissatisfaction ? 'text-rose-600' : 'text-[var(--foreground)]'}`}>{f.clientShowedDissatisfaction ? 'Detectada' : 'Não'}</span></div>
                    </div>

                    {f.contentGeneratedQuantity !== null && f.contentGeneratedQuantity !== undefined && (
                      <div className="text-xs mt-3 bg-[rgba(250,204,21,0.1)]/50 p-2.5 rounded-lg border border-yellow-100/60">
                        <span className="font-semibold text-[var(--foreground)]">Conteúdo Gerado na Semana:</span>
                        <span className="text-[var(--muted-foreground)] ml-1">{f.contentGeneratedQuantity} itens</span>
                      </div>
                    )}

                    {f.managerNotes && (
                      <div className="text-xs">
                        <span className="font-semibold text-[var(--muted-foreground)] block">Comentários do Gestor:</span>
                        <p className="text-[var(--muted-foreground)] mt-1">{f.managerNotes}</p>
                      </div>
                    )}

                    {f.recommendedAction && (
                      <div className="text-xs bg-rose-50/50 p-2 rounded border border-rose-100/60">
                        <span className="font-semibold text-rose-800 block">Ação Recomendada:</span>
                        <p className="text-rose-700 mt-0.5">{f.recommendedAction}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4 Content: Action Plans */}
        {activeTab === 'action-plans' && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-5 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <div>
                <h3 className="font-bold text-[var(--foreground)] text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
                  Planos de Ação do Cliente
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Ações corretivas de mitigação e contorno.</p>
              </div>
              <button
                onClick={() => setActionPlanModalOpen(true)}
                className="btn-primary py-1.5 px-3 text-xs shadow-xs"
              >
                Criar Plano de Ação
              </button>
            </div>

            {actionPlans.length === 0 ? (
              <p className="text-[var(--muted-foreground)] text-sm italic py-4 text-center">Nenhum plano de ação registrado para este cliente.</p>
            ) : (
              <div className="space-y-4">
                {actionPlans.map((plan) => (
                  <div key={plan.id} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--secondary)]/50 hover:bg-[var(--secondary)]/80 transition">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[var(--foreground)] text-sm block truncate">⚠️ {plan.problem}</span>
                        <span className="text-xs text-[var(--muted-foreground)] mt-1 block">
                          Criado por: {plan.creator?.name || 'Sistema'} | Atribuído a: {plan.responsible?.name || 'Não atribuído'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`badge border font-bold text-xs ${
                          plan.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : plan.status === 'in_progress' ? 'bg-[rgba(250,204,21,0.1)] text-[var(--foreground)]' : 'bg-[var(--border)] text-[var(--muted-foreground)]'
                        }`}>
                          {plan.status === 'completed' ? 'Concluído' : plan.status === 'in_progress' ? 'Em progresso' : 'Aberto'}
                        </span>
                        <span className={`badge border font-bold text-xs ${
                          plan.priority === 'critical' || plan.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-[var(--secondary)]'
                        }`}>
                          {plan.priority}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-[var(--muted-foreground)] bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
                      <div><strong>Causa provável:</strong> {plan.probableCause || 'Não informada'}</div>
                      <div><strong>Ação corretiva:</strong> {plan.action}</div>
                      <div><strong>Prazo final:</strong> {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}</div>
                    </div>

                    {plan.status === 'completed' && plan.result && (
                      <div className="text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded border border-emerald-100">
                        <strong>Resultado da ação:</strong>
                        <p className="mt-1">{plan.result}</p>
                        {plan.learning && (
                          <p className="mt-1"><strong>Aprendizado:</strong> {plan.learning}</p>
                        )}
                      </div>
                    )}

                    {plan.status !== 'completed' && plan.status !== 'cancelled' && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleOpenResolvePlanModal(plan, 'completed')}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded text-xs transition"
                        >
                          Concluir Plano
                        </button>
                        <button
                          onClick={() => handleOpenResolvePlanModal(plan, 'cancelled')}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 rounded text-xs transition"
                        >
                          Cancelar Plano
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5 Content: Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-5 shadow-xs">
            <h3 className="font-bold text-[var(--foreground)] text-sm uppercase tracking-wider text-[var(--muted-foreground)] border-b border-slate-50 pb-2">
              Linha do Tempo e Histórico do Cliente
            </h3>

            {timeline.length === 0 ? (
              <p className="text-[var(--muted-foreground)] text-sm italic py-4 text-center">Nenhum evento registrado no histórico.</p>
            ) : (
              <div className="relative border-l-2 border-[var(--border)] ml-3 pl-6 space-y-6">
                {timeline.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Circle Dot on Timeline */}
                    <span className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 border-white bg-yellow-400 shadow-xs flex items-center justify-center text-[8px] text-[var(--foreground)]">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[var(--foreground)] text-sm">{event.title}</h4>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-semibold">
                          {new Date(event.createdAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                        {event.description}
                      </p>
                      {event.creator && (
                        <span className="text-[10px] text-[var(--muted-foreground)] font-medium block mt-1">
                          Registrado por: {event.creator.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6 Content: Senhas */}
        {activeTab === 'senhas' && (user?.role === 'admin' || user?.role === 'diretoria') && (
          <ClientCredentials clientId={id as string} />
        )}

        {/* Sliding Drawer / Panel for Editing Client Info */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
              <div onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"></div>
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="pointer-events-auto w-screen max-w-xl">
                  <form onSubmit={handleUpdateClient} className="flex h-full flex-col bg-[var(--card)] shadow-2xl border-l border-[var(--border)]">
                    <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex items-center justify-between">
                      <div><h2 className="text-lg font-bold text-[var(--foreground)]">Editar Cliente</h2></div>
                      <button type="button" onClick={() => setDrawerOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)]"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                      {formError && <div className="bg-rose-50 text-rose-800 border p-3 rounded-lg text-xs">{formError}</div>}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">1. Identificação</h3>
                        <div><label className="form-label">Nome Fantasia *</label><input type="text" required value={tradeName} onChange={(e) => setTradeName(e.target.value)} className="form-input" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Razão Social</label><input type="text" value={legalName} onChange={(e) => setLegalName(e.target.value)} className="form-input" /></div>
                          <div><label className="form-label">Segmento</label><input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} className="form-input" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} className="form-input">
                              <option value="active">Ativo</option><option value="paused">Pausado</option><option value="inactive">Inativo</option><option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                          <div><label className="form-label">Data de Entrada *</label><input type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="form-input" /></div>
                        </div>
                        {(status === 'inactive' || status === 'cancelled' || status === 'churned') && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                            <div><label className="form-label text-rose-800">Data de Saída *</label><input type="date" required value={exitDate} onChange={(e) => setExitDate(e.target.value)} className="form-input" /></div>
                            <div><label className="form-label text-rose-800">Motivo da Saída *</label><textarea required rows={2} value={exitReason} onChange={(e) => setExitReason(e.target.value)} className="form-input resize-none" placeholder="Ex: Cancelou por corte de custos" /></div>
                          </div>
                        )}
                      </div>
                      <hr className="border-[var(--border)]" />
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">2. Contato e Endereço</h3>
                        <div><label className="form-label">Nome do Decisor</label><input type="text" value={decisionMakerName} onChange={(e) => setDecisionMakerName(e.target.value)} className="form-input" /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Telefone (Decisor)</label><input type="text" value={decisionMakerPhone} onChange={(e) => setDecisionMakerPhone(e.target.value)} className="form-input" /></div>
                          <div><label className="form-label">E-mail (Decisor)</label><input type="email" value={decisionMakerEmail} onChange={(e) => setDecisionMakerEmail(e.target.value)} className="form-input" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Cidade</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="form-input" /></div>
                          <div><label className="form-label">Estado (UF)</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} className="form-input" maxLength={2} /></div>
                        </div>
                      </div>
                      <hr className="border-[var(--border)]" />
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">3. Informações Estratégicas e Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Perfil do Cliente</label><input type="text" value={clientProfile} onChange={(e) => setClientProfile(e.target.value)} className="form-input" placeholder="Ex: Moderado, Agressivo" /></div>
                          <div>
                            <label className="form-label">Maturidade de Marketing</label>
                            <select value={marketingMaturity} onChange={(e) => setMarketingMaturity(e.target.value)} className="form-input">
                              <option value="">Selecione</option>
                              <option value="iniciante">Iniciante</option>
                              <option value="intermediario">Intermediário</option>
                              <option value="avancado">Avançado</option>
                            </select>
                          </div>
                        </div>
                        <div><label className="form-label">Notas Estratégicas</label><textarea rows={3} value={strategicNotes} onChange={(e) => setStrategicNotes(e.target.value)} className="form-input resize-none" placeholder="Observações de negócios, focos, etc." /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Link do WhatsApp (Grupo)</label><input type="url" value={whatsappGroupUrl} onChange={(e) => setWhatsappGroupUrl(e.target.value)} className="form-input" placeholder="https://chat.whatsapp.com/..." /></div>
                          <div><label className="form-label">Link do Drive</label><input type="url" value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} className="form-input" placeholder="https://drive.google.com/..." /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Link do ClickUp</label><input type="url" value={clickupUrl} onChange={(e) => setClickupUrl(e.target.value)} className="form-input" placeholder="https://app.clickup.com/..." /></div>
                          <div><label className="form-label">Instagram Comercial</label><input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="form-input" placeholder="https://instagram.com/..." /></div>
                        </div>
                      </div>
                      <hr className="border-[var(--border)]" />
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">4. Atribuição</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Gestor da Conta</label>
                            <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="form-input">
                              <option value="">Selecione</option>
                              {users.filter(u => u.role === 'gestor_cliente' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 text-sm text-[var(--muted-foreground)]">Cancelar</button>
                      <button type="submit" className="btn-primary">Salvar Alterações</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Adicionar Contrato */}
        {contractModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setContractModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
            <div className="bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] max-w-md w-full z-10 overflow-hidden">
              <form onSubmit={handleAddContract}>
                <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center"><h3 className="font-bold text-[var(--foreground)]">Novo Contrato</h3></div>
                <div className="p-6 space-y-4">
                  {formError && <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-xs">{formError}</div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label">Valor Mensal (R$) *</label><input type="text" required value={contractValue} onChange={(e) => setContractValue(formatCurrencyInput(e.target.value))} className="form-input" placeholder="0,00" /></div>
                    <div><label className="form-label">% Imposto</label><input type="number" step="0.01" value={contractTaxPercentage} onChange={(e) => setContractTaxPercentage(e.target.value)} className="form-input" placeholder="Opcional" /></div>
                  </div>
                  <div className="space-y-2 border border-[var(--border)] p-3 rounded-lg bg-[var(--card)]">
                    <label className="form-label">Repasse GEE</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="geeType" checked={contractGeeType === 'percentage'} onChange={() => setContractGeeType('percentage')} className="text-yellow-500 focus:ring-yellow-500 h-4 w-4 border-gray-300" /> Porcentagem (%)</label>
                      <label className="flex items-center gap-2 text-sm"><input type="radio" name="geeType" checked={contractGeeType === 'fixed'} onChange={() => setContractGeeType('fixed')} className="text-yellow-500 focus:ring-yellow-500 h-4 w-4 border-gray-300" /> Valor Fixo (R$)</label>
                    </div>
                    {contractGeeType === 'percentage' ? (
                      <div><input type="number" step="0.01" value={contractGeePercentage} onChange={(e) => setContractGeePercentage(e.target.value)} className="form-input" placeholder="% GEE (Opcional)" /></div>
                    ) : (
                      <div><input type="text" value={contractGeeFixedValue} onChange={(e) => setContractGeeFixedValue(formatCurrencyInput(e.target.value))} className="form-input" placeholder="0,00" /></div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label">Data de Início *</label><input type="date" required value={contractStart} onChange={(e) => setContractStart(e.target.value)} className="form-input" /></div>
                    <div><label className="form-label">Data de Fim (Para alertas)</label><input type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} className="form-input" /></div>
                  </div>
                  <div><label className="form-label">Link do Contrato (Drive, Dropbox, etc)</label><input type="url" value={contractDocumentUrl} onChange={(e) => setContractDocumentUrl(e.target.value)} className="form-input" placeholder="https://..." /></div>
                  <div><label className="form-label">Notas</label><textarea rows={2} value={contractNotes} onChange={(e) => setContractNotes(e.target.value)} className="form-input resize-none" /></div>
                </div>
                <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex justify-end gap-3">
                  <button type="button" onClick={() => setContractModalOpen(false)} className="text-xs font-semibold">Cancelar</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">Salvar Contrato</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Lançamento de Entregável */}
        {deliverableModalOpen && editingDeliverable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setDeliverableModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
            <div className="bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] max-w-md w-full z-10 overflow-hidden">
              <form onSubmit={handleUpdateDeliverable}>
                <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center"><h3 className="font-bold text-[var(--foreground)]">{editingDeliverable.deliverableType.name}</h3></div>
                <div className="p-6 space-y-4">
                  {formError && <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-xs">{formError}</div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label">Contratado *</label><input type="number" required min="0" value={contractedQty} onChange={(e) => setContractedQty(parseInt(e.target.value))} className="form-input" /></div>
                    <div><label className="form-label">Concluído</label><input type="number" min="0" value={deliveredQty} onChange={(e) => setDeliveredQty(parseInt(e.target.value))} className="form-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label">Em Progresso</label><input type="number" min="0" value={inProgressQty} onChange={(e) => setInProgressQty(parseInt(e.target.value))} className="form-input" /></div>
                    <div><label className="form-label">Atrasado</label><input type="number" min="0" value={delayedQty} onChange={(e) => setDelayedQty(parseInt(e.target.value))} className="form-input" /></div>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={deliverableStatus} onChange={(e) => setDeliverableStatus(e.target.value)} className="form-input">
                      <option value="pending">Pendente</option><option value="in_progress">Em Progresso</option><option value="completed">Concluído</option><option value="delayed">Atrasado</option>
                    </select>
                  </div>
                  <div><label className="form-label">Observações</label><textarea rows={2} value={deliverableNotes} onChange={(e) => setDeliverableNotes(e.target.value)} className="form-input resize-none" /></div>
                </div>
                <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex justify-end gap-3">
                  <button type="button" onClick={() => setDeliverableModalOpen(false)} className="text-xs font-semibold">Cancelar</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">Atualizar Metas</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Preencher Acompanhamento Semanal */}
        {followupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setFollowupModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
            <div className="bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] max-w-lg w-full z-10 overflow-hidden">
              <form onSubmit={handleSubmitFollowup}>
                <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[var(--foreground)]">Diagnóstico Semanal</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{client.tradeName}</p>
                  </div>
                  <button type="button" onClick={() => setFollowupModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-slate-650">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {formError && <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-xs">{formError}</div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label">Data de Início</label><input type="date" required value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="form-input" /></div>
                    <div><label className="form-label">Data de Fim</label><input type="date" required value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} className="form-input" /></div>
                  </div>
                  <hr className="border-[var(--border)]" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Grupo Whats Ativo? *</label>
                      <select value={groupActivated} onChange={(e) => setGroupActivated(e.target.value)} className="form-input">
                        <option value="yes">Sim</option><option value="no">Não</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Cliente Respondeu? *</label>
                      <select value={clientResponded} onChange={(e) => setClientResponded(e.target.value)} className="form-input">
                        <option value="yes">Sim</option><option value="no">Não</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Prazo Resposta interno? *</label>
                      <select value={agencyRespondedOnTime} onChange={(e) => setAgencyRespondedOnTime(e.target.value)} className="form-input">
                        <option value="yes">Sim</option><option value="no">Não</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Cronograma em Dia? *</label>
                      <select value={calendarOnTrack} onChange={(e) => setCalendarOnTrack(e.target.value)} className="form-input">
                        <option value="yes">Sim</option><option value="no">Não</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={hasDelayedDelivery} onChange={(e) => setHasDelayedDelivery(e.target.checked)} className="rounded border-[var(--border)] text-yellow-500 focus:ring-yellow-500 w-4.5 h-4.5" />
                      Houve atraso em algum entregável?
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={clientShowedDissatisfaction} onChange={(e) => setClientShowedDissatisfaction(e.target.checked)} className="rounded border-[var(--border)] text-yellow-500 focus:ring-yellow-500 w-4.5 h-4.5" />
                      Cliente manifestou insatisfação?
                    </label>
                  </div>
                  <hr className="border-[var(--border)]" />
                  <div><label className="form-label">Risco de Churn (Sinalizado pelo time)</label><select value={churnRisk} onChange={(e) => setChurnRisk(e.target.value)} className="form-input"><option value="none">Nenhum Risco Aparente</option><option value="low">Risco Baixo (Insatisfação pontual)</option><option value="medium">Risco Médio (Vários desalinhamentos)</option><option value="high">Risco Alto (Aviso de cancelamento / muita insatisfação)</option></select></div>
                  <div><label className="form-label">Quantidade de Conteúdo Gerado</label><input type="number" min="0" value={contentGeneratedQuantity} onChange={(e) => setContentGeneratedQuantity(e.target.value)} className="form-input" placeholder="Ex: 15" /></div>
                  <div><label className="form-label">Observações</label><textarea rows={2} value={managerNotes} onChange={(e) => setManagerNotes(e.target.value)} className="form-input resize-none" /></div>
                  <div><label className="form-label">Ação Recomendada</label><textarea rows={2} value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)} className="form-input resize-none" /></div>
                </div>

                <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex justify-end gap-3">
                  <button type="button" onClick={() => setFollowupModalOpen(false)} className="text-xs font-semibold">Cancelar</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">Enviar Diagnóstico</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adicionar Plano de Ação */}
        {actionPlanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActionPlanModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
            <div className="bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] max-w-md w-full z-10 overflow-hidden">
              <form onSubmit={handleAddActionPlan}>
                <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--foreground)]">Criar Plano de Ação</h3>
                </div>
                <div className="p-6 space-y-4">
                  {formError && <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-xs">{formError}</div>}
                  <div>
                    <label className="form-label">Problema Identificado *</label>
                    <textarea required rows={2} value={planProblem} onChange={(e) => setPlanProblem(e.target.value)} className="form-input resize-none" placeholder="Ex: Atraso de 15 dias nas artes de post" />
                  </div>
                  <div>
                    <label className="form-label">Causa Provável</label>
                    <textarea rows={2} value={planProbableCause} onChange={(e) => setPlanProbableCause(e.target.value)} className="form-input resize-none" placeholder="Ex: Designer principal de licença médica" />
                  </div>
                  <div>
                    <label className="form-label">Ação Corretiva *</label>
                    <textarea required rows={2} value={planAction} onChange={(e) => setPlanAction(e.target.value)} className="form-input resize-none" placeholder="Ex: Alocar designer freelancer temporariamente" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Responsável</label>
                      <select value={planResponsibleId} onChange={(e) => setPlanResponsibleId(e.target.value)} className="form-input">
                        <option value="">Selecione</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Prioridade</label>
                      <select value={planPriority} onChange={(e) => setPlanPriority(e.target.value)} className="form-input">
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Prazo Final</label>
                    <input type="date" value={planDueDate} onChange={(e) => setPlanDueDate(e.target.value)} className="form-input" />
                  </div>
                </div>
                <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex justify-end gap-3">
                  <button type="button" onClick={() => setActionPlanModalOpen(false)} className="text-xs font-semibold">Cancelar</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">Salvar Plano</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Concluir/Cancelar Plano de Ação */}
        {resolvePlanModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setResolvePlanModalOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
            <div className="bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] max-w-md w-full z-10 overflow-hidden">
              <form onSubmit={handleUpdateActionPlanStatus}>
                <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--foreground)]">
                    {planTargetStatus === 'completed' ? 'Concluir Plano de Ação' : 'Cancelar Plano de Ação'}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {formError && <div className="bg-rose-50 text-rose-800 p-2.5 rounded text-xs">{formError}</div>}
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">
                      Problema original: <strong>{selectedPlan.problem}</strong>
                    </p>
                  </div>
                  <div>
                    <label className="form-label">
                      {planTargetStatus === 'completed' ? 'Resultado Obtido *' : 'Motivo do Cancelamento *'}
                    </label>
                    <textarea required rows={3} value={planResult} onChange={(e) => setPlanResult(e.target.value)} className="form-input resize-none" placeholder="Detalhes dos resultados alcançados..." />
                  </div>
                  {planTargetStatus === 'completed' && (
                    <div>
                      <label className="form-label">Aprendizado/Lições Aprendidas</label>
                      <textarea rows={2} value={planLearning} onChange={(e) => setPlanLearning(e.target.value)} className="form-input resize-none" placeholder="O que podemos aprender para o futuro..." />
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex justify-end gap-3">
                  <button type="button" onClick={() => setResolvePlanModalOpen(false)} className="text-xs font-semibold">Cancelar</button>
                  <button type="submit" disabled={submitting} className="btn-primary text-xs py-1.5 px-3">
                    {planTargetStatus === 'completed' ? 'Marcar como Concluído' : 'Confirmar Cancelamento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
