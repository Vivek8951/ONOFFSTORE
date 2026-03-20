import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-text-light text-text-dark pt-24 pb-12 px-6 md:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16">
        
        <div className="col-span-1 md:col-span-1 flex flex-col gap-6">
          <Link href="/" className="font-serif text-4xl font-bold tracking-[0.2em] text-white">
            ONOFF
          </Link>
          <p className="text-sm text-text-muted leading-relaxed">
            Crafting minimal ethnic and modern fusion essentials for India. Uncompromising quality and design.
          </p>
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-2">Shop</h4>
          <Link href="/shop/men" className="text-sm text-text-muted hover:text-white transition-colors">Men's Apparel</Link>
          <Link href="/shop/women" className="text-sm text-text-muted hover:text-white transition-colors">Women's Apparel</Link>
          <Link href="/shop/kids" className="text-sm text-text-muted hover:text-white transition-colors">Kids' Collection</Link>
          <Link href="/shop/accessories" className="text-sm text-text-muted hover:text-white transition-colors">Accessories</Link>
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-2">Help</h4>
          <Link href="/faq" className="text-sm text-text-muted hover:text-white transition-colors">FAQ & Shipping</Link>
          <Link href="/returns" className="text-sm text-text-muted hover:text-white transition-colors">Returns & Exchanges</Link>
          <Link href="/contact" className="text-sm text-text-muted hover:text-white transition-colors">Contact Us</Link>
          <Link href="/size-guide" className="text-sm text-text-muted hover:text-white transition-colors">Size Guide</Link>
        </div>

        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-2">Newsletter</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            Sign up for 10% off your first order, updates, and more.
          </p>
          <form className="mt-2 flex border-b border-text-muted focus-within:border-white transition-colors pb-2 group">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-text-muted"
            />
            <button type="submit" className="text-xs tracking-widest uppercase font-semibold text-white/50 group-hover:text-white transition-colors">
              Join
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
        <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">
          &copy; {new Date().getFullYear()} ONOFF INDIA. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-6">
          {/* Social Icons Placeholders */}
          <a href="#" className="text-text-muted hover:text-white transition-colors">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" className="text-text-muted hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
