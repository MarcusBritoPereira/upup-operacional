'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Credential {
  id: string;
  clientId: string;
  systemName: string;
  url: string | null;
  username: string | null;
  password?: string;
  createdAt: string;
}

export function ClientCredentials({ clientId }: { clientId: string }) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemName, setSystemName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, [clientId]);

  async function fetchCredentials() {
    try {
      setLoading(true);
      const data = await api.get<Credential[]>(`/credentials?clientId=${clientId}`);
      setCredentials(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar senhas');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await api.post('/credentials', {
        clientId,
        systemName,
        url: url || undefined,
        username: username || '',
        password,
      });

      setIsModalOpen(false);
      setSystemName('');
      setUrl('');
      setUsername('');
      setPassword('');
      fetchCredentials();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar senha');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta credencial?')) return;
    try {
      await api.delete(`/credentials/${id}`);
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  }

  if (loading) return <div className="text-sm text-slate-400 py-4">Carregando senhas...</div>;
  if (error) return <div className="text-sm text-rose-500 py-4">{error}</div>;

  return (
    <div className="bg-[#09090b] rounded-xl border border-[#27272a] p-6 shadow-xs">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider text-slate-400">
            Gerenciador de Senhas
          </h3>
          <p className="text-xs text-slate-400 mt-1">Visível apenas para Diretoria e Admin</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary text-xs py-1.5 px-3">
          Nova Senha
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map(cred => (
          <div key={cred.id} className="border border-[#27272a] rounded-lg p-4 bg-[#18181b] relative group">
            <button 
              onClick={() => handleDelete(cred.id)}
              className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <h4 className="font-bold text-slate-200 mb-2">{cred.systemName}</h4>
            <div className="space-y-1 text-sm text-slate-400">
              {cred.url && (
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400 text-xs uppercase">URL:</span>
                  <a href={cred.url} target="_blank" rel="noreferrer" className="text-[#fafafa] hover:text-slate-300 hover:underline truncate ml-2 max-w-[200px]">
                    {cred.url}
                  </a>
                </div>
              )}
              {cred.username && (
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400 text-xs uppercase">Usuário:</span>
                  <span className="font-mono text-xs">{cred.username}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-[#3f3f46]/50 mt-2">
                <span className="font-semibold text-slate-400 text-xs uppercase">Senha:</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="password" 
                    value="*********" 
                    readOnly 
                    className="bg-transparent border-none text-right font-mono text-xs w-24 focus:outline-none" 
                  />
                  <button 
                    onClick={async () => {
                      try {
                        const res = await api.get<{password: string}>(`/credentials/${cred.id}`);
                        navigator.clipboard.writeText(res.password);
                        alert('Senha copiada para a área de transferência!');
                      } catch(e) {
                        alert('Erro ao buscar senha original.');
                      }
                    }}
                    className="text-[#fafafa] hover:text-slate-300 p-1 bg-[#09090b] rounded shadow-xs"
                    title="Copiar Senha"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {credentials.length === 0 && (
          <div className="col-span-full py-6 text-center text-slate-400 italic">
            Nenhuma senha cadastrada.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-md font-bold text-[#fafafa]">Nova Senha</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {formError && <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-100">{formError}</div>}
              
              <div>
                <label className="form-label text-xs">Sistema/Plataforma *</label>
                <input required type="text" value={systemName} onChange={e => setSystemName(e.target.value)} className="form-input text-sm py-1.5" placeholder="Ex: RD Station" />
              </div>
              
              <div>
                <label className="form-label text-xs">URL / Link de Acesso</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="form-input text-sm py-1.5" placeholder="https://" />
              </div>

              <div>
                <label className="form-label text-xs">Usuário / E-mail</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="form-input text-sm py-1.5" />
              </div>

              <div>
                <label className="form-label text-xs">Senha *</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input text-sm py-1.5" />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-1.5 px-3">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary text-xs py-1.5 px-3">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
