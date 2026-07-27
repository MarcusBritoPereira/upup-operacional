'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [ddd, setDdd] = useState('');
  const [phonePart, setPhonePart] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [globalError, setGlobalError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Formatar data atual
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Effect to populate initial user data
  useEffect(() => {
    if (user) {
      const names = (user.name || '').split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(user.email || '');
      
      const fullPhone = user.phone || '';
      const phoneDigits = fullPhone.replace(/\D/g, '');
      if (phoneDigits.length >= 10) {
        setDdd(phoneDigits.substring(0, 2));
        let number = phoneDigits.substring(2);
        if (number.length === 9) {
          number = `${number.substring(0, 5)}-${number.substring(5)}`;
        } else if (number.length === 8) {
          number = `${number.substring(0, 4)}-${number.substring(4)}`;
        }
        setPhonePart(number);
      } else {
        setPhonePart(fullPhone);
      }
      
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    setGlobalSuccess('');
    setIsLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();
    const fullPhone = ddd ? `(${ddd}) ${phonePart}` : phonePart;

    try {
      // 1. Update Profile
      const profileResponse = await api.patch('/users/me/profile', {
        name: fullName,
        email,
        phone: fullPhone
      });
      updateUser(profileResponse as any);

      // 2. Update Password if requested
      if (newPassword || currentPassword) {
        if (!currentPassword || !newPassword) {
          throw new Error('Para alterar a senha, preencha a senha atual e a nova senha.');
        }
        if (newPassword.length < 6) {
          throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
        }
        await api.patch('/users/me/password', {
          currentPassword,
          newPassword
        });
        setCurrentPassword('');
        setNewPassword('');
      }

      setGlobalSuccess('Informações atualizadas com sucesso!');
      setTimeout(() => setGlobalSuccess(''), 4000);
    } catch (err: any) {
      setGlobalError(err.message || 'Erro ao salvar as informações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
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
      setGlobalSuccess('Foto de perfil atualizada!');
      setTimeout(() => setGlobalSuccess(''), 3000);
    } catch (err: any) {
      setGlobalError(err.message || 'Erro ao enviar a imagem.');
    }
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12 pt-4 px-4 sm:px-6">
        
        {/* Top Badge */}
        <div suppressHydrationWarning className="inline-flex items-center px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 text-xs font-bold tracking-wide">
          Atualizado em {today}
        </div>

        {/* Main Card */}
        <div className="bg-[var(--card)] rounded-[2rem] shadow-sm border border-[var(--border)] p-8 sm:p-10">
          
          <form onSubmit={handleGlobalSubmit} className="space-y-10">
            {globalError && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium">{globalError}</div>}
            {globalSuccess && <div className="p-4 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium">{globalSuccess}</div>}

            {/* Profile Section */}
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Left Col */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Informações de contato</h2>
                  <p className="text-sm text-[var(--muted-foreground)] font-medium leading-relaxed">
                    Gerencie e atualize suas informações pessoais com facilidade.
                  </p>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-start mt-2">
                  <div 
                    className="relative w-20 h-20 rounded-full border border-[var(--border)] shadow-sm overflow-hidden bg-[var(--secondary)] flex items-center justify-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-yellow-600 font-bold text-xl tracking-widest">{getInitials(firstName)}</span>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
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
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-yellow-600 text-xs font-bold mt-3 hover:underline">
                    Alterar foto
                  </button>
                </div>
              </div>

              {/* Right Col */}
              <div className="lg:w-2/3 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[var(--muted-foreground)]">Nome</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[var(--muted-foreground)]">Sobrenome</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--muted-foreground)]">E-mail</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full px-4 py-3 bg-[var(--secondary)] border border-transparent rounded-xl text-sm text-[var(--muted-foreground)] font-medium focus:bg-[var(--input)] focus:border-[var(--border)] focus:ring-2 focus:ring-yellow-500/20 outline-none transition" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--muted-foreground)]">Telefone</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={ddd} 
                      onChange={e => setDdd(e.target.value)} 
                      placeholder="DDD"
                      className="w-24 px-4 py-3 text-center bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition" 
                    />
                    <input 
                      type="text" 
                      value={phonePart} 
                      onChange={e => setPhonePart(e.target.value)} 
                      placeholder="Exemplo: 99999-9999"
                      className="flex-1 px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[var(--border)]" />

            {/* Password Section */}
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Left Col */}
              <div className="lg:w-1/3">
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Senha</h2>
                <p className="text-sm text-[var(--muted-foreground)] font-medium leading-relaxed">
                  Altere sua senha para manter sua conta segura. Preencha apenas se desejar alterá-la.
                </p>
              </div>

              {/* Right Col */}
              <div className="lg:w-2/3 space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--muted-foreground)]">Senha Atual</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--muted-foreground)]">Nova Senha</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition" 
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-6">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="px-10 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
            
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
}
