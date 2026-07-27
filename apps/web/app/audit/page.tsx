'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  LogIn,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

type Tab = 'logins' | 'activities' | 'sessions';

interface AuditUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Summary {
  onlineUsers: number;
  successfulLogins24h: number;
  failedLogins24h: number;
  activities24h: number;
}

interface LoginAudit {
  id: string;
  email: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  failureReason: string | null;
  createdAt: string;
  user: AuditUser | null;
}

interface ActivityAudit {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  durationMs: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
  user: AuditUser | null;
}

interface UserSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  loggedInAt: string;
  lastSeenAt: string;
  loggedOutAt: string | null;
  expiresAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
  isOnline: boolean;
  user: AuditUser;
}

interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function formatDate(value?: string | null): string {
  if (!value) return '—';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function parseUserAgent(userAgent?: string | null): {
  browser: string;
  system: string;
  device: string;
} {
  if (!userAgent) {
    return {
      browser: 'Não identificado',
      system: 'Não identificado',
      device: 'Não identificado',
    };
  }

  let browser = 'Outro navegador';

  if (/Edg\//i.test(userAgent)) browser = 'Microsoft Edge';
  else if (/OPR\//i.test(userAgent)) browser = 'Opera';
  else if (/Chrome\//i.test(userAgent)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(userAgent)) browser = 'Firefox';
  else if (/Safari\//i.test(userAgent)) browser = 'Safari';

  let system = 'Outro sistema';

  if (/Windows NT/i.test(userAgent)) system = 'Windows';
  else if (/Android/i.test(userAgent)) system = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) system = 'iOS';
  else if (/Mac OS X/i.test(userAgent)) system = 'macOS';
  else if (/Linux/i.test(userAgent)) system = 'Linux';

  let device = 'Computador';

  if (/iPad|Tablet/i.test(userAgent)) device = 'Tablet';
  else if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) device = 'Celular';

  return { browser, system, device };
}

function labelAction(action: string): string {
  const labels: Record<string, string> = {
    LOGIN_SUCCESS: 'Login realizado',
    LOGIN_FAILED: 'Tentativa de login recusada',
    LOGOUT: 'Logout',
    SESSION_REVOKED: 'Sessão encerrada remotamente',
    CLIENTS_CREATED: 'Cliente criado',
    CLIENTS_UPDATED: 'Cliente atualizado',
    CLIENTS_DELETED: 'Cliente removido',
    CONTRACTS_CREATED: 'Contrato criado',
    CONTRACTS_UPDATED: 'Contrato atualizado',
    CONTRACTS_DELETED: 'Contrato removido',
    FOLLOWUPS_CREATED: 'Follow-up criado',
    ACTION_PLANS_CREATED: 'Plano de ação criado',
    ACTION_PLANS_UPDATED: 'Plano de ação atualizado',
    CREDENTIALS_CREATED: 'Credencial criada',
    CREDENTIALS_UPDATED: 'Credencial atualizada',
    CREDENTIALS_DELETED: 'Credencial removida',
  };

  return labels[action] ?? action.replaceAll('_', ' ');
}

function Card({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 18,
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: 'var(--background)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {label}
          </p>

          <p
            style={{
              color: 'var(--foreground)',
              fontSize: '1.65rem',
              fontWeight: 750,
              marginTop: 5,
            }}
          >
            {value}
          </p>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'color-mix(in srgb, var(--primary) 14%, transparent)',
            color: 'var(--primary)',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>('logins');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logins, setLogins] = useState<LoginAudit[]>([]);
  const [activities, setActivities] = useState<ActivityAudit[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);

  const [email, setEmail] = useState('');
  const [ip, setIp] = useState('');
  const [success, setSuccess] = useState('');
  const [action, setAction] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role !== 'super_admin') {
      router.replace('/dashboard');
    }
  }, [authLoading, router, user]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (ip.trim()) params.set('ip', ip.trim());

    if (tab === 'logins') {
      if (email.trim()) params.set('email', email.trim());
      if (success) params.set('success', success);
    }

    if (tab === 'activities' && action.trim()) {
      params.set('action', action.trim());
    }

    return params.toString();
  }, [action, email, ip, page, pageSize, success, tab]);

  const loadSummary = useCallback(async () => {
    const data = await api.get<Summary>('/audit/summary');
    setSummary(data);
  }, []);

  const loadTable = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (tab === 'logins') {
        const data = await api.get<PagedResponse<LoginAudit>>(
          `/audit/logins?${queryString}`,
        );
        setLogins(data.items);
        setTotal(data.total);
      }

      if (tab === 'activities') {
        const data = await api.get<PagedResponse<ActivityAudit>>(
          `/audit/activities?${queryString}`,
        );
        setActivities(data.items);
        setTotal(data.total);
      }

      if (tab === 'sessions') {
        const data = await api.get<PagedResponse<UserSession>>(
          `/audit/sessions?${queryString}`,
        );
        setSessions(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados de auditoria.',
      );
    } finally {
      setLoading(false);
    }
  }, [queryString, tab]);

  useEffect(() => {
    if (user?.role !== 'super_admin') return;

    Promise.all([loadSummary(), loadTable()]).catch((err) => {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a auditoria.',
      );
    });
  }, [loadSummary, loadTable, user?.role]);

  function changeTab(value: Tab) {
    setTab(value);
    setPage(1);
    setError(null);
  }

  function clearFilters() {
    setEmail('');
    setIp('');
    setSuccess('');
    setAction('');
    setPage(1);
  }

  async function revokeSession(session: UserSession) {
    const confirmed = window.confirm(
      `Encerrar a sessão de ${session.user.name}?`,
    );

    if (!confirmed) return;

    const reason =
      window.prompt(
        'Motivo do encerramento:',
        'Encerrada pelo Super Admin',
      ) || 'Encerrada pelo Super Admin';

    try {
      setRevokingId(session.id);

      await api.patch(`/audit/sessions/${session.id}/revoke`, {
        reason,
      });

      await Promise.all([loadTable(), loadSummary()]);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : 'Não foi possível encerrar a sessão.',
      );
    } finally {
      setRevokingId(null);
    }
  }

  if (authLoading || !user || user.role !== 'super_admin') {
    return null;
  }

  const pageCount = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <DashboardLayout>
      <div
        style={{
          padding: '24px 24px 48px',
          maxWidth: 1320,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <ShieldCheck size={25} color="var(--primary)" />

              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 750,
                  color: 'var(--foreground)',
                }}
              >
                Auditoria e segurança
              </h1>
            </div>

            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: '0.9rem',
                marginTop: 5,
              }}
            >
              Acessos, atividades e sessões dos usuários do Operacional UP.
            </p>
          </div>

          <button
            onClick={() => {
              void Promise.all([loadSummary(), loadTable()]);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 13px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Card
            label="Usuários online"
            value={summary?.onlineUsers ?? 0}
            icon={<UserRoundCheck size={21} />}
          />

          <Card
            label="Logins nas últimas 24h"
            value={summary?.successfulLogins24h ?? 0}
            icon={<LogIn size={21} />}
          />

          <Card
            label="Tentativas recusadas"
            value={summary?.failedLogins24h ?? 0}
            icon={<ShieldAlert size={21} />}
          />

          <Card
            label="Atividades nas últimas 24h"
            value={summary?.activities24h ?? 0}
            icon={<Activity size={21} />}
          />
        </div>

        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            marginBottom: 18,
            gap: 3,
            overflowX: 'auto',
          }}
        >
          {[
            ['logins', 'Acessos'],
            ['activities', 'Atividades'],
            ['sessions', 'Sessões'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => changeTab(value as Tab)}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderBottom:
                  tab === value
                    ? '2px solid var(--primary)'
                    : '2px solid transparent',
                marginBottom: -1,
                background: 'transparent',
                color:
                  tab === value
                    ? 'var(--primary)'
                    : 'var(--muted-foreground)',
                fontWeight: tab === value ? 650 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {tab === 'logins' && (
            <>
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setPage(1);
                }}
                placeholder="Filtrar por e-mail"
                style={inputStyle}
              />

              <select
                value={success}
                onChange={(event) => {
                  setSuccess(event.target.value);
                  setPage(1);
                }}
                style={inputStyle}
              >
                <option value="">Todos os resultados</option>
                <option value="true">Somente logins corretos</option>
                <option value="false">Somente tentativas recusadas</option>
              </select>
            </>
          )}

          {tab === 'activities' && (
            <input
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
              placeholder="Filtrar por ação"
              style={inputStyle}
            />
          )}

          {tab !== 'sessions' && (
            <input
              value={ip}
              onChange={(event) => {
                setIp(event.target.value);
                setPage(1);
              }}
              placeholder="Filtrar por IP"
              style={inputStyle}
            />
          )}

          {(email || ip || success || action) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
                fontSize: '0.82rem',
              }}
            >
              Limpar filtros
            </button>
          )}

          <span
            style={{
              marginLeft: 'auto',
              color: 'var(--muted-foreground)',
              fontSize: '0.8rem',
            }}
          >
            {total} registro{total === 1 ? '' : 's'}
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              borderRadius: 9,
              marginBottom: 16,
              color: '#ef4444',
              background:
                'color-mix(in srgb, #ef4444 12%, transparent)',
              border:
                '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: 50,
              color: 'var(--muted-foreground)',
            }}
          >
            Carregando auditoria…
          </div>
        ) : (
          <>
            {tab === 'logins' && <LoginTable items={logins} />}

            {tab === 'activities' && (
              <ActivityTable items={activities} />
            )}

            {tab === 'sessions' && (
              <SessionTable
                items={sessions}
                revokingId={revokingId}
                onRevoke={revokeSession}
              />
            )}
          </>
        )}

        {!loading && total > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginTop: 18,
            }}
          >
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
              style={paginationButtonStyle(page <= 1)}
            >
              Anterior
            </button>

            <span
              style={{
                color: 'var(--muted-foreground)',
                fontSize: '0.82rem',
              }}
            >
              Página {page} de {pageCount}
            </span>

            <button
              disabled={page >= pageCount}
              onClick={() =>
                setPage((value) => Math.min(value + 1, pageCount))
              }
              style={paginationButtonStyle(page >= pageCount)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function LoginTable({ items }: { items: LoginAudit[] }) {
  if (!items.length) return <EmptyState />;

  return (
    <TableShell>
      <table style={tableStyle}>
        <thead>
          <tr>
            <Th>Data e hora</Th>
            <Th>Usuário</Th>
            <Th>Resultado</Th>
            <Th>IP</Th>
            <Th>Dispositivo</Th>
            <Th>Motivo</Th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const agent = parseUserAgent(item.userAgent);

            return (
              <tr key={item.id}>
                <Td>{formatDate(item.createdAt)}</Td>

                <Td>
                  <strong>{item.user?.name ?? 'Não identificado'}</strong>
                  <small style={smallStyle}>{item.email}</small>
                </Td>

                <Td>
                  <StatusBadge success={item.success} />
                </Td>

                <Td>{item.ipAddress ?? '—'}</Td>

                <Td>
                  {agent.device} · {agent.browser}
                  <small style={smallStyle}>{agent.system}</small>
                </Td>

                <Td>{item.failureReason ?? '—'}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableShell>
  );
}

function ActivityTable({ items }: { items: ActivityAudit[] }) {
  if (!items.length) return <EmptyState />;

  return (
    <TableShell>
      <table style={tableStyle}>
        <thead>
          <tr>
            <Th>Data e hora</Th>
            <Th>Usuário</Th>
            <Th>Ação</Th>
            <Th>Registro</Th>
            <Th>Rota</Th>
            <Th>IP</Th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <Td>{formatDate(item.createdAt)}</Td>

              <Td>
                <strong>{item.user?.name ?? 'Sistema'}</strong>
                <small style={smallStyle}>{item.user?.email ?? '—'}</small>
              </Td>

              <Td>
                <strong>{labelAction(item.action)}</strong>
                <small style={smallStyle}>
                  {item.method ?? '—'} · {item.statusCode ?? '—'} ·{' '}
                  {item.durationMs ?? 0} ms
                </small>
              </Td>

              <Td>
                {item.entityType ?? '—'}
                <small style={smallStyle}>{item.entityId ?? '—'}</small>
              </Td>

              <Td>{item.path ?? item.description ?? '—'}</Td>
              <Td>{item.ipAddress ?? '—'}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function SessionTable({
  items,
  revokingId,
  onRevoke,
}: {
  items: UserSession[];
  revokingId: string | null;
  onRevoke: (session: UserSession) => Promise<void>;
}) {
  if (!items.length) return <EmptyState />;

  return (
    <TableShell>
      <table style={tableStyle}>
        <thead>
          <tr>
            <Th>Usuário</Th>
            <Th>Status</Th>
            <Th>Entrada</Th>
            <Th>Última atividade</Th>
            <Th>Dispositivo</Th>
            <Th>IP</Th>
            <Th>Ação</Th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const agent = parseUserAgent(item.userAgent);
            const active =
              !item.loggedOutAt && !item.revokedAt && item.isOnline;

            return (
              <tr key={item.id}>
                <Td>
                  <strong>{item.user.name}</strong>
                  <small style={smallStyle}>{item.user.email}</small>
                </Td>

                <Td>
                  {item.revokedAt ? (
                    <span style={dangerBadgeStyle}>Revogada</span>
                  ) : item.loggedOutAt ? (
                    <span style={neutralBadgeStyle}>Encerrada</span>
                  ) : active ? (
                    <span style={successBadgeStyle}>Online</span>
                  ) : (
                    <span style={warningBadgeStyle}>Inativa</span>
                  )}
                </Td>

                <Td>{formatDate(item.loggedInAt)}</Td>
                <Td>{formatDate(item.lastSeenAt)}</Td>

                <Td>
                  {agent.device} · {agent.browser}
                  <small style={smallStyle}>{agent.system}</small>
                </Td>

                <Td>{item.ipAddress ?? '—'}</Td>

                <Td>
                  {!item.loggedOutAt && !item.revokedAt ? (
                    <button
                      disabled={revokingId === item.id}
                      onClick={() => void onRevoke(item)}
                      style={{
                        padding: '7px 10px',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        borderRadius: 7,
                        background: 'transparent',
                        fontWeight: 600,
                        cursor:
                          revokingId === item.id
                            ? 'not-allowed'
                            : 'pointer',
                        opacity: revokingId === item.id ? 0.6 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {revokingId === item.id
                        ? 'Encerrando…'
                        : 'Encerrar'}
                    </button>
                  ) : (
                    '—'
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableShell>
  );
}

function StatusBadge({ success }: { success: boolean }) {
  return success ? (
    <span style={successBadgeStyle}>
      <CheckCircle2 size={13} />
      Sucesso
    </span>
  ) : (
    <span style={dangerBadgeStyle}>
      <XCircle size={13} />
      Recusado
    </span>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        border: '1px solid var(--border)',
        borderRadius: 11,
        background: 'var(--background)',
      }}
    >
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: 48,
        border: '1px dashed var(--border)',
        borderRadius: 10,
        textAlign: 'center',
        color: 'var(--muted-foreground)',
      }}
    >
      Nenhum registro encontrado.
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={thStyle}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={tdStyle}>{children}</td>;
}

const inputStyle: React.CSSProperties = {
  minWidth: 190,
  padding: '9px 11px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--foreground)',
  fontSize: '0.82rem',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 920,
};

const thStyle: React.CSSProperties = {
  padding: '11px 13px',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  color: 'var(--muted-foreground)',
  background:
    'color-mix(in srgb, var(--foreground) 3%, var(--background))',
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 13px',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  color: 'var(--foreground)',
  fontSize: '0.8rem',
  verticalAlign: 'top',
};

const smallStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--muted-foreground)',
  fontSize: '0.72rem',
  marginTop: 3,
};

const successBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'color-mix(in srgb, #22c55e 14%, transparent)',
  color: '#22c55e',
  fontWeight: 700,
  fontSize: '0.72rem',
};

const dangerBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'color-mix(in srgb, #ef4444 14%, transparent)',
  color: '#ef4444',
  fontWeight: 700,
  fontSize: '0.72rem',
};

const warningBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  padding: '4px 8px',
  borderRadius: 999,
  background: 'color-mix(in srgb, #f59e0b 14%, transparent)',
  color: '#f59e0b',
  fontWeight: 700,
  fontSize: '0.72rem',
};

const neutralBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  padding: '4px 8px',
  borderRadius: 999,
  background:
    'color-mix(in srgb, var(--muted-foreground) 13%, transparent)',
  color: 'var(--muted-foreground)',
  fontWeight: 700,
  fontSize: '0.72rem',
};

function paginationButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--background)',
    color: 'var(--foreground)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontWeight: 600,
    fontSize: '0.8rem',
  };
}
