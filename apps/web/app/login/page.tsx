'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo/Brand */}
        <div className="login-brand" style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <img src="/logo-light.svg" alt="UP Gestão Operacional" className="dark:hidden h-20 w-auto" />
          <img src="/logo-dark.svg" alt="UP Gestão Operacional" className="hidden dark:block h-20 w-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="btn-primary login-btn"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Entrando...
              </>
            ) : (
              'Entrar no sistema'
            )}
          </button>
        </form>

        <p className="login-footer">
          Acesso restrito a colaboradores da Up&Up
        </p>
      </div>

      {/* Background decoration */}
      <div className="login-bg-decoration" aria-hidden="true">
        <div className="decoration-circle decoration-circle-1" />
        <div className="decoration-circle decoration-circle-2" />
        <div className="decoration-circle decoration-circle-3" />
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 10%, transparent) 0%, var(--background) 50%);
          background-color: var(--background);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-card {
          background: var(--card);
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
          position: relative;
          z-index: 10;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
        }

        .login-logo {
          flex-shrink: 0;
        }

        .login-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.2;
        }

        .login-subtitle {
          font-size: 0.8rem;
          color: var(--muted-foreground);
          margin-top: 2px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: color-mix(in srgb, var(--red) 15%, transparent);
          color: var(--red);
          border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .login-btn {
          width: 100%;
          justify-content: center;
          padding: 12px 20px;
          font-size: 0.95rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--card);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          margin-top: 28px;
        }

        .login-bg-decoration {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.4;
          filter: blur(60px);
        }

        .decoration-circle-1 {
          width: 400px;
          height: 400px;
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          top: -100px;
          right: -100px;
        }

        .decoration-circle-2 {
          width: 300px;
          height: 300px;
          background: color-mix(in srgb, var(--primary) 5%, transparent);
          bottom: -80px;
          left: -80px;
        }

        .decoration-circle-3 {
          width: 200px;
          height: 200px;
          background: color-mix(in srgb, var(--primary) 15%, transparent);
          bottom: 100px;
          right: 50px;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 24px;
            border-radius: 16px;
          }

          .login-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
