'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TeamsPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: '28px 24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Squads
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Módulo de squads e equipes — em desenvolvimento (Etapa 1 complementar).
        </p>
      </div>
    </DashboardLayout>
  );
}
