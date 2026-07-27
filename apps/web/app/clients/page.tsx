'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { Client, Squad, AuthUser, ClientStatus, HealthStatus } from '@/lib/types';
import { ImportClientsModal } from '@/components/clients/ImportClientsModal';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Form Fields
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [segment, setSegment] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsData, usersData] = await Promise.all([
        api.get<Client[]>('/clients'),
        api.get<AuthUser[]>('/users'),
      ]);
      setClients(clientsData);
      setUsers(usersData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao carregar dados dos clientes. Por favor, verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      tradeName,
      legalName: legalName || undefined,
      segment: segment || undefined,
      status,
      entryDate,
      managerId: managerId || undefined,
      decisionMakerName: decisionMakerName || undefined,
      decisionMakerPhone: decisionMakerPhone || undefined,
      decisionMakerEmail: decisionMakerEmail || undefined,
      city: city || undefined,
      state: state || undefined,
      instagramUrl: instagramUrl || undefined,
      driveUrl: driveUrl || undefined,
      clickupUrl: clickupUrl || undefined,
      whatsappGroupUrl: whatsappGroupUrl || undefined,
      clientProfile: clientProfile || undefined,
      marketingMaturity: marketingMaturity || undefined,
      strategicNotes: strategicNotes || undefined,
    };

    try {
      await api.post('/clients', payload);
      // Reset form
      setTradeName('');
      setLegalName('');
      setSegment('');
      setStatus('active');
      setEntryDate(new Date().toISOString().split('T')[0]);
      setManagerId('');
      setDecisionMakerName('');
      setDecisionMakerPhone('');
      setDecisionMakerEmail('');
      setCity('');
      setState('');
      setInstagramUrl('');
      setDriveUrl('');
      setClickupUrl('');
      setWhatsappGroupUrl('');
      setClientProfile('');
      setMarketingMaturity('');
      setStrategicNotes('');

      setDrawerOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Erro ao criar cliente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter client list
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.tradeName.toLowerCase().includes(search.toLowerCase()) ||
      (client.legalName && client.legalName.toLowerCase().includes(search.toLowerCase())) ||
      (client.segment && client.segment.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter ? client.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

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

  const getHealthBadgeClass = (health?: HealthStatus) => {
    switch (health) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Clientes
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Gerencie a carteira de clientes ativos, squads e contratos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setImportModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              Importar Clientes
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn-primary inline-flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 shadow-xs flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Buscar por nome ou segmento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="inactive">Inativo</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        {/* Clients list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-[var(--muted-foreground)] text-sm mt-3">Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
            <svg className="w-12 h-12 text-[var(--muted-foreground)] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-[var(--foreground)] font-semibold mt-4">Nenhum cliente encontrado</h3>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">
              Tente redefinir seus filtros ou adicione um novo cliente.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-xs">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--secondary)] border-b border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                    <th className="px-6 py-4">Nome Fantasia</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Contrato (Mensal)</th>
                    <th className="px-6 py-4">Gestor</th>
                    <th className="px-6 py-4">Entrada</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-[var(--muted-foreground)]">
                  {filteredClients.map((client) => {
                    const manager = users.find((u) => u.id === client.managerId);

                    return (
                      <tr key={client.id} className="hover:bg-[var(--secondary)]/50 transition">
                        <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                          {client.tradeName}
                          {client.segment && (
                            <span className="block text-xs font-normal text-[var(--muted-foreground)] mt-0.5">
                              {client.segment}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge border ${getStatusBadgeClass(client.status)}`}>
                            {getStatusLabel(client.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(client.monthlyContractValue || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-medium text-[var(--foreground)]">
                            {manager?.name || 'Sem Gestor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)]">
                          {new Date(client.entryDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-[var(--foreground)] hover:text-[var(--muted-foreground)] font-semibold inline-flex items-center gap-1"
                          >
                            Ver detalhes →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card list */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredClients.map((client) => {
                const manager = users.find((u) => u.id === client.managerId);

                return (
                  <div key={client.id} className="border border-[var(--border)] rounded-xl p-4 space-y-3 bg-[var(--card)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[var(--foreground)]">{client.tradeName}</h4>
                        <p className="text-xs text-[var(--muted-foreground)]">{client.segment || 'Sem segmento'}</p>
                      </div>
                      <span className={`badge border ${getStatusBadgeClass(client.status)}`}>
                        {getStatusLabel(client.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-50 py-2">
                      <div>
                        <span className="block text-[var(--muted-foreground)] font-medium">Contrato</span>
                        <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(client.monthlyContractValue || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[var(--muted-foreground)] font-medium">Entrada</span>
                        <span className="font-semibold text-[var(--foreground)] mt-0.5 block">
                          {new Date(client.entryDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <div>
                        <span className="text-[var(--muted-foreground)]">Gestor:</span>
                        <span className="font-medium text-[var(--muted-foreground)] ml-1">
                          {manager?.name?.split(' ')[0] || 'Sem Gestor'}
                        </span>
                      </div>
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-[var(--foreground)] font-bold hover:underline"
                      >
                        Acessar →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sliding Drawer / Panel for New Client Form */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
              {/* Backdrop */}
              <div
                onClick={() => setDrawerOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              ></div>

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="pointer-events-auto w-screen max-w-xl">
                  <form onSubmit={handleCreateClient} className="flex h-full flex-col bg-[var(--card)] shadow-2xl border-l border-[var(--border)]">
                    {/* Header */}
                    <div className="px-6 py-5 bg-[var(--secondary)] border-b border-[var(--border)] flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-[var(--foreground)]" id="slide-over-title">
                          Cadastrar Novo Cliente
                        </h2>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Preencha as informações operacionais básicas do cliente.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        className="rounded-md text-[var(--muted-foreground)] hover:text-[var(--muted-foreground)] focus:outline-none"
                      >
                        <span className="sr-only">Fechar</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                      {formError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs">
                          {formError}
                        </div>
                      )}

                      {/* Section 1: Identificação */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          1. Identificação Comercial
                        </h3>

                        <div>
                          <label className="form-label">Nome Fantasia *</label>
                          <input
                            type="text"
                            required
                            value={tradeName}
                            onChange={(e) => setTradeName(e.target.value)}
                            placeholder="Ex: Up&Up Digital"
                            className="form-input"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Razão Social</label>
                            <input
                              type="text"
                              value={legalName}
                              onChange={(e) => setLegalName(e.target.value)}
                              placeholder="Ex: Up Up Ltda"
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="form-label">Segmento</label>
                            <input
                              type="text"
                              value={segment}
                              onChange={(e) => setSegment(e.target.value)}
                              placeholder="Ex: E-commerce"
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Data de Entrada *</label>
                            <input
                              type="date"
                              required
                              value={entryDate}
                              onChange={(e) => setEntryDate(e.target.value)}
                              className="form-input"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-[var(--border)]" />

                      {/* Section 2: Operações */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          2. Atribuição e Squad
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Gestor Responsável</label>
                            <select
                              value={managerId}
                              onChange={(e) => setManagerId(e.target.value)}
                              className="form-input"
                            >
                              <option value="">Selecione um Gestor</option>
                              {users
                                .filter((u) => u.role === 'gestor_cliente' || u.role === 'admin' || u.role === 'super_admin')
                                .map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Cidade</label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="São Paulo"
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="form-label">Estado (UF)</label>
                            <input
                              type="text"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="SP"
                              maxLength={2}
                              className="form-input"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-[var(--border)]" />

                      {/* Section 3: Links Estratégicos */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          3. Links & Ferramentas
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Grupo WhatsApp (Link)</label>
                            <input
                              type="url"
                              value={whatsappGroupUrl}
                              onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                              placeholder="https://chat.whatsapp.com/..."
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="form-label">Pasta Google Drive</label>
                            <input
                              type="url"
                              value={driveUrl}
                              onChange={(e) => setDriveUrl(e.target.value)}
                              placeholder="https://drive.google.com/..."
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">ClickUp (Pasta/Link)</label>
                            <input
                              type="url"
                              value={clickupUrl}
                              onChange={(e) => setClickupUrl(e.target.value)}
                              placeholder="https://app.clickup.com/..."
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="form-label">Instagram do Cliente</label>
                            <input
                              type="url"
                              value={instagramUrl}
                              onChange={(e) => setInstagramUrl(e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="form-input"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-[var(--border)]" />

                      {/* Section 4: Informações do Decisor */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          4. Contato (Decisor)
                        </h3>

                        <div>
                          <label className="form-label">Nome do Decisor</label>
                          <input
                            type="text"
                            value={decisionMakerName}
                            onChange={(e) => setDecisionMakerName(e.target.value)}
                            placeholder="Ex: João da Silva"
                            className="form-input"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Telefone</label>
                            <input
                              type="text"
                              value={decisionMakerPhone}
                              onChange={(e) => setDecisionMakerPhone(e.target.value)}
                              placeholder="Ex: (11) 99999-9999"
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="form-label">E-mail</label>
                            <input
                              type="email"
                              value={decisionMakerEmail}
                              onChange={(e) => setDecisionMakerEmail(e.target.value)}
                              placeholder="Ex: joao@cliente.com"
                              className="form-input"
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-[var(--border)]" />

                      {/* Section 5: Notas Estratégicas */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                          5. Perfil & Notas
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Perfil do Cliente</label>
                            <input
                              type="text"
                              value={clientProfile}
                              onChange={(e) => setClientProfile(e.target.value)}
                              placeholder="Ex: Varejo, B2B"
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="form-label">Maturidade de Marketing</label>
                            <select
                              value={marketingMaturity}
                              onChange={(e) => setMarketingMaturity(e.target.value)}
                              className="form-input"
                            >
                              <option value="">Selecione a Maturidade</option>
                              <option value="iniciante">Iniciante</option>
                              <option value="intermediaria">Intermediária</option>
                              <option value="avancada">Avançada</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="form-label">Notas Estratégicas</label>
                          <textarea
                            rows={3}
                            value={strategicNotes}
                            onChange={(e) => setStrategicNotes(e.target.value)}
                            placeholder="Informações relevantes sobre as expectativas e dores do cliente..."
                            className="form-input resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        {submitting && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        Salvar Cliente
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <ImportClientsModal
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
}
