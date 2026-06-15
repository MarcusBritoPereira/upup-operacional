'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Effect to populate initial user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const response = await api.patch('/users/me/profile', {
        name,
        email,
        phone
      });
      updateUser(response as any);
      setProfileSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Create a specific fetch request since api.post usually sends JSON
      const token = document.cookie.split('; ').find(row => row.startsWith('upup_token='))?.split('=')[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao fazer upload da imagem');
      }

      const responseData = await res.json();
      updateUser(responseData);
      setAvatarUrl(responseData.avatarUrl);
      setProfileSuccess('Foto de perfil atualizada!');
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao enviar a imagem.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword
      });
      setPasswordSuccess('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Configurações</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Gerencie seu perfil e segurança.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Informações do Perfil
            </h2>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="relative w-24 h-24 rounded-full border-4 border-[var(--background)] shadow-md overflow-hidden bg-amber-100 flex items-center justify-center cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-amber-600 font-bold text-2xl tracking-widest">{getInitials(name)}</span>
                )}
                
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />
              <span className="text-xs text-[var(--muted-foreground)] mt-2">Clique para alterar a foto</span>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileError && <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm border border-rose-500/20">{profileError}</div>}
              {profileSuccess && <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm border border-emerald-500/20">{profileSuccess}</div>}

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-amber-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-amber-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Telefone / WhatsApp</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(DD) 90000-0000" className="w-full p-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-amber-500 outline-none transition" />
              </div>

              <button type="submit" disabled={profileLoading} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-sm transition disabled:opacity-50 mt-4">
                {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm self-start">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Alterar Senha
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm border border-rose-500/20">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm border border-emerald-500/20">{passwordSuccess}</div>}

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

              <button type="submit" disabled={passwordLoading} className="w-full py-2.5 border border-amber-500 text-amber-500 hover:bg-amber-500/10 font-bold rounded-lg text-sm transition disabled:opacity-50 mt-4">
                {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
