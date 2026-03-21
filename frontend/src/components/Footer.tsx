import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-100 pt-24 pb-32 md:pb-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 md:gap-8">
        
        {/* Brand Information */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <Link href="/" className="flex flex-col group">
            <span className="text-3xl font-black tracking-tighter text-black leading-none group-hover:text-[#f21c43] transition-colors uppercase">
               SMART<span className="italic">ON</span>
            </span>
            <span className="text-[8px] font-black tracking-[0.4em] text-gray-400 uppercase -mt-0.5 ml-0.5 leading-none">
               By ONOFF STORE
            </span>
          </Link>
          <p className="text-xs text-gray-500 leading-loose max-w-sm tracking-widest font-sans">
            Minimalist luxury. Elevated streetwear. Engineered perfectly for the contemporary wardrobe.
          </p>
          
          <div className="flex gap-4 mt-2">
            <a href="#" className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all text-sm font-serif">IG</a>
            <a href="#" className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all text-sm font-serif">X</a>
            <a href="#" className="w-10 h-10 border border-gray-200 flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-all text-sm font-serif">TT</a>
          </div>
        </div>

        {/* Links Array */}
        <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-8">
          
          {/* Collection */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Discover</h4>
            <nav className="flex flex-col gap-3 text-xs tracking-wider text-gray-500 font-medium">
              <Link href="/shop" className="hover:text-black transition-colors">Autumn / Winter '24</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Best Sellers</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Essential Denim</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Tonal Knitwear</Link>
            </nav>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Client Services</h4>
            <nav className="flex flex-col gap-3 text-xs tracking-wider text-gray-500 font-medium">
              <Link href="/track" className="hover:text-black underline underline-offset-4 transition-colors text-black">Track Order</Link>
              <Link href="/" className="hover:text-black transition-colors">Client Support</Link>
              <Link href="/" className="hover:text-black transition-colors">Returns & Exchanges</Link>
              <Link href="/" className="hover:text-black transition-colors">Size Assistance</Link>
            </nav>
          </div>

          {/* Legal / Social */}
          <div className="flex flex-col gap-6 col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Company</h4>
            <nav className="flex flex-col gap-3 text-xs tracking-wider text-gray-500 font-medium">
              <Link href="/about" className="hover:text-black transition-colors">Our Philosophy</Link>
              <Link href="/stores" className="hover:text-black transition-colors">Boutique Locations</Link>
              <Link href="/terms" className="hover:text-black transition-colors">Terms & Privacy</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">© {new Date().getFullYear()} SMARTON BY ONOFF. All Rights Reserved.</p>
        <div className="flex gap-4 items-center">
            <span className="text-[9px] uppercase tracking-widest text-gray-400">Currency: INR ₹</span>
        </div>
      </div>
    </footer>
  );
}
