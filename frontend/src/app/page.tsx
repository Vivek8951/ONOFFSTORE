import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
  return (
    <>
      <Hero />
      <ProductGrid />

      {/* Another split banner section for visual variety */}
      <section className="bg-primary-light flex flex-col md:flex-row h-auto md:h-screen w-full mt-12 md:mt-24">
        
        {/* Left Image Split */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full relative overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop" 
            alt="Editorial Campaign" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out"
          />
        </div>

        {/* Right Content Split */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-12 md:p-24 bg-surface-light text-text-light text-center">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-accent mb-4">The STREETWEAR Drop</span>
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight uppercase font-sans">
            URBAN <br /> ESSENTIALS
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-sm mb-10 leading-relaxed font-semibold uppercase tracking-wide">
            Defined by oversized fits, distressed textures, and uncompromising urban style. Built for the streets.
          </p>
          <a href="/shop" className="inline-block px-12 py-5 bg-black text-white text-sm tracking-widest uppercase font-black hover:bg-accent transition-colors duration-300">
            DISCOVER NOW
          </a>
        </div>
        
      </section>

      {/* Highlights / Features Banner */}
      <section className="py-24 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: "✧", title: "Premium Materials", desc: "Sourced globally to ensure highest quality." },
            { icon: "✦", title: "Free Global Shipping", desc: "Complimentary express delivery on orders over ₹15,000." },
            { icon: "❁", title: "Sustainable Sourcing", desc: "Ethically made using 100% recycled packaging." }
          ].map((item, idx) => (
             <div key={idx} className="flex flex-col items-center gap-4">
               <span className="text-3xl text-accent">{item.icon}</span>
               <h3 className="text-lg font-semibold tracking-wide uppercase">{item.title}</h3>
               <p className="text-sm text-text-muted max-w-[200px]">{item.desc}</p>
             </div>
          ))}
        </div>
      </section>
      {/* App Download / Explore Full Collection Banner */}
      <section className="w-full bg-[#f21c43] text-white py-16 md:py-24 mt-12 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(242, 28, 67, 0.9), rgba(242, 28, 67, 0.9)), url('https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=1200&auto=format&fit=crop')"}}>
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <span className="bg-white text-[#f21c43] text-xs font-black uppercase px-4 py-1.5 rounded-full mb-6 tracking-widest shadow-lg">Mobile App Now Live</span>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 drop-shadow-md">
            The World of ONOFF in Your Pocket
          </h2>
          <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl text-red-100">
            Download our app from the Playstore for exclusive drops, 24/7 tracking, and app-only discounts up to 20% off. Or explore our full catalog directly on the website.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            {/* Playstore Button */}
            <a href="#" className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-gray-800">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M3.52 2.76A1.85 1.85 0 003 4.2V19.8a1.85 1.85 0 00.52 1.44l.05.05 8.95-8.94V12.1L3.57 3.15l-.05-.39zm9.58 10.39l-1.68 1.68-1.68-1.68 5.75-5.75c.42-.42.42-1.12 0-1.55l-5.75-5.75 1.68-1.68 6.53 6.53c.84.84.84 2.22 0 3.06l-4.85 4.85z"/></svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Get it on</span>
                <span className="text-lg font-black tracking-tight leading-none">Google Play</span>
              </div>
            </a>
            
            <a href="/shop" className="bg-white text-[#f21c43] px-10 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-xl">
              Explore Products Online
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
