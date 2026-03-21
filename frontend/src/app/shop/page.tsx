'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid';

export default function ShopArchive() {
  const [activeCategory, setActiveCategory] = useState('ALL ARCHIVE');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-black font-sans pt-32 pb-24">
      {/* 🏙️ ARCHIVE HEADER */}
      <header className="px-6 md:px-24 mb-20 animate-fade-in">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="flex flex-col">
            <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter uppercase leading-[0.85] italic">
              THE <br /> <span className="text-[#f21c43]">DROP.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-300 mt-8">Secure Luxury Goods_Curated for the Avant-Garde</p>
          </div>
          
          <div className="flex flex-col items-end gap-6">
             <div className="flex gap-8 border-b border-black pb-4">
                {['ALL ARCHIVE', 'APPAREL', 'CARGO','ACCESSORIES'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'text-[#f21c43]' : 'text-gray-400 hover:text-black'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Displaying 24 results from Global Stock</p>
          </div>
        </div>
      </header>

      {/* 📦 CURATED PRODUCT FEED */}
      <main className="px-6 md:px-12 max-w-[1600px] mx-auto animate-fade-in-up">
        {/* We reuse the ProductGrid but wrap it in a cleaner container */}
        <div className="relative">
          <ProductGrid />
        </div>
      </main>

      {/* 🎞️ EDITORIAL BREAK */}
      <section className="mt-40 grid grid-cols-1 md:grid-cols-2 h-screen border-y border-gray-100">
         <div className="relative group overflow-hidden">
            <img 
               src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop" 
               className="w-full h-full object-cover grayscale group-hover:scale-110 group-hover:grayscale-0 transition-all duration-1000"
               alt="Editorial"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <h2 className="text-[6vw] font-black text-white italic uppercase tracking-tighter">BORN <br /> IN BOMBAY.</h2>
            </div>
         </div>
         <div className="bg-black text-white p-12 md:p-32 flex flex-col justify-center gap-12">
            <span className="text-[10px] font-black tracking-[1em] text-[#f21c43] uppercase">Philosophy v.02</span>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight italic">
               THE STREETS <br /> ARE OUR <br /> RUNWAY.
            </h3>
            <p className="text-gray-400 text-lg md:text-xl font-light italic leading-relaxed max-w-lg">
               Smarton isn't just about what you wear; it's about how you occupy space. Every thread is an act of rebellion. Exclusive drops only for verified members.
            </p>
            <button className="self-start px-12 py-5 border-2 border-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all">
               The Manifesto
            </button>
         </div>
      </section>

      {/* 🚢 LOGISTICS BANNER */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Stock', value: 'LIMITED' },
              { label: 'Origin', value: 'INDIAN' },
              { label: 'Logistics', value: 'GLOBAL' },
              { label: 'Support', value: '24/7' }
            ].map(stat => (
              <div key={stat.label} className="flex flex-col gap-2">
                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                 <span className="text-2xl font-black uppercase italic tracking-tighter">{stat.value}</span>
              </div>
            ))}
         </div>
      </section>

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 2s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 1.5s cubic-bezier(0.19, 1, 0.22, 1) both; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
