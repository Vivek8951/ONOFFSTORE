'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './globals.css';

// Public pages that don't require auth
const PUBLIC_PATHS = ['/', '/login'];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isPublic = PUBLIC_PATHS.some(p => pathname === p) || pathname?.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('onoff_user_token');

    // If already logged in and visiting /login, skip to shop
    if (token && pathname === '/login') {
      router.replace('/shop');
      return;
    }

    // If NOT logged in and visiting a protected page, redirect to login
    if (!token && !isPublic) {
      router.replace('/login');
      return;
    }

    setChecked(true);
  }, [pathname]);

  // Show a brief loader only on protected pages before auth is confirmed
  if (!checked && !isPublic) {
    return (
      <html lang="en">
        <body className="bg-white h-screen w-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
