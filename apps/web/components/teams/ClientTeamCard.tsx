import { useState } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  role: string;
  user: User;
}

interface ClientTeamCardProps {
  client: {
    id: string;
    tradeName: string;
    manager?: User | null;
    teamMembers: TeamMember[];
  };
  users: User[];
  onUpdate: () => void;
}

const DEFAULT_ROLES = ['Filmmaker', 'Designer', 'Editor', 'GEE'];

export function ClientTeamCard({ client, users, onUpdate }: ClientTeamCardProps) {
  const [loading, setLoading] = useState(false);

  const getMemberForRole = (roleName: string) => {
    return client.teamMembers.find((m) => m.role === roleName);
  };

  const handleAssignMember = async (roleName: string, userId: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      // If there is already a member in this role, remove them first
      const existing = getMemberForRole(roleName);
      if (existing) {
        await api.delete(`/clients/${client.id}/team/${existing.user.id}/${roleName}`);
      }
      // Add the new member
      await api.post(`/clients/${client.id}/team`, { userId, role: roleName });
      onUpdate();
    } catch (error) {
      console.error('Erro ao atribuir membro:', error);
      alert('Erro ao atribuir membro à equipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (roleName: string, userId: string) => {
    if (!confirm('Deseja remover este membro da equipe do cliente?')) return;
    setLoading(true);
    try {
      await api.delete(`/clients/${client.id}/team/${userId}/${roleName}`);
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      alert('Erro ao remover membro da equipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#09090b',
      borderRadius: '12px',
      border: '1px solid #27272a',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#fafafa' }}>
          {client.tradeName}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* Gestor Principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#18181b', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Gestor (Estratégia)</div>
            <div style={{ fontSize: '0.9rem', color: '#fafafa', fontWeight: 500 }}>
              {client.manager ? client.manager.name : <span style={{ color: '#a1a1aa' }}>Não atribuído</span>}
            </div>
          </div>
          {client.manager && (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontWeight: 600, fontSize: '0.8rem' }}>
              {client.manager.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Roles Flexíveis */}
        {DEFAULT_ROLES.map((role) => {
          const member = getMemberForRole(role);
          return (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{role}</div>
                {member ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontWeight: 600, fontSize: '0.7rem' }}>
                      {member.user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#fafafa', fontWeight: 500 }}>{member.user.name}</span>
                    <button 
                      onClick={() => handleRemoveMember(role, member.user.id)}
                      disabled={loading}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline' }}>
                      Remover
                    </button>
                  </div>
                ) : (
                  <select
                    disabled={loading}
                    onChange={(e) => handleAssignMember(role, e.target.value)}
                    value=""
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#a1a1aa',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" disabled>Selecionar {role}...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
