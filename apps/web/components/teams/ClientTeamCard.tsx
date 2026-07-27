import { useState } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface TeamMember {
  id: string;
  role: string;
  user: User;
}

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  role?: string;
}

interface ClientServiceProvider {
  id: string;
  role: string;
  serviceProvider: ServiceProvider;
}

interface ClientTeamCardProps {
  client: {
    id: string;
    tradeName: string;
    manager?: User | null;
    teamMembers: TeamMember[];
    serviceProviders?: ClientServiceProvider[];
  };
  users: User[];
  serviceProviders: ServiceProvider[];
  onUpdate: () => void;
}

const DEFAULT_ROLES = ['Filmmaker', 'Designer', 'Editor'];

export function ClientTeamCard({ client, users, serviceProviders, onUpdate }: ClientTeamCardProps) {
  const [loading, setLoading] = useState(false);

  const getMemberForRole = (roleName: string) => {
    return client.teamMembers.find((m) => m.role === roleName);
  };

  const getProviderForRole = (roleName: string) => {
    return client.serviceProviders?.find((m) => m.role === roleName);
  };

  const isServiceProviderRole = (roleName: string) => {
    return ['Filmmaker', 'Designer', 'Editor'].includes(roleName);
  };

  const handleAssignMember = async (roleName: string, id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      if (isServiceProviderRole(roleName)) {
        const existing = getProviderForRole(roleName);
        if (existing) {
          await api.delete(`/clients/${client.id}/service-providers/${existing.serviceProvider.id}/${roleName}`);
        }
        await api.post(`/clients/${client.id}/service-providers`, { serviceProviderId: id, role: roleName });
      } else {
        const existing = getMemberForRole(roleName);
        if (existing) {
          await api.delete(`/clients/${client.id}/team/${existing.user.id}/${roleName}`);
        }
        await api.post(`/clients/${client.id}/team`, { userId: id, role: roleName });
      }
      onUpdate();
    } catch (error) {
      console.error('Erro ao atribuir membro/prestador:', error);
      alert('Erro ao atribuir membro à equipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (roleName: string, id: string) => {
    if (!confirm('Deseja remover da equipe do cliente?')) return;
    setLoading(true);
    try {
      if (isServiceProviderRole(roleName)) {
        await api.delete(`/clients/${client.id}/service-providers/${id}/${roleName}`);
      } else {
        await api.delete(`/clients/${client.id}/team/${id}/${roleName}`);
      }
      onUpdate();
    } catch (error) {
      console.error('Erro ao remover membro/prestador:', error);
      alert('Erro ao remover da equipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>
          {client.tradeName}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* Gestor Principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor={`select-${client.id}-Gestor`} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Gestor (Estratégia e Execução)</label>
            {client.manager ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.7rem' }}>
                  {client.manager.name.substring(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 500 }}>{client.manager.name}</span>
                <button 
                  onClick={async () => {
                    if (!confirm('Deseja remover o gestor deste cliente?')) return;
                    setLoading(true);
                    try {
                      await api.patch(`/clients/${client.id}`, { managerId: null });
                      onUpdate();
                    } catch (err) {
                      alert('Erro ao remover gestor.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline' }}>
                  Remover
                </button>
              </div>
            ) : (
              <select
                id={`select-${client.id}-Gestor`}
                disabled={loading}
                onChange={async (e) => {
                  if (!e.target.value) return;
                  setLoading(true);
                  try {
                    await api.patch(`/clients/${client.id}`, { managerId: e.target.value });
                    onUpdate();
                  } catch (err) {
                    alert('Erro ao atribuir gestor.');
                  } finally {
                    setLoading(false);
                  }
                }}
                value=""
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  color: 'var(--foreground)',
                  outline: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--background)'
                }}
              >
                <option value="" disabled>Selecionar Gestor...</option>
                {users.filter(u => u.role === 'gestor_cliente' || u.role === 'admin' || u.role === 'super_admin').map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Roles Flexíveis */}
        {DEFAULT_ROLES.map((role) => {
          const isProvider = isServiceProviderRole(role);
          const member = isProvider ? null : getMemberForRole(role);
          const provider = isProvider ? getProviderForRole(role) : null;
          
          const hasAssignment = !!(member || provider);
          const entityName = provider ? provider.serviceProvider.name : (member ? member.user.name : '');
          const entityId = provider ? provider.serviceProvider.id : (member ? member.user.id : '');
          let optionsList: any[] = [];
          if (role === 'Filmmaker') {
            optionsList = serviceProviders.filter(sp => sp.role === 'Filmmaker');
          } else if (role === 'Designer') {
            optionsList = serviceProviders.filter(sp => sp.role === 'Designer');
          } else if (role === 'Editor') {
            // Filmmakers also edit
            optionsList = serviceProviders.filter(sp => sp.role === 'Editor' || sp.role === 'Filmmaker');
          } else if (role === 'GEE') {
            optionsList = users.filter(u => u.role === 'gestor_cliente');
          } else {
            optionsList = isProvider ? serviceProviders : users;
          }

          return (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor={`select-${client.id}-${role}`} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{role}</label>
                {hasAssignment ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.7rem' }}>
                      {entityName.substring(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 500 }}>{entityName}</span>
                    <button 
                      onClick={() => handleRemoveMember(role, entityId)}
                      disabled={loading}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline' }}>
                      Remover
                    </button>
                  </div>
                ) : (
                  <select
                    id={`select-${client.id}-${role}`}
                    disabled={loading}
                    onChange={(e) => handleAssignMember(role, e.target.value)}
                    value=""
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      color: 'var(--foreground)',
                      outline: 'none',
                      cursor: 'pointer',
                      backgroundColor: 'var(--background)'
                    }}
                  >
                    <option value="" disabled>Selecionar {role}...</option>
                    {optionsList.map((u) => (
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
