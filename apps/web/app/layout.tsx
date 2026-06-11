import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'UP Gestão Operacional',
  description:
    'Painel de controle interno para acompanhar clientes, entregas, riscos e planos de ação da operação da Up&Up.',
  keywords: ['gestão', 'operacional', 'agência', 'clientes', 'follow-up'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
