'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('onoff_cart');
      if (saved) {
        try { 
          const items = JSON.parse(saved);
          setCartCount(items.reduce((acc: number, item: any) => acc + (item.qty || 1), 0));
        } catch {}
      } else { setCartCount(0); }
    };
    updateCount();
    window.addEventListener('storage', updateCount);

    // Warm up Render Backend (Cold-Start Prevention)
    fetch(`${getApiUrl()}/api/products`).catch(() => {});

    return () => window.removeEventListener('storage', updateCount);
  }, []);

  // Elite Luxury Experience
  return (
    <div className={`fixed top-0 left-0 z-[100] w-full transition-all duration-700 ${isLanding ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      
      {/* MINIMALIST TOP BRAND HUB */}
      <header className="px-6 py-6 md:px-12 md:py-8 flex items-center justify-between">
         <Link href="/" className="group flex flex-col">
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-[0.4em] uppercase italic text-[var(--indian-maroon)] group-hover:text-[var(--indian-gold)] transition-colors duration-500">
               SMART<span className="text-[var(--indian-gold)]">ON</span>
            </h1>
            <span className="text-[7px] uppercase tracking-[0.8em] text-gray-400 mt-1 opacity-60">Atelier Worldwide</span>
         </Link>

         {/* Desktop Only Navigation Links */}
         <div className="hidden md:flex items-center gap-12 bg-white/50 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full shadow-sm">
            {['Shop', 'My Orders', 'Portal'].map((label) => (
               <Link 
                  key={label}
                  href={label === 'Shop' ? '/shop' : label === 'My Orders' ? '/my-orders' : '/login'} 
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-[var(--indian-gold)] transition-all"
               >
                  {label}
               </Link>
            ))}
         </div>

         <div className="flex items-center gap-6">
            <Link href="/cart" className="relative group p-2 rounded-full hover:bg-[var(--indian-gold)]/10 transition-all">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--indian-maroon)]"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
               {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--indian-gold)] text-[var(--indian-maroon)] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                     {cartCount}
                  </span>
               )}
            </Link>
         </div>
      </header>

      {/* ELITE BOTTOM COMMAND BAR: MOBILE ONLY */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-[92%] max-w-[400px]">
        <div className="glass-midnight rounded-[28px] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-b-2 border-b-[var(--indian-gold)]/30">
          {[
            { id: 'shop', href: '/shop', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22 9 12 15 12 15 22' },
            { id: 'orders', href: '/my-orders', icon: 'M1 3h15v13H1z M16 8h4l3 3v5h-7z M5.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M18.5 18.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
            { id: 'cart', href: '/cart', icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M16 10a4 4 0 0 1-8 0' },
            { id: 'admin', href: '/admin', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' }
          ].map((item) => (
            <Link 
               key={item.id}
               href={item.href} 
               className={`flex-1 py-4 flex flex-col items-center justify-center transition-all duration-300 ${pathname === item.href ? 'text-[var(--indian-gold)] scale-110' : 'text-gray-500 hover:text-white/80'}`}
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={pathname === item.href ? 'gold-glow' : ''}>
                  <path d={item.icon.split(' ')[0]} />
                  {item.icon.split(' ')[1] && <path d={item.icon.split(' ')[1]} />}
                  {item.icon.split(' ')[2] && <circle cx={item.icon.split(' ')[2].split(' ')[1]} cy={item.icon.split(' ')[2].split(' ')[2]} r={item.icon.split(' ')[2].split(' ')[3]} />}
               </svg>
               {item.id === 'cart' && cartCount > 0 && pathname !== '/cart' && (
                  <div className="absolute top-3 right-5 w-1.5 h-1.5 bg-[var(--indian-gold)] rounded-full animate-pulse shadow-[0_0_10px_var(--indian-gold)]"></div>
               )}
            </Link>
          ))}
        </div>
      </div>
    </div>


  );
}
