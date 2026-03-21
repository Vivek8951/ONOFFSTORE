'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLanding = pathname === '/';
  const isLogin = pathname === '/login';
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('onoff_user_token');
    setIsAuthenticated(!!token);

    // Protected Routes Check
    if (!token && !isLanding && !isLogin && !isAdmin) {
      router.push('/');
    }
  }, [pathname, isLanding, isLogin, isAdmin, router]);

  // Show a blank loader while checking auth to prevent layout flickers
  if (isAuthenticated === null && !isLanding && !isLogin && !isAdmin) {
    return <html lang="en"><body className="bg-black h-screen w-full flex items-center justify-center font-black uppercase tracking-[2em] text-white">Authenticating...</body></html>;
  }

  return (
    <html lang="en">
      <body className={`flex flex-col min-h-screen ${isLanding ? 'bg-black' : 'bg-white'}`}>
        {(!isAdmin && !isLanding) && <Navbar />}
        <main className="flex-grow">{children}</main>
        {(!isAdmin && !isLanding) && <Footer />}
      </body>
    </html>
  );
}
