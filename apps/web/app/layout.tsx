import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FleetOps — Gestão de Frota',
  description: 'Sistema corporativo de gestão de frota de veículos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
