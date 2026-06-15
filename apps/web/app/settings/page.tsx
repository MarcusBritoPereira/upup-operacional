'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword
      });
      setSuccess('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Configurações</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Gerencie seu perfil e segurança.</p>
        </div>

        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm max-w-md">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            Alterar Senha
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm border border-rose-500/20">{error}</div>}
            {success && <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm border border-emerald-500/20">{success}</div>}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Senha Atual</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-amber-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Nova Senha</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-amber-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Confirmar Nova Senha</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-amber-500 outline-none transition" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-sm transition disabled:opacity-50">
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
