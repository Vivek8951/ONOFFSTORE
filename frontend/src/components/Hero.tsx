import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Elegantly styled background image matching Zara aesthetic */}
      <img 
        src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop" 
        alt="ONOFF Premium Editorial Collection" 
        className="absolute w-full h-full object-cover object-center opacity-90 scale-[1.02]"
      />
      
      {/* Content strictly positioned for minimalism */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6 mt-40">
        <h1 className="text-5xl md:text-8xl font-light text-text-light leading-none tracking-tight">
          Modern Elements
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto font-normal mt-2 leading-relaxed tracking-wide">
          Autumn / Winter 2024 Collection. Refined staples for the contemporary wardrobe.
        </p>
        
        <div className="mt-12 flex gap-6 w-full justify-center">
          <Link href="/shop" className="px-10 py-4 bg-gray-900 text-white text-xs font-semibold tracking-[0.2em] uppercase hover:bg-black transition-all duration-300">
            DISCOVER COLLECTION
          </Link>
        </div>
      </div>
      
      {/* Scroll indicator down bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="h-10 w-[1px] bg-white text-white rounded-full"></div>
      </div>
    </section>
  );
}
