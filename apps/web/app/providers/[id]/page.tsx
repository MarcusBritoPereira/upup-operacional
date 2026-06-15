'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface ProviderProfile {
  provider: {
    id: string;
    name: string;
    email: string | null;
    whatsapp: string | null;
    role: string | null;
    clientLinks: { id: string; role: string; client: { id: string; tradeName: string; status: string; } }[];
  };
  clickupProfile: {
    clickupUserId: number;
    username: string | null;
    email: string;
    role: string;
    profilePicture: string | null;
    lastActive: string | null;
  } | null;
  tasks: {
    id: string;
    name: string;
    status: string | null;
    statusType: string | null;
    priority: string | null;
    list: string | null;
    folder: string | null;
    space: string | null;
    dueDate: string | null;
    url: string | null;
  }[];
  stats: {
    open: number;
    completed: number;
    overdue: number;
  };
}

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await api.get<ProviderProfile>(`/service-providers/${id}/profile`);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil do prestador');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center text-[var(--muted-foreground)]">Carregando perfil...</div>
    </DashboardLayout>
  );
  if (error) return (
    <DashboardLayout>
      <div className="p-8 text-center text-rose-500">{error}</div>
    </DashboardLayout>
  );
  if (!profile) return null;

  const { provider, clickupProfile, tasks, stats } = profile;

  // Calculates completion percentage
  const totalTasks = stats.open + stats.completed;
  const completionRate = totalTasks > 0 ? Math.round((stats.completed / totalTasks) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header / Nav */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/providers')}
            className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Perfil do Prestador</h1>
            <p className="text-[var(--muted-foreground)] text-sm">Visão geral de produtividade e dados</p>
          </div>
        </div>

        {/* 90/10 Asymmetric Tension Layout (Left heavy info, right heavy metrics) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Provider Info & Clients) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Identity Card */}
            <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
              
              <div className="flex flex-col items-center text-center mt-4">
                {clickupProfile?.profilePicture ? (
                  <img src={clickupProfile.profilePicture} alt={provider.name} className="w-24 h-24 rounded-full border-4 border-[var(--background)] shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[rgba(250,204,21,0.1)] text-[var(--foreground)] flex items-center justify-center font-bold text-3xl border-4 border-[var(--background)] shadow-md">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">{provider.name}</h2>
                {provider.role && (
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    {provider.role}
                  </span>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="truncate">{provider.email || 'Sem e-mail'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span>{provider.whatsapp || 'Sem WhatsApp'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--foreground)]">ClickUp:</span> 
                    {clickupProfile ? (
                      <span className="text-emerald-500 font-medium">Vinculado</span>
                    ) : (
                      <span className="text-rose-500 font-medium">Não encontrado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
              <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Empresas Atendidas ({provider.clientLinks?.length || 0})
              </h3>
              
              <div className="space-y-3">
                {(!provider.clientLinks || provider.clientLinks.length === 0) ? (
                  <p className="text-sm text-[var(--muted-foreground)] italic">Nenhum cliente associado.</p>
                ) : (
                  [...provider.clientLinks].sort((a, b) => a.client.tradeName.localeCompare(b.client.tradeName)).map(link => (
                    <Link key={link.id} href={`/clients/${link.client.id}`} className="group flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-amber-500/50 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${link.client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-amber-500 transition">{link.client.tradeName}</p>
                          {link.role !== 'ServiceProvider' && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{link.role}</p>}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-[var(--muted-foreground)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Metrics & Tasks) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* KPI Brutalist Fragment */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                <p className="text-sm text-[var(--muted-foreground)] font-medium">Total de Tarefas</p>
                <p className="text-4xl font-black text-[var(--foreground)] mt-2 font-mono tracking-tighter">{totalTasks}</p>
              </div>

              <div className="bg-[var(--card)] p-5 rounded-2xl border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                <p className="text-sm text-emerald-500 font-medium">Concluídas</p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">{stats.completed}</p>
                  <p className="text-sm text-emerald-500/70 font-bold pb-1">{completionRate}%</p>
                </div>
              </div>

              <div className="bg-[var(--card)] p-5 rounded-2xl border border-yellow-500/30 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all"></div>
                <p className="text-sm text-yellow-500 font-medium">Em Andamento</p>
                <p className="text-4xl font-black text-yellow-400 mt-2 font-mono tracking-tighter">{stats.open}</p>
              </div>

              <div className="bg-[var(--card)] p-5 rounded-2xl border border-rose-500/30 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
                <p className="text-sm text-rose-500 font-medium">Atrasadas</p>
                <p className="text-4xl font-black text-rose-400 mt-2 font-mono tracking-tighter">{stats.overdue}</p>
              </div>
            </div>

            {/* Task List Section */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Quadro de Tarefas (ClickUp)</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Sincronizado automaticamente</p>
                </div>
                {clickupProfile && (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    Conectado
                  </span>
                )}
              </div>

              {!clickupProfile ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <h4 className="text-[var(--foreground)] font-bold text-lg mb-2">ClickUp Não Vinculado</h4>
                  <p className="text-[var(--muted-foreground)] text-sm max-w-sm mx-auto">
                    Não foi possível encontrar um usuário no ClickUp com o e-mail "{provider.email}". Verifique se o e-mail está correto em ambas as plataformas.
                  </p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[var(--muted-foreground)]">Nenhuma tarefa atribuída a este prestador no ClickUp.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)] max-h-[600px] overflow-y-auto custom-scrollbar">
                  {tasks.map(task => {
                    const isOverdue = task.dueDate && new Date(parseInt(task.dueDate, 10)) < new Date() && task.statusType !== 'done' && task.statusType !== 'closed';
                    const isDone = task.statusType === 'done' || task.statusType === 'closed';
                    
                    return (
                      <div key={task.id} className="p-4 hover:bg-[var(--background)] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                              isDone ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                              isOverdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {task.status || 'sem status'}
                            </span>
                            {task.priority && (
                              <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-0.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" /></svg>
                                P{task.priority}
                              </span>
                            )}
                          </div>
                          <a href={task.url || '#'} target="_blank" rel="noopener noreferrer" className="text-[var(--foreground)] font-semibold text-sm truncate block hover:text-blue-400 transition">
                            {task.name}
                          </a>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                              {task.folder || 'Sem pasta'} / {task.list || 'Sem lista'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1 shrink-0">
                          {task.dueDate ? (
                            <div className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                              isDone ? 'bg-transparent border-transparent text-[var(--muted-foreground)]' :
                              isOverdue ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                              'bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]'
                            }`}>
                              {new Date(parseInt(task.dueDate, 10)).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--muted-foreground)] italic px-2.5 py-1">Sem prazo</div>
                          )}
                          <a href={task.url || '#'} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)] border border-[var(--border)] transition opacity-0 sm:group-hover:opacity-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
