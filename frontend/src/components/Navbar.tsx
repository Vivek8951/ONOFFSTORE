'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const [cartCount, setCartCount] = useState(0);

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

  // Floating Luxury Island Design
  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-6xl transition-all duration-700 ${isLanding ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      <nav className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[30px] px-8 py-4 flex items-center justify-between">
        
        {/* Left: Collections */}
        <div className="flex items-center gap-10">
          <Link href="/shop" className="group relative flex flex-col items-center">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-[0.3em] text-[var(--indian-maroon)]">Shop</span>
            <div className="h-[1px] w-0 bg-[var(--indian-gold)] group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/my-orders" className="group relative flex flex-col items-center">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-[0.3em] text-[var(--indian-maroon)]/50 group-hover:text-[var(--indian-maroon)] transition-colors">My Orders</span>
            <div className="h-[1px] w-0 bg-[var(--indian-gold)] group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/track" className="group relative flex flex-col items-center hidden md:flex">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-[0.3em] text-[var(--indian-maroon)]/50 group-hover:text-[var(--indian-maroon)] transition-colors">Track</span>
            <div className="h-[1px] w-0 bg-[var(--indian-gold)] group-hover:w-full transition-all duration-300"></div>
          </Link>
        </div>

        {/* Center: THE LOGO */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex flex-col items-center group">
            <div className="text-2xl md:text-3xl font-serif font-semibold italic tracking-tighter uppercase leading-none">
              SMART<span className="text-[var(--indian-gold)]">ON</span>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-8">
          <Link href="/cart" className="relative group text-[var(--indian-maroon)] hover:text-[var(--indian-gold)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[var(--indian-maroon)] text-[var(--indian-gold)] border border-[var(--indian-gold)]/40 text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-serif font-semibold">{cartCount}</span>}
          </Link>
          <Link href="/login" className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-6 py-2 rounded-sm text-[9px] font-serif font-semibold uppercase tracking-[0.2em] hover:bg-[var(--indian-gold)] hover:text-white transition-all hidden md:block border border-[var(--indian-maroon)] shadow-sm">
            Portal
          </Link>
          {/* Mobile Menu Trigger */}
          <button className="md:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="12" y1="6" x2="21" y2="6"></line></svg>
          </button>
        </div>
      </nav>
    </div>
  );
}
