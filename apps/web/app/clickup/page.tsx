'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface ClickUpMember {
  clickupUserId: number;
  username: string | null;
  email: string;
  role: string;
  roleCode: number | null;
  profilePicture: string | null;
  lastActive: string | null;
}

interface ClickUpTaskAssignee {
  id: number;
  username: string | null;
  email: string;
}

interface ClickUpTask {
  id: string;
  customId: string | null;
  name: string;
  status: string | null;
  statusType: string | null;
  priority: string | null;
  assignees: ClickUpTaskAssignee[];
  list: string | null;
  folder: string | null;
  space: string | null;
  dueDate: string | null;
  url: string | null;
  tags: string[];
}

interface TasksResponse {
  teamId: string;
  total: number;
  truncated: boolean;
  tasks: ClickUpTask[];
}

type Tab = 'tasks' | 'members';

function formatMsDate(value: string | null): string {
  if (!value) return '—';
  const ms = Number(value);
  if (Number.isNaN(ms)) return '—';
  return new Date(ms).toLocaleDateString('pt-BR');
}

function statusColor(type: string | null): string {
  switch (type) {
    case 'closed':
    case 'done':
      return '#22c55e';
    case 'custom':
      return '#3b82f6';
    default:
      return '#f59e0b';
  }
}

export default function ClickUpPage() {
  const [tab, setTab] = useState<Tab>('tasks');
  const [members, setMembers] = useState<ClickUpMember[]>([]);
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [taskMeta, setTaskMeta] = useState<{ total: number; truncated: boolean }>({
    total: 0,
    truncated: false,
  });
  const [includeClosed, setIncludeClosed] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'members') {
      fetchMembers();
    } else {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, includeClosed]);

  async function fetchMembers() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<ClickUpMember[]>('/clickup/members');
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<TasksResponse>(
        `/clickup/tasks?includeClosed=${includeClosed}`,
      );
      setTasks(data.tasks);
      setTaskMeta({ total: data.total, truncated: data.truncated });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      task.name.toLowerCase().includes(q) ||
      (task.list ?? '').toLowerCase().includes(q) ||
      task.assignees.some((a) =>
        (a.username ?? a.email).toLowerCase().includes(q),
      )
    );
  });

  return (
    <DashboardLayout>
      <div style={{ padding: '24px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)' }}>
            ClickUp
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: 4 }}>
            Usuários e tarefas sincronizados direto do workspace.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
          {(['tasks', 'members'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: tab === t ? 600 : 500,
                color: tab === t ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t === 'tasks' ? 'Tarefas' : 'Usuários'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: 16, borderRadius: 8, background: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#ef4444', marginBottom: 16, fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Carregando…
          </div>
        ) : tab === 'members' ? (
          <MembersTable members={members} />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por tarefa, lista ou responsável…"
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '0.875rem',
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeClosed}
                  onChange={(e) => setIncludeClosed(e.target.checked)}
                />
                Incluir concluídas
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                {filteredTasks.length} de {taskMeta.total}
              </span>
            </div>
            {taskMeta.truncated && (
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginBottom: 12 }}>
                Mostrando o limite máximo de tarefas por consulta. Use filtros para refinar.
              </div>
            )}
            <TasksTable tasks={filteredTasks} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function MembersTable({ members }: { members: ClickUpMember[] }) {
  if (members.length === 0) {
    return <EmptyState label="Nenhum usuário encontrado no workspace." />;
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {members.map((m) => (
        <div
          key={m.clickupUserId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--background)',
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: 'var(--secondary)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden',
          }}>
            {m.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (m.username ?? m.email).charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>
              {m.username ?? m.email}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>{m.email}</p>
          </div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999,
            background: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)',
          }}>
            {m.role}
          </span>
        </div>
      ))}
    </div>
  );
}

function TasksTable({ tasks }: { tasks: ClickUpTask[] }) {
  if (tasks.length === 0) {
    return <EmptyState label="Nenhuma tarefa encontrada." />;
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {tasks.map((task) => (
        <a
          key={task.id}
          href={task.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem', flex: 1 }}>
              {task.name}
            </p>
            {task.status && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                background: `color-mix(in srgb, ${statusColor(task.statusType)} 15%, transparent)`,
                color: statusColor(task.statusType),
              }}>
                {task.status}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
            {task.list && <span>📋 {task.list}</span>}
            {task.assignees.length > 0 && (
              <span>👤 {task.assignees.map((a) => a.username ?? a.email).join(', ')}</span>
            )}
            {task.dueDate && <span>📅 {formatMsDate(task.dueDate)}</span>}
            {task.priority && <span>⚑ {task.priority}</span>}
          </div>
        </a>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      padding: 48, textAlign: 'center', color: 'var(--muted-foreground)',
      border: '1px dashed var(--border)', borderRadius: 12, fontSize: '0.9rem',
    }}>
      {label}
    </div>
  );
}
