import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  // Floating Luxury Island Design
  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-6xl transition-all duration-700 ${isLanding ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      <nav className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[30px] px-8 py-4 flex items-center justify-between">
        
        {/* Left: Collections */}
        <div className="flex items-center gap-10">
          <Link href="/shop" className="group relative flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Shop</span>
            <div className="h-[2px] w-0 bg-[#f21c43] group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/my-orders" className="group relative flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors">My Orders</span>
            <div className="h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></div>
          </Link>
          <Link href="/track" className="group relative flex flex-col items-center hidden md:flex">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors">Track</span>
            <div className="h-[2px] w-0 bg-black group-hover:w-full transition-all duration-300"></div>
          </Link>
        </div>

        {/* Center: THE LOGO */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex flex-col items-center group">
            <div className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
              SMART<span className="text-[#f21c43]">ON</span>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-8">
          <Link href="/cart" className="relative group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span className="absolute -top-1.5 -right-1.5 bg-[#f21c43] text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">2</span>
          </Link>
          <Link href="/login" className="bg-black text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#f21c43] transition-all hidden md:block">
            Member Portal
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
