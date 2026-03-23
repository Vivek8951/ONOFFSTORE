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

  // Floating Luxury Island Design
  return (
    <div className={`fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-[100] w-[96%] md:w-[92%] max-w-6xl transition-all duration-700 ${isLanding ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      <nav className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[20px] md:rounded-[30px] px-5 md:px-8 py-3 md:py-4 flex items-center justify-between">
        
        {/* Left: Collections (Hidden on Mobile) */}
        <div className="flex items-center gap-10 hidden md:flex">
          <Link href="/shop" className="group relative flex flex-col items-center">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-[0.3em] text-[var(--indian-maroon)]">Shop</span>
            <div className="h-[1px] w-0 bg-[var(--indian-gold)] group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/my-orders" className="group relative flex flex-col items-center">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-[0.3em] text-[var(--indian-maroon)]/50 group-hover:text-[var(--indian-maroon)] transition-colors">My Orders</span>
            <div className="h-[1px] w-0 bg-[var(--indian-gold)] group-hover:w-full transition-all duration-300"></div>
          </Link>
        </div>

        {/* Center: THE LOGO */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex flex-col items-center group">
            <div className="text-lg md:text-3xl font-serif font-semibold italic tracking-tighter uppercase leading-none">
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
          <button 
            className="md:hidden text-[var(--indian-maroon)] hover:text-[var(--indian-gold)] transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Luxury Mobile Drawer */}
      <div className={`fixed inset-0 z-[90] bg-white/95 backdrop-blur-xl transition-all duration-500 ease-in-out md:hidden flex flex-col items-center justify-center gap-12 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8">
          {[
            { href: '/shop', label: 'THE COLLECTIONS' },
            { href: '/my-orders', label: 'MY COMMISSIONS' },
            { href: '/track', label: 'TRACK ORDER' },
            { href: '/login', label: 'ATELIER PORTAL' }
          ].map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xl font-serif font-semibold italic uppercase tracking-[0.2em] text-[var(--indian-maroon)] hover:text-[var(--indian-gold)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="mt-12 w-20 h-[1px] bg-[var(--indian-gold)]/30"></div>
        <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-gray-400">SMARTON BY ONOFF</p>
      </div>

      {/* LUXURY BOTTOM DOCK: MOBILE ONLY */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md">
        <div className="bg-[var(--indian-maroon)]/90 backdrop-blur-3xl border border-white/10 rounded-full px-8 py-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-b-2 border-b-[var(--indian-gold)]/40 overflow-hidden ring-1 ring-white/5">
          <Link href="/shop" className={`flex flex-col items-center gap-1 ${pathname === '/shop' ? 'text-[var(--indian-gold)]' : 'text-white/60'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </Link>

          <Link href="/my-orders" className={`flex flex-col items-center gap-1 ${pathname === '/my-orders' ? 'text-[var(--indian-gold)]' : 'text-white/60'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </Link>

          <Link href="/cart" className={`relative flex flex-col items-center gap-1 ${pathname === '/cart' ? 'text-[var(--indian-gold)]' : 'text-white/60'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[var(--indian-gold)] text-[var(--indian-maroon)] text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--indian-maroon)]">{cartCount}</span>}
          </Link>

          <Link href="/admin" className={`flex flex-col items-center gap-1 ${pathname === '/admin' ? 'text-[var(--indian-gold)]' : 'text-white/60'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path><path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
          </Link>
        </div>
      </div>
    </div>

  );
}
