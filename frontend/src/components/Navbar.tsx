import Link from 'next/link';

export default function Navbar() {
  return (
    <>
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md top-0 transition-all duration-300 px-6 py-4 md:px-12 border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Links */}
        <div className="hidden md:flex gap-8 text-[11px] font-semibold tracking-widest uppercase text-gray-500">
          <Link href="/shop" className="hover:text-black transition-colors">Woman</Link>
          <Link href="/shop" className="hover:text-black transition-colors">Man</Link>
          <Link href="/shop" className="hover:text-black transition-colors">Kids</Link>
        </div>

        {/* Brand Logo */}
        <div className="flex-1 md:flex-none text-center">
          <Link href="/" className="font-serif text-3xl font-bold tracking-[0.3em] text-text-light">
            ONOFF
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <button aria-label="Search" className="hover:text-accent transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button aria-label="Account" className="hover:text-accent transition-colors hidden sm:block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <Link href="/cart" aria-label="Cart" className="hover:text-accent transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="absolute -top-1 -right-2 bg-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">1</span>
          </Link>
        </div>
      </div>
    </nav>

    {/* ELEGANTE MOBILE BOTTOM NAV */}
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 flex justify-around items-center px-4 py-3 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <Link href="/" className="flex flex-col items-center gap-1.5 text-text-light opacity-90 transition-opacity">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span className="text-[9px] font-semibold tracking-wide uppercase">Home</span>
      </Link>
      <Link href="/shop" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-text-light opacity-80 transition-opacity">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span className="text-[9px] font-semibold tracking-wide uppercase">Shop</span>
      </Link>
      <Link href="/cart" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-text-light opacity-80 transition-opacity relative">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        <span className="text-[9px] font-semibold tracking-wide uppercase">Bag</span>
        <span className="absolute -top-1.5 -right-1 bg-accent text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-bold">1</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-text-light opacity-80 transition-opacity">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span className="text-[9px] font-semibold tracking-wide uppercase">Profile</span>
      </Link>
    </div>
    </>
  );
}
