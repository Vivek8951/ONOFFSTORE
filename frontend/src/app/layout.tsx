'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {!isAdmin && <Navbar />}
        <main className="flex-grow">{children}</main>
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
