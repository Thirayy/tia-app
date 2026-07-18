import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TIA Portal',
  description: 'Portal TIA - Manajemen Tahfizh dan Assessment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--color-gnome-darker)] text-[#e6eef8] font-sans">
        {children}
      </body>
    </html>
  );
}
