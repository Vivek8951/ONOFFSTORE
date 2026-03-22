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
    const interval = setInterval(fetchBanners, 10000); // 📡 REAL-TIME FEED SYNC

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
    <div className="relative min-h-[300vh] bg-black text-white selection:bg-[#f21c43] selection:text-white overflow-hidden font-sans">
      
      {/* 🚀 DYNAMIC HERO - Architectural Parallax */}
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
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-[3000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black opacity-90"></div>
              
              {/* Floating Content for each banner */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                 <h1 className="text-[12vw] md:text-[15vw] font-black leading-[0.8] tracking-[-0.08em] uppercase italic transition-all duration-1000"
                     style={{ opacity: 1 - scrolled * 0.002 }}>
                   {banner.title.split(' ')[0]}<span className="text-[#f21c43]">{banner.title.split(' ')[1] || 'ON'}</span>
                 </h1>
                 <p className="text-[10px] md:text-sm font-black tracking-[1em] uppercase text-gray-400 opacity-60 mt-8 animate-pulse">
                   {banner.title} • GLOBAL ARCHIVE
                 </p>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
             {/* 🌪️ ARCHITECTURAL LOADING VOID */}
             <div className="relative">
                <div className="w-96 h-96 rounded-full border border-white/5 animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="text-[#f21c43] text-6xl font-black italic tracking-tighter uppercase animate-pulse">
                        SMART<span className="text-white">ON</span>
                      </div>
                      <div className="flex gap-2">
                         {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-[#f21c43] rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                      </div>
                   </div>
                </div>
             </div>
             <p className="absolute bottom-24 text-[10px] font-black uppercase tracking-[1em] text-gray-800 animate-pulse">ESTABLISHING GLOBAL ARCHIVE SIGNAL...</p>
          </div>
        )}

        {/* Cinematic Navigation Layer */}
        <div className="absolute bottom-24 flex flex-col items-center gap-10 z-20 animate-fade-in-up">
           <Link href={isAuthenticated ? "/shop" : "/login"} className="group relative px-24 py-7 overflow-hidden border-2 border-white/10 hover:border-[#f21c43] transition-all duration-700 rounded-full backdrop-blur-md">
              <span className="relative z-10 font-black uppercase tracking-[0.6em] text-xs group-hover:text-white transition-colors">
                {isAuthenticated ? "Enter the Atelier" : "Join the Archive"}
              </span>
              <div className="absolute inset-0 bg-[#f21c43] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
           </Link>
           <div className="flex gap-4 items-center">
              {banners.map((_, i) => (
                <div key={i} className={`h-1 transition-all duration-500 rounded-full ${i === currentBannerIdx ? 'w-12 bg-[#f21c43]' : 'w-4 bg-white/20'}`}></div>
              ))}
           </div>
        </div>
      </section>

      {/* 🏙️ ARCHITECTURAL FRAGMENTS - Second Section */}
      <section className="relative z-20 bg-[#050505] py-60 px-6 md:px-24 border-y border-white/5">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-24 items-center">
            <div className="md:col-span-5 relative group order-2 md:order-1">
               <div className="absolute -inset-10 bg-[#f21c43]/5 blur-3xl group-hover:bg-[#f21c43]/10 transition-all duration-1000"></div>
               <div className="relative z-10 w-full h-[700px] overflow-hidden rounded-[40px] border border-white/10 group-hover:border-white/30 transition-all duration-1000">
                  <img 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" 
                    className="w-full h-full object-cover grayscale group-hover:scale-110 group-hover:grayscale-0 transition-all duration-[2000ms]"
                    alt="Identity 01"
                  />
               </div>
               <span className="absolute -bottom-10 -right-10 z-20 text-[12rem] font-black text-white/5 tracking-tighter mix-blend-difference pointer-events-none select-none">01</span>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-12 order-1 md:order-2">
               <span className="text-[#f21c43] text-[10px] font-black tracking-[1em] uppercase">The Philosophy</span>
               <h2 className="text-5xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] italic transition-all">
                  IDENTITY <br /> IS THE ONLY <br /> <span className="text-[#f21c43]">CURRENCY.</span>
               </h2>
               <p className="text-xl md:text-3xl text-gray-500 font-light italic leading-relaxed max-w-2xl border-l-4 border-[#f21c43] pl-10">
                  Armor for the urban vanguard. Limited to 100 collections. Never reproduced. The archive is open.
               </p>
               <div className="flex gap-12 mt-4 text-[11px] font-black uppercase tracking-widest text-gray-600">
                  <div className="flex flex-col gap-2"><span className="text-white">STOCK</span><span>LIMITED</span></div>
                  <div className="flex flex-col gap-2"><span className="text-white">ORIGIN</span><span>MUMBAI HUB</span></div>
                  <div className="flex flex-col gap-2"><span className="text-white">STATUS</span><span>ONLINE</span></div>
               </div>
            </div>
         </div>
      </section>

      {/* 🎭 THE GALLERY OF DROPS - Swiper Inspired Layout */}
      <section className="relative z-20 py-60">
         <div className="flex flex-col items-center mb-40">
            <h2 className="text-[12vw] font-black uppercase tracking-[-0.05em] text-white/5 animate-ticker whitespace-nowrap">
              SMARTON_PRIVATE_COLLECTION_2024_DROP_AVAILABLE_ARCHIVE_ACCESS_ONLY_
            </h2>
         </div>

         <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { img: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=600', title: 'Industrial Suit', tag: 'V.1' },
              { img: 'https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=600', title: 'Vanguard Techelite', tag: 'V.9' },
              { img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', title: 'Carbon Jacket', tag: 'V.4' }
            ].map((item, i) => (
              <div key={i} className="group relative bg-[#0a0a0a] rounded-[50px] overflow-hidden border border-white/5 transition-all duration-700 hover:border-[#f21c43]/30 hover:-translate-y-8">
                 <div className="h-[500px] overflow-hidden">
                    <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1500ms]" alt={item.title} />
                 </div>
                 <div className="p-12 flex justify-between items-center bg-gradient-to-t from-black to-transparent">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-widest italic">{item.title}</h3>
                      <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Protocol Version {item.tag}</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#f21c43] group-hover:border-[#f21c43] transition-all">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 🔮 FINAL GATEWAY - Immersive End */}
      <section className="relative z-20 h-screen flex flex-col items-center justify-center text-center bg-[#050505] border-t border-white/5 overflow-hidden">
         <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10">
            <h2 className="text-[50vw] font-black tracking-tighter uppercase italic select-none">ONOFF</h2>
         </div>
         <div className="relative z-10 flex flex-col items-center gap-12">
            <h2 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
              REVEAL <br /> THE ARCHIVE.
            </h2>
            <Link href="/login" className="px-32 py-10 bg-white text-black font-black text-2xl uppercase tracking-[0.6em] hover:bg-[#f21c43] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-[0_40px_100px_rgba(242,28,67,0.4)] rounded-full">
               Verified Access
            </Link>
            <p className="text-[10px] text-gray-600 font-black tracking-[1em] uppercase mt-12 animate-pulse">End of Signal • Private Archive Open</p>
         </div>
      </section>

      <footer className="relative z-30 py-32 px-12 border-t border-white/5 bg-black text-[10px] font-black tracking-[0.5em] text-gray-500 flex flex-col md:flex-row justify-between items-center gap-16 uppercase">
         <div className="flex gap-16 order-2 md:order-1">
            <span className="hover:text-[#f21c43] cursor-crosshair transition-colors">Mumbai Hub</span>
            <span className="hover:text-[#f21c43] cursor-crosshair transition-colors">Digital Bill</span>
            <span className="hover:text-[#f21c43] cursor-crosshair transition-colors">Security Node</span>
         </div>
         <div className="text-white text-xl md:text-2xl italic tracking-tighter font-black order-1 md:order-2">SMART<span className="text-[#f21c43]">ON</span></div>
         <div className="flex gap-16 text-right order-3">
            <span className="text-gray-800">AES-256 ENCRYPTED</span>
            <span className="hover:text-white transition-colors">© 2024 WORLDWIDE</span>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes revealUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes ticker {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 20s linear infinite;
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 2s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.5s cubic-bezier(0.19, 1, 0.22, 1) both; }
      `}</style>
    </div>
  );
}
