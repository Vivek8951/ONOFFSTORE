'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function Cart() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('onoff_cart');
    if (saved) {
      try { setCartItems(JSON.parse(saved)); } catch {}
    }
    setIsLoaded(true);
  }, []);

  const updateQty = (idx: number, delta: number) => {
    const newCart = [...cartItems];
    newCart[idx].qty += delta;
    if (newCart[idx].qty < 1) newCart[idx].qty = 1;
    setCartItems(newCart);
    localStorage.setItem('onoff_cart', JSON.stringify(newCart));
  };

  const removeItem = (idx: number) => {
    const newCart = cartItems.filter((_, i) => i !== idx);
    setCartItems(newCart);
    localStorage.setItem('onoff_cart', JSON.stringify(newCart));
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.qty || 1)), 0);

  if (!isLoaded) return <div className="min-h-screen bg-[var(--indian-cream)]"></div>;

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-[var(--indian-cream)] min-h-screen font-sans selection:bg-[var(--indian-gold)] selection:text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 mt-12">
        
        {/* Cart Items (Left) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-[var(--indian-maroon)]/20 pb-4">
            <h1 className="text-4xl font-serif font-semibold text-[var(--indian-maroon)] italic tracking-wide">BAG ({cartItems.length})</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
               <p className="text-[10px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]">Your bag is empty.</p>
               <Link href="/shop" className="text-[12px] font-serif font-semibold text-[var(--indian-maroon)] italic underline hover:text-[var(--indian-gold)] transition-colors">Return to Atelier</Link>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${idx}`} className="flex gap-6 py-6 border-b border-[var(--indian-maroon)]/10">
                <img src={item.image || 'https://images.unsplash.com/photo-1583391733958-d25e07fac66a?w=400&auto=format&fit=crop'} alt={item.name} className="w-24 h-32 md:w-32 md:h-44 object-cover border border-[var(--indian-gold)]/20 rounded-md shadow-sm" />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-serif font-semibold text-[var(--indian-maroon)] italic tracking-wide leading-tight">{item.name}</h3>
                      <p className="text-[10px] font-serif font-semibold uppercase tracking-widest text-gray-500 mt-1">Size: {item.size}</p>
                    </div>
                    <span className="font-serif font-semibold text-lg md:text-xl text-[var(--indian-maroon)]">₹{Number(item.price).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-4 border border-[var(--indian-gold)]/30 bg-white w-max px-3 py-1 md:px-4 md:py-2 rounded-sm shadow-sm">
                      <button onClick={() => updateQty(idx, -1)} className="text-xl font-light hover:text-[var(--indian-gold)] transition-colors">−</button>
                      <span className="text-sm font-serif font-semibold text-[var(--indian-maroon)] px-2">{item.qty || 1}</span>
                      <button onClick={() => updateQty(idx, 1)} className="text-xl font-light hover:text-[var(--indian-gold)] transition-colors">+</button>
                    </div>
                    <button onClick={() => removeItem(idx)} className="text-[9px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest bg-[var(--indian-maroon)]/5 hover:bg-[var(--indian-gold)]/20 px-4 py-2 rounded-sm transition-all shadow-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary (Right) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-32 lg:h-max bg-white p-8 border border-[var(--indian-gold)]/20 shadow-xl rounded-2xl">
          <h2 className="text-2xl font-serif font-semibold italic uppercase tracking-widest text-[var(--indian-maroon)] border-b border-[var(--indian-gold)]/20 pb-4">Order Summary</h2>
          
          <div className="flex flex-col gap-4 text-[10px] font-serif font-semibold uppercase tracking-widest mt-4 text-gray-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[var(--indian-maroon)]">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-[var(--indian-gold)]">Complimentary</span>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-[var(--indian-maroon)]/10 pt-4 mt-2">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-widest text-gray-400">Total</span>
            <span className="text-3xl font-serif font-semibold text-[var(--indian-maroon)] italic">₹{totalAmount.toLocaleString()}</span>
          </div>

          <Link href="/checkout" className={`w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-5 rounded-sm font-serif font-semibold uppercase tracking-[0.3em] text-[10px] text-center mt-4 transition-all shadow-md ${cartItems.length === 0 ? 'opacity-50 pointer-events-none' : 'hover:bg-[var(--indian-gold)] hover:text-white'}`}>
            Proceed to Checkout
          </Link>
          
          <p className="text-[8px] font-sans uppercase text-center text-gray-400 mt-2 tracking-widest border border-dashed border-gray-200 p-2 opacity-60">Secure SSL Encrypted Checkout</p>
        </div>
      </div>
    </div>
  );
}
