'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ServiceProvider {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  role: string | null;
  clientLinks?: { id: string; role: string; client: { id: string; tradeName: string; status: string; } }[];
  createdAt: string;
  updatedAt: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      setLoading(true);
      const data = await api.get<ServiceProvider[]>('/service-providers');
      setProviders(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar prestadores');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await api.post('/service-providers', {
        name,
        email: email || undefined,
        whatsapp: whatsapp || undefined,
        role: role || undefined,
      });

      setIsModalOpen(false);
      setName('');
      setEmail('');
      setWhatsapp('');
      setRole('');
      fetchProviders();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar prestador');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente remover este prestador?')) return;
    try {
      await api.delete(`/service-providers/${id}`);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover prestador');
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center text-slate-400">Carregando prestadores...</div>
    </DashboardLayout>
  );
  if (error) return (
    <DashboardLayout>
      <div className="p-8 text-center text-rose-500">{error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#09090b] p-6 rounded-xl border border-[#27272a] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Prestadores de Serviço</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie a rede de freelancers e parceiros</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Prestador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-[#09090b] p-5 rounded-xl shadow-xs border border-[#27272a] hover:border-[#3f3f46] transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(250,204,21,0.1)] text-[#fafafa] flex items-center justify-center font-bold text-sm">
                {provider.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => handleDelete(provider.id)} className="text-slate-400 hover:text-rose-500 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <h3 className="font-bold text-[#fafafa] text-lg">{provider.name}</h3>
            {provider.role && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                {provider.role}
              </span>
            )}
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {provider.email || <span className="text-slate-400 italic">Não informado</span>}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {provider.whatsapp || <span className="text-slate-400 italic">Não informado</span>}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#27272a]">
              <details className="group">
                <summary className="text-sm font-medium text-slate-400 cursor-pointer hover:text-[#fafafa] transition flex items-center gap-1 select-none outline-none">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  Atende {provider.clientLinks?.length || 0} cliente(s)
                </summary>
                <div className="mt-3 pl-5 space-y-2">
                  {[...(provider.clientLinks || [])]
                    .sort((a, b) => a.client.tradeName.localeCompare(b.client.tradeName))
                    .map(link => {
                    const isRepeated = (provider.clientLinks?.filter(l => l.client.id === link.client.id).length || 0) > 1;
                    return (
                      <div key={link.id} className="text-sm text-slate-300 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${link.client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                        {link.client.tradeName}
                        {isRepeated && link.role && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#27272a] text-slate-400">
                            {link.role === 'ServiceProvider' ? provider.role : link.role}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {(!provider.clientLinks || provider.clientLinks.length === 0) && (
                    <div className="text-sm text-slate-500 italic">Nenhum cliente associado.</div>
                  )}
                </div>
              </details>
            </div>
          </div>
        ))}

        {providers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-[#09090b] rounded-xl border border-[#27272a] border-dashed">
            Nenhum prestador de serviço cadastrado.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#fafafa]">Novo Prestador</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-400 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100">{formError}</div>}
              
              <div>
                <label className="form-label">Nome *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder="João da Silva" />
              </div>
              
              <div>
                <label className="form-label">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="joao@exemplo.com" />
              </div>

              <div>
                <label className="form-label">WhatsApp</label>
                <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="form-input" placeholder="(11) 99999-9999" />
              </div>

              <div>
                <label className="form-label">Função / Especialidade</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="form-input">
                  <option value="">Selecione uma função</option>
                  <option value="Filmaker">Filmaker</option>
                  <option value="Editor">Editor</option>
                  <option value="Designer">Designer</option>
                  <option value="GEE">GEE</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
