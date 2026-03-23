'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/config/api';

interface Banner {
  id: string;
  _id?: string;
  title: string;
  image: string;
  linkProductId?: string;
}

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  const API_URL = getApiUrl();

  useEffect(() => {
    const token = localStorage.getItem('onoff_user_token');
    setIsAuthenticated(!!token);

    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/banners`);
        const data = await res.json();
        setBanners(data);
      } catch (err) { console.error("Banner Feed Failure"); }
    };
    fetchBanners();
    const interval = setInterval(fetchBanners, 10000);

    const handleScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  return (
    <div className="relative min-h-[300vh] bg-[#faf9f6] text-gray-900 selection:bg-[#ce9c41] selection:text-white overflow-hidden font-sans">
      
      {/* 👑 DYNAMIC HERO - Elegant Heritage Parallax */}
      <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {banners.length > 0 ? (
          banners.map((banner, idx) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${idx === currentBannerIdx ? 'opacity-100' : 'opacity-0'}`}
              style={{ transform: `scale(${1 + scrolled * 0.0005}) translateY(${scrolled * 0.1}px)` }}
            >
              <img 
                src={banner.image} 
                alt={banner.title} 
                className="w-full h-full object-cover transition-transform duration-[4000ms] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#68050E]/60 via-black/40 to-[#68050E]/80 mix-blend-multiply"></div>
              
              {/* Floating Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                 <h1 className="text-[10vw] md:text-[8vw] font-serif text-[#FAF9F6] font-normal leading-[1.1] tracking-wide text-center drop-shadow-2xl transition-all duration-1000"
                     style={{ opacity: 1 - scrolled * 0.002 }}>
                   {banner.title}
                 </h1>
                 <div className="w-24 h-[1px] bg-[#CE9C41] my-8 animate-pulse"></div>
                 <p className="text-sm md:text-base font-serif text-[#CE9C41] tracking-[0.4em] uppercase opacity-90">
                   Heritage Collection
                 </p>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#68050E] overflow-hidden">
             <div className="relative">
                <div className="w-48 h-48 rounded-full border border-[#CE9C41]/30 animate-spin-slow"></div>
                <div className="w-64 h-64 rounded-full border border-[#CE9C41]/10 absolute -top-8 -left-8 animate-spin-slow-reverse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="text-[#CE9C41] text-4xl font-serif tracking-[0.2em] uppercase">
                        ONOFF
                      </div>
                   </div>
                </div>
             </div>
             <p className="absolute bottom-24 text-xs font-serif tracking-[0.3em] text-[#CE9C41] uppercase animate-pulse">Curating The Archive...</p>
          </div>
        )}

        {/* Cinematic Navigation Layer */}
        <div className="absolute bottom-24 flex flex-col items-center gap-10 z-20 animate-fade-in-up">
           <Link href={isAuthenticated ? "/shop" : "/login"} className="group relative px-16 py-5 overflow-hidden border border-[#CE9C41]/50 hover:border-[#CE9C41] transition-all duration-700 bg-black/20 backdrop-blur-md rounded-sm">
              <span className="relative z-10 font-sans font-light uppercase tracking-[0.4em] text-xs text-[#FAF9F6] group-hover:text-white transition-colors">
                {isAuthenticated ? "Enter The Atelier" : "Explore Collections"}
              </span>
              <div className="absolute inset-0 bg-[#CE9C41]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
           </Link>
           <div className="flex gap-4 items-center">
              {banners.map((_, i) => (
                <div key={i} className={`h-[2px] transition-all duration-500 ${i === currentBannerIdx ? 'w-12 bg-[#CE9C41]' : 'w-4 bg-white/40'}`}></div>
              ))}
           </div>
        </div>
      </section>

      {/* 🌺 HERITAGE & MODERNITY - Second Section */}
      <section className="relative z-20 bg-[#FAF9F6] py-40 px-6 md:px-24">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 relative group order-2 md:order-1">
               <div className="relative z-10 w-full h-[600px] overflow-hidden border border-[#e0dacd] shadow-2xl p-4 bg-white">
                  <img 
                    src="https://images.unsplash.com/photo-1583391733958-d25e07fac662?w=800" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2000ms]"
                    alt="Heritage"
                  />
               </div>
               <div className="absolute -bottom-8 -right-8 w-48 h-48 border border-[#CE9C41] z-0 hidden md:block"></div>
               <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#68050E] z-0 hidden md:block opacity-5"></div>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-10 order-1 md:order-2 pl-0 md:pl-12">
               <span className="text-[#CE9C41] text-xs font-sans tracking-[0.4em] uppercase font-semibold">The Philosophy</span>
               <h2 className="text-5xl md:text-7xl font-serif text-[#68050E] leading-[1.1]">
                  Rooted In Heritage, <br /> Designed For The <br /> Modern Era.
               </h2>
               <p className="text-lg md:text-xl text-gray-600 font-serif leading-relaxed max-w-2xl border-l-2 border-[#CE9C41] pl-8">
                  Discover luxury that transcends time. Each piece in our collection is meticulously crafted, blending classic Indian artistry with contemporary silhouettes. Limited editions, unparalleled elegance.
               </p>
               <div className="flex gap-16 mt-8 border-t border-[#e0dacd] pt-8 text-xs font-sans uppercase tracking-[0.2em] text-[#68050E]">
                  <div className="flex flex-col gap-2 font-semibold"><span className="text-gray-400">Craftsmanship</span><span>Artisanal</span></div>
                  <div className="flex flex-col gap-2 font-semibold"><span className="text-gray-400">Origin</span><span>India</span></div>
                  <div className="flex flex-col gap-2 font-semibold"><span className="text-gray-400">Purity</span><span>100% Authentic</span></div>
               </div>
            </div>
         </div>
      </section>

      {/* 🖼️ THE GALLERY OF DROPS - Elegant Grid */}
      <section className="relative z-20 py-40 bg-white">
         <div className="flex flex-col items-center mb-24 text-center">
            <span className="text-[#CE9C41] text-xs font-sans tracking-[0.4em] uppercase font-semibold mb-6">Archive Releases</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#68050E]">
              The Signature Series
            </h2>
            <div className="w-16 h-[1px] bg-[#68050E] mt-8"></div>
         </div>

         <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { img: 'https://images.unsplash.com/photo-1610030469983-98e550d61dc0?w=600', title: 'Regal Velvet Sherwani', detail: 'Hand-embroidered' },
              { img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', title: 'Silk Fusion Drape', detail: 'Varanasi Weave' },
              { img: 'https://images.unsplash.com/photo-1583391733975-6b45e45c48b2?q=80', title: 'Classic Jodhpuri Suit', detail: 'Tailored fit' }
            ].map((item, i) => (
              <div key={i} className="group flex flex-col gap-6 cursor-pointer">
                 <div className="h-[600px] overflow-hidden border border-[#e0dacd] bg-[#FAF9F6] p-3">
                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt={item.title} />
                 </div>
                 <div className="flex flex-col items-center text-center">
                    <h3 className="text-xl font-serif text-[#68050E] mb-2">{item.title}</h3>
                    <p className="text-xs font-sans text-gray-500 uppercase tracking-widest">{item.detail}</p>
                 </div>
              </div>
            ))}
         </div>
         <div className="flex justify-center mt-20">
             <Link href="/shop" className="px-12 py-4 border border-[#68050E] text-[#68050E] font-sans text-xs uppercase tracking-[0.3em] hover:bg-[#68050E] hover:text-white transition-all duration-500">
                View Complete Catalog
             </Link>
         </div>
      </section>

      {/* 🏺 FINAL GATEWAY - Luxurious Footer Lead */}
      <section className="relative z-20 py-40 flex flex-col items-center justify-center text-center bg-[#68050E] overflow-hidden">
         {/* Subtle Pattern Background */}
         <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#CE9C41 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
         
         <div className="relative z-10 flex flex-col items-center gap-10 max-w-4xl px-6">
            <h2 className="text-5xl md:text-7xl font-serif text-[#FAF9F6] leading-[1.2]">
              Experience True Elegance.
            </h2>
            <Link href="/login" className="mt-8 px-16 py-6 bg-[#CE9C41] text-[#68050E] font-sans font-semibold text-xs uppercase tracking-[0.3em] hover:bg-white transition-colors duration-500">
               Sign In & Explore
            </Link>
         </div>
      </section>

      <footer className="relative z-30 py-20 px-12 border-t border-[#e0dacd] bg-[#FAF9F6] text-xs font-sans tracking-[0.2em] text-[#68050E] flex flex-col md:flex-row justify-between items-center gap-10 uppercase">
         <div className="flex gap-10">
            <span className="hover:text-[#CE9C41] cursor-pointer transition-colors">Boutiques</span>
            <span className="hover:text-[#CE9C41] cursor-pointer transition-colors">Client Care</span>
            <span className="hover:text-[#CE9C41] cursor-pointer transition-colors">Legal</span>
         </div>
         <div className="text-3xl font-serif text-[#68050E] tracking-widest">ONOFF</div>
         <div className="flex gap-10 text-right">
            <span className="text-gray-500">Made in India</span>
            <span className="hover:text-[#CE9C41] transition-colors">© 2024 ONOFF</span>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes spinSlowReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow-reverse {
          animation: spinSlowReverse 30s linear infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 40s linear infinite;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 2s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.5s ease-out both; }
      `}</style>
    </div>
  );
}
