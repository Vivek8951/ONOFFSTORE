import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="w-full flex justify-center fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100">
      <nav className="w-full max-w-[1440px] bg-white relative">
        
        {/* Luxury Announcement Bar - Optimized for Mobile visibility */}
        <div className="w-full bg-black text-white py-1.5 px-4 text-center">
          <span className="text-[7.5px] md:text-[9px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">Free Express Shipping on all SMARTON Orders</span>
        </div>

        {/* Main Fashion Header */}
        <div className="w-full grid grid-cols-3 items-center px-6 md:px-12 py-6">
          
          {/* Left: Navigation Menu */}
          <div className="flex items-center gap-8">
            <Link href="/shop" className="text-[11px] font-black uppercase tracking-[0.2em] text-black hover:text-[#f21c43] transition-colors hidden md:block">Collections</Link>
            <Link href="/track" className="text-[11px] font-black uppercase tracking-[0.2em] text-black hover:text-[#f21c43] transition-colors hidden md:block">Track Order</Link>
            <button className="md:hidden">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
          
          {/* Center: THE LOGO (Responsive scaling) */}
          <div className="flex justify-center">
            <Link href="/" className="flex flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="SMARTON" 
                className="h-10 md:h-28 w-auto object-contain hover:scale-105 active:scale-95 transition-all duration-500 ease-in-out" 
              />
            </Link>
          </div>
          
          {/* Right: Actions Menu */}
          <div className="flex items-center justify-end gap-6 md:gap-10">
            <button className="text-black hover:opacity-50 transition-opacity">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <Link href="/login" className="text-black hover:opacity-50 transition-opacity group relative hidden md:block">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black text-white text-[8px] font-black uppercase px-2 py-1 transition-transform">Account</span>
            </Link>
            <Link href="/my-orders" className="text-black hover:opacity-50 transition-opacity group relative hidden md:block">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black text-white text-[8px] font-black uppercase px-2 py-1 transition-transform whitespace-nowrap">My Orders</span>
            </Link>
            <Link href="/cart" className="text-black hover:opacity-50 transition-opacity relative group">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span className="absolute -top-2 -right-2 bg-[#f21c43] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">1</span>
            </Link>
          </div>
        </div>

        {/* Minimal Category Nav */}
        <div className="w-full hidden md:flex justify-center py-4 border-t border-gray-50 bg-[#fafafa]">
           <div className="flex gap-12">
             {['New In', 'Apparel', 'Accessories', 'Limited Drop', 'Archives'].map(cat => (
               <Link key={cat} href="/shop" className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] hover:text-black transition-colors">{cat}</Link>
             ))}
           </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM TABS (Streamlined & Safe Area Optimized) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 z-[100] flex justify-around items-center px-4 py-4 pb-[env(safe-area-inset-bottom,20px)] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <Link href="/" className="flex flex-col items-center gap-1.5 text-black">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          <span className="text-[7.5px] font-black uppercase tracking-widest">Store</span>
        </Link>
        <Link href="/shop" className="flex flex-col items-center gap-1.5 text-gray-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span className="text-[7.5px] font-black uppercase tracking-widest">Browse</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center gap-1.5 text-gray-400 relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">1</span>
          <span className="text-[7.5px] font-black uppercase tracking-widest">Bag</span>
        </Link>
        <Link href="/my-orders" className="flex flex-col items-center gap-1.5 text-gray-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          <span className="text-[7.5px] font-black uppercase tracking-widest">Status</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center gap-1.5 text-gray-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span className="text-[7.5px] font-black uppercase tracking-widest">Profile</span>
        </Link>
      </div>
    </div>
  );
}
