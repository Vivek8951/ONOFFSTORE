'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('onoff_user_token');
    setIsAuthenticated(!!token);

    const handleScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-[300vh] bg-black text-white selection:bg-[#f21c43] selection:text-white overflow-hidden">
      
      {/* 🚀 FIXED HERO - Editorial Parallax */}
      <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 scale-110 transition-transform duration-700 ease-out"
          style={{ transform: `scale(${1 + scrolled * 0.0005}) translateY(${scrolled * 0.1}px)` }}
        >
          <img 
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&auto=format&fit=crop" 
            alt="Main Campaign" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90"></div>
        </div>

        {/* Cinematic Title Layer */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="overflow-hidden mb-4">
             <h1 className="text-[15vw] md:text-[18vw] font-black leading-[0.8] tracking-[-0.08em] uppercase italic transition-all duration-1000 translate-y-0"
                 style={{ opacity: 1 - scrolled * 0.002 }}>
               SMART<span className="text-[#f21c43]">ON</span>
             </h1>
          </div>
          <div className="flex gap-12 text-[10px] md:text-xs font-black tracking-[0.8em] uppercase text-gray-400 opacity-60 mt-4 h-4 overflow-hidden">
             <span className="animate-reveal-up">EST. 2024</span>
             <span className="animate-reveal-up delay-100">BOMBAY CAPSULE</span>
             <span className="animate-reveal-up delay-200">PRIVATE ACCESS</span>
          </div>
        </div>

        {/* CTA Floating Buttons */}
        <div className="absolute bottom-24 flex flex-col items-center gap-8 animate-fade-in-up">
           <Link href={isAuthenticated ? "/shop" : "/login"} className="group relative px-20 py-6 overflow-hidden border-2 border-white/20 hover:border-[#f21c43] transition-colors duration-500">
              <span className="relative z-10 font-black uppercase tracking-[0.5em] text-sm group-hover:text-white transition-colors">
                {isAuthenticated ? "Enter the Atelier" : "Join the Archive"}
              </span>
              <div className="absolute inset-0 bg-[#f21c43] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
           </Link>
           <div className="text-[8px] font-black text-gray-600 tracking-widest uppercase animate-bounce mt-4">Scroll to Discover</div>
        </div>
      </section>

      {/* 🏙️ ARCHITECTURAL FRAGMENTS - Second Section */}
      <section className="relative z-20 bg-black py-40 px-6 md:px-24">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 relative group order-2 md:order-1">
               <div className="absolute -inset-4 bg-[#f21c43]/10 blur-3xl group-hover:bg-[#f21c43]/20 transition-all"></div>
               <img 
                 src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop" 
                 className="relative z-10 w-full h-[600px] object-cover grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl skew-y-3 hover:skew-y-0"
                 alt="Fragment 01"
               />
               <span className="absolute top-8 left-8 z-20 text-[6rem] font-black text-white/5 tracking-tighter mix-blend-difference">01</span>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-8 order-1 md:order-2">
               <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                  IDENTITY <br /> IS A <br /> <span className="text-[#f21c43]">CURRENCY.</span>
               </h2>
               <p className="text-lg md:text-2xl text-gray-400 font-light italic leading-loose max-w-xl">
                  We don't sell clothes. We sell armor for the urban vanguard. <br />
                  Limited to 100 collections. Never reproduced. <br />
                  Sign up for Private Entry to view the current drop.
               </p>
               <div className="h-[2px] w-24 bg-[#f21c43]"></div>
            </div>
         </div>
      </section>

      {/* 🎭 THE GALLERY OF DROPS - Third Section */}
      <section className="relative z-20 py-40 border-t border-white/5">
         <div className="flex flex-col items-center mb-24 overflow-hidden">
            <h2 className="text-[10vw] font-black uppercase tracking-[-0.05em] text-white/10 animate-ticker">THE_PRIVATE_COLLECTION_2024_DROP_AVAILABLE_NOW_</h2>
         </div>

         <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { img: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=600', title: 'Industrial Suit', tag: 'Limited' },
              { img: 'https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=600', title: 'Vanguard Techelite', tag: 'Sold Out' },
              { img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', title: 'Carbon Jacket', tag: 'Member Only' }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden bg-white/5 p-4 rounded-3xl border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-4">
                 <img src={item.img} className="w-full h-[400px] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 rounded-2xl" alt={item.title} />
                 <div className="mt-8 flex justify-between items-center px-4">
                    <h3 className="text-xl font-black uppercase tracking-widest">{item.title}</h3>
                    <span className="text-[8px] font-black px-3 py-1 bg-[#f21c43] text-white rounded-full uppercase tracking-widest">{item.tag}</span>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 🚪 FINAL GATEWAY */}
      <section className="relative z-20 h-screen flex flex-col items-center justify-center text-center bg-black border-t border-white/5">
         <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter mb-12">REVEAL THE <br /> ARCHIVE.</h2>
         <Link href="/login" className="px-24 py-8 bg-white text-black font-black text-xl uppercase tracking-[0.5em] hover:bg-[#f21c43] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_80px_rgba(242,28,67,0.3)]">
            Members Only
         </Link>
         <p className="mt-20 text-[10px] text-gray-500 font-black tracking-widest uppercase">Verified Access Required for Purchase</p>
      </section>

      {/* Footer Design */}
      <footer className="relative z-30 py-20 px-12 border-t border-white/5 text-[9px] font-black tracking-[0.5em] text-gray-600 flex flex-col md:flex-row justify-between items-center gap-12 uppercase">
         <div className="flex gap-12">
            <span className="hover:text-white transition-colors">Mumbai</span>
            <span className="hover:text-white transition-colors">Digital Archive</span>
            <span className="hover:text-white transition-colors">Privileged Logistics</span>
         </div>
         <div className="text-[#f21c43]">© 2024 SMARTON WORLDWIDE</div>
         <div className="flex gap-12 text-right">
            <span>Atelier v.1.4</span>
            <span>Security AES-256</span>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes revealUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-reveal-up {
          animation: revealUp 1s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        
        @keyframes ticker {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
          white-space: nowrap;
          min-width: 100%;
        }
      `}</style>
    </div>
  );
}
