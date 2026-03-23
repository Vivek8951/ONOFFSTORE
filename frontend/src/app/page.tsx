'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';

interface Banner {
  id: string;
  title: string;
  image: string;
  link_product_id?: string;
}

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('onoff_user_token');
    setIsAuthenticated(!!token);

    const fetchBanners = async () => {
      try {
        // 🚀 SUPABASE INSTANT SYNC: High-Speed Hero Feed
        const { data } = await supabase.from('banners').select('*').eq('active', true);
        if (data) setBanners(data);
      } catch (err) { console.error("Banner Feed Failure"); }
    };
    fetchBanners();
    
    // Automatic Refresh every 60s (Slow refresh for battery/performance on landing)
    const interval = setInterval(fetchBanners, 60000);

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
                 <h1 className="text-[10vw] md:text-[8vw] font-serif text-[#FAF9F6] font-normal leading-[1.1] tracking-wide text-center drop-shadow-2xl transition-all duration-1000 uppercase"
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
             <p className="absolute bottom-24 text-xs font-serif tracking-[0.3em] text-[#CE9C41] uppercase animate-pulse">Atelier Hub Syncing...</p>
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
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-10 order-1 md:order-2 pl-0 md:pl-12 text-center md:text-left">
               <span className="text-[#CE9C41] text-xs font-sans tracking-[0.4em] uppercase font-semibold">The Philosophy</span>
               <h2 className="text-5xl md:text-7xl font-serif text-[#68050E] leading-[1.1]">
                  Rooted In Heritage, <br /> Designed For The <br /> Modern Era.
               </h2>
               <div className="flex gap-16 mt-8 justify-center md:justify-start border-t border-[#e0dacd] pt-8 text-xs font-sans uppercase tracking-[0.2em] text-[#68050E]">
                  <div className="flex flex-col gap-2 font-semibold"><span>Artisanal</span></div>
                  <div className="flex flex-col gap-2 font-semibold"><span>India</span></div>
                  <div className="flex flex-col gap-2 font-semibold"><span>Authentic</span></div>
               </div>
            </div>
         </div>
      </section>

      <footer className="relative z-30 py-20 px-12 border-t border-[#e0dacd] bg-[#FAF9F6] text-xs font-sans tracking-[0.2em] text-[#68050E] flex flex-col md:flex-row justify-between items-center gap-10 uppercase">
         <div className="flex gap-10">
            <span className="hover:text-[#CE9C41] cursor-pointer transition-colors">Boutiques</span>
            <span className="hover:text-[#CE9C41] cursor-pointer transition-colors">Client Care</span>
         </div>
         <div className="text-3xl font-serif text-[#68050E] tracking-widest">ONOFF</div>
         <div className="flex gap-10 text-right">
            <span className="text-gray-500">Made in India</span>
            <span className="hover:text-[#CE9C41] transition-colors">© 2024 ONOFF</span>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes spinSlowReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-slow-reverse { animation: spinSlowReverse 30s linear infinite; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spinSlow 40s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 2s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.5s ease-out both; }
      `}</style>
    </div>
  );
}
