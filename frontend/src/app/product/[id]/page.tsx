'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useInventory } from '../../../hooks/useInventory';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();
  const { inventory, isReady } = useInventory();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white pt-40 flex items-center justify-center font-black tracking-[1em] text-[10px] uppercase animate-pulse">
        Initializing Atelier...
      </div>
    );
  }

  const product = inventory.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Object Not Found.</h1>
        <button onClick={() => router.push('/shop')} className="text-[10px] font-black uppercase tracking-[0.5em] border-b-2 border-black pb-1 hover:text-[#f21c43] hover:border-[#f21c43] transition-all">Back to Archive</button>
      </div>
    );
  }

  const images = [product.image, product.hoverImage || product.image, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];

  return (
    <div className="bg-white min-h-screen text-black font-sans selection:bg-[#f21c43] selection:text-white">
      <Navbar />

      <main className="flex flex-col lg:flex-row min-h-screen">
        
        {/* 🖼️ THE GALLERY (Left Scrollable) */}
        <section className="w-full lg:w-[65%] flex flex-col gap-2">
           {images.map((img, idx) => (
             <div key={idx} className="w-full h-screen sticky top-0 md:relative overflow-hidden group">
                <img 
                   src={img} 
                   className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                   alt={`${product.name} view ${idx}`} 
                />
                <div className="absolute top-12 left-12 text-[10rem] font-black text-white/10 tracking-tighter mix-blend-difference opacity-0 group-hover:opacity-100 transition-opacity">0{idx+1}</div>
             </div>
           ))}
        </section>

        {/* 📝 THE INTEL (Right Sticky) */}
        <section className="w-full lg:w-[35%] p-8 md:p-16 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center bg-white border-l border-gray-100 shadow-[-50px_0_100px_rgba(0,0,0,0.02)]">
           <div className="animate-fade-in-up">
              <span className="text-[10px] font-black text-[#f21c43] uppercase tracking-[0.5em] mb-4 block">Official Archive v.2.4</span>
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-[-0.05em] leading-[0.85] mb-8">
                {product.name}
              </h1>
              <div className="flex justify-between items-baseline mb-12">
                 <p className="text-4xl font-black tracking-tighter italic">₹{product.price}</p>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In Stock / Global Node</span>
              </div>

              <div className="space-y-12">
                 <p className="text-gray-400 text-sm md:text-base font-light italic leading-relaxed uppercase tracking-wide">
                    A limited-access garment engineered for the urban perimeter. Features high-grade finishing, precision tailoring, and authenticated branding. 
                 </p>

                 {/* Size Selector */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span>Select Dimension</span>
                       <span className="text-gray-400">View Sizing Matrix</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                       {sizes.map(size => (
                         <button 
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`py-4 border text-[10px] font-black transition-all ${selectedSize === size ? 'bg-black text-white border-black scale-105' : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'}`}
                         >
                            {size}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Master CTA */}
                 <button 
                    onClick={() => router.push('/cart')}
                    className="w-full py-8 bg-black text-white font-black text-xl uppercase tracking-[0.5em] hover:bg-[#f21c43] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                 >
                    {selectedSize ? `Secure Size ${selectedSize}` : 'Authorize Purchase'}
                 </button>

                 <div className="pt-8 border-t border-gray-50 flex justify-between items-center text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Authenticity: Guaranteed</span>
                    <span>Drop: Active Archive</span>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.19, 1, 0.22, 1) both;
        }
      `}</style>
    </div>
  );
}

