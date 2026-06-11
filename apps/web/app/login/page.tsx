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
        <div className="login-brand">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#2563eb" />
              <path
                d="M8 22L12 10L16 18L20 13L24 22"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="login-title">UP Gestão Operacional</h1>
            <p className="login-subtitle">Painel de controle da agência</p>
          </div>
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
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #e0e7ff 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-card {
          background: #09090b;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
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
          color: #fafafa;
          line-height: 1.2;
        }

        .login-subtitle {
          font-size: 0.8rem;
          color: #a1a1aa;
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
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
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
          border-top-color: #09090b;
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
          color: #a1a1aa;
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
          background: #bfdbfe;
          top: -100px;
          right: -100px;
        }

        .decoration-circle-2 {
          width: 300px;
          height: 300px;
          background: #a5f3fc;
          bottom: -80px;
          left: -80px;
        }

        .decoration-circle-3 {
          width: 200px;
          height: 200px;
          background: #99f6e4;
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
