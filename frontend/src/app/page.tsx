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
    </>
  );
}
