'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: '28px 24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Configurações
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Configurações do sistema — em desenvolvimento.
        </p>
      </div>
    </DashboardLayout>
  );
}
