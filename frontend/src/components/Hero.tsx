'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useBanners } from '../hooks/useBanners';

export default function Hero() {
  const { banners } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const activeBanners = banners.filter(b => b.active);

  // Auto-slide effect
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const categories = [
    { name: 'Women', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop' },
    { name: 'Dresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop' },
    { name: 'Men', img: 'https://images.unsplash.com/photo-1516826957135-700dde185527?w=400&auto=format&fit=crop' },
    { name: 'Curve', img: 'https://images.unsplash.com/photo-1621743621471-eb2c1d37b120?w=400&auto=format&fit=crop' },
    { name: 'Kids', img: 'https://images.unsplash.com/photo-1622290291468-a28f7a5dc6a8?w=400&auto=format&fit=crop' },
  ];

  if (activeBanners.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center pt-32 md:pt-40 bg-white">
      {/* Mega Sale Banner Slider */}
      <section className="w-full max-w-[1440px] px-2 md:px-6 relative overflow-hidden group">
        <div 
          className="flex transition-transform duration-1000 ease-in-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {activeBanners.map((banner, index) => (
            <div key={banner.id} className="relative w-full aspect-[4/3] md:aspect-[21/9] flex-shrink-0 flex items-center justify-center overflow-hidden bg-black text-white">
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="absolute inset-0 w-full h-full object-cover object-top opacity-60 transition-transform duration-[5000ms] scale-110"
                style={{ transform: currentSlide === index ? 'scale(1)' : 'scale(1.1)' }}
              />
              
              <div className="relative z-10 flex flex-col items-center text-center p-6 drop-shadow-2xl">
                <span className="bg-[#f21c43] text-white px-4 py-1.5 font-black md:text-xl rounded shadow-lg uppercase mb-4 tracking-[0.2em] animate-pulse">
                   Exclusive Drop
                </span>
                <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter leading-none mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] uppercase max-w-4xl">
                  {banner.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Link href="/shop" className="bg-white text-black px-10 py-4 font-black uppercase text-sm tracking-[0.2em] hover:bg-[#f21c43] hover:text-white transition-all shadow-2xl">
                    Explore All
                  </Link>
                  {banner.linkProductId && (
                    <Link href={`/product/${banner.linkProductId}`} className="bg-black/40 backdrop-blur-md border border-white/30 text-white px-10 py-4 font-black uppercase text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                      View Product
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {activeBanners.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${currentSlide === i ? 'bg-white scale-125' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bubble Categories Navigation (Extremely SHEIN: visual bubbles for fast shopping) */}
      <section className="w-full max-w-[1440px] px-2 md:px-6 mt-6 md:mt-10 mb-8">
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 scrollbar-hide px-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-100 overflow-hidden border-2 border-transparent group-hover:border-black p-0.5 transition-colors">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <span className="text-sm font-bold uppercase tracking-tight text-gray-800">{cat.name}</span>
            </div>
          ))}
          
          {/* View All bubble */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center border-2 border-transparent group-hover:border-black transition-colors">
               <span className="font-black text-xl text-gray-400 group-hover:text-black">→</span>
            </div>
            <span className="text-sm font-bold uppercase tracking-tight text-gray-800">More</span>
          </div>
        </div>
      </section>
      
      {/* Small Promo Strip under categories */}
      <div className="w-full max-w-[1440px] px-4 md:px-6 mb-6">
        <div className="w-full bg-[#fdf5e6] border border-[#ffb347] py-3 text-center rounded text-[#d6850b] text-sm font-bold uppercase shadow-sm">
          🔥 TRENDING NOW: Over 10,000+ new styles added today! 🔥
        </div>
      </div>
    </div>
  );
}
