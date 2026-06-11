'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ClientTeamCard } from '@/components/teams/ClientTeamCard';
import api from '@/lib/api';

export default function TeamsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [clientsRes, usersRes, providersRes] = await Promise.all<any>([
        api.get('/clients?status=active'),
        api.get('/users'),
        api.get('/service-providers'),
      ]);
      setClients(clientsRes);
      setUsers(usersRes);
      setServiceProviders(providersRes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = clients.filter(c => 
    c.tradeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px' }}>
              Equipes de Clientes
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
              Aloque e gerencie os responsáveis por cada área em cada cliente da agência.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '0.9rem',
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
              outline: 'none'
            }}
          />
        </div>

        {loading ? (
          <p>Carregando clientes e equipes...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredClients.map((client) => (
              <ClientTeamCard 
                key={client.id} 
                client={client} 
                users={users}
                serviceProviders={serviceProviders}
                onUpdate={fetchData} 
              />
            ))}
            
            {filteredClients.length === 0 && (
              <p style={{ color: 'var(--muted-foreground)' }}>Nenhum cliente encontrado.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
