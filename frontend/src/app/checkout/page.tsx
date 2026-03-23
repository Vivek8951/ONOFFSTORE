'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();

export default function Checkout() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Initiating Atelier Protocol...');
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (isProcessing) {
      const t1 = setTimeout(() => setProcessingStep('Waking up Atelier Hub (Cold Start)...'), 4000);
      const t2 = setTimeout(() => setProcessingStep('Syncing Secure Archive...'), 12000);
      const t3 = setTimeout(() => setProcessingStep('Finalizing Commission...'), 25000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setProcessingStep('Initiating Atelier Protocol...');
    }
  }, [isProcessing]);

  useEffect(() => {
    const saved = localStorage.getItem('onoff_cart');
    if (saved) {
      try { setCartItems(JSON.parse(saved)); } catch {}
    }
    const profile = localStorage.getItem('onoff_user_profile');
    if (profile) {
      try {
        const u = JSON.parse(profile);
        setForm(f => ({
          ...f,
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
        }));
      } catch {}
    }
    const phone = localStorage.getItem('userPhone');
    if (phone) setForm(f => ({ ...f, phone }));
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.qty || 1)), 0);
  const totalAmount = subtotal - discount;

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.toUpperCase();
    if (code === 'OFFER10') {
      setDiscount(subtotal * 0.1);
      alert('Atelier Privilege Activated: 10% OFF');
    } else if (code === 'VIP20') {
      setDiscount(200);
      alert('Atelier Privilege Activated: ₹200 OFF');
    } else {
      setPromoError('Invalid Privilege Code');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Guard against rapid clicks

    if (!form.name || !form.email || !form.phone || !form.address) {
      setError('Atelier Protocol: All shipping coordinates required.'); return;
    }
    
    // Numeric Validation
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Atelier Protocol: Valid 10-digit phone required.'); return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const payload = {
        customerDetails: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: `${form.city}, ${form.address}`,
        },
        items: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          quantity: item.qty || 1,
          price: Number(item.price),
          size: item.size || 'M',
        })),
        totalAmount,
      };

      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try { 
        data = JSON.parse(text); 
      } catch (e) { 
        throw new Error('Signal Interrupted: Your commission was received by the Hub, but the connection timed out before the confirmation arrived. Please check "My Orders" in a moment.'); 
      }

      if (!res.ok) throw new Error(data.error || 'Atelier Protocol Rejected Order.');

      localStorage.setItem('userPhone', form.phone);
      localStorage.removeItem('onoff_cart');
      setCartItems([]);

      setOrderPlaced({
        id: `#${data.dbOrderId?.slice(-6).toUpperCase()}`,
        name: form.name,
        email: form.email,
        total: `₹${totalAmount.toLocaleString()}`,
      });

    } catch (err: any) {
      console.error('[ATELIER HUB ERROR]', err);
      setError(err.message || 'Signal Break: Connection to Atelier Hub failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--indian-cream)] font-sans flex flex-col selection:bg-[var(--indian-gold)] selection:text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-32">
          <div className="max-w-md w-full text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-[var(--indian-gold)]/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-[var(--indian-gold)]/20 shadow-xl">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--indian-gold)" strokeWidth="3" className="gold-glow"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p className="text-[10px] font-serif font-semibold uppercase tracking-[0.5em] text-[var(--indian-gold)] mb-4">Registry Confirmed</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--indian-maroon)] italic uppercase tracking-tighter mb-6">Gratitude, {orderPlaced.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 mb-12 text-sm">Commission <span className="font-serif font-bold tracking-widest text-[var(--indian-maroon)]">{orderPlaced.id}</span> is now archived in our secure registry.</p>
            <div className="flex flex-col gap-4">
              <Link href="/my-orders" className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-5 font-serif font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm shadow-xl">Track Commission</Link>
              <Link href="/shop" className="border border-[var(--indian-gold)]/30 text-[var(--indian-maroon)] py-5 font-serif font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm">Return to Archive</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] font-sans flex flex-col pt-28 selection:bg-[var(--indian-gold)] selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 animate-fade-in-up">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4 italic">Archive Secure Checkout</p>
              <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter leading-none uppercase">COMMISSION<span className="text-[var(--indian-maroon)] gold-glow uppercase"> HUB</span></h1>
           </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
            <div className="flex-1 flex flex-col gap-10">
              {/* Shipping Protocol */}
              <div className="bg-white p-8 md:p-12 rounded-[50px] border border-[var(--indian-gold)]/20 shadow-2xl animate-fade-in-up">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-10 pb-4 border-b border-[var(--indian-maroon)]/10">Shipping Protocol</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Recipient Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-3 px-4 text-sm font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Digital Address</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-3 px-4 text-sm font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Voice Link (10 Digits)</label>
                    <input type="tel" required maxLength={10} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-3 px-4 text-sm font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all tracking-[0.2em]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">City / Metropolis</label>
                    <input type="text" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-3 px-4 text-sm font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Atelier Dispatch Coordinates</label>
                    <input type="text" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-3 px-4 text-sm font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" />
                  </div>
                </div>
              </div>

              {/* Privilege Access */}
              <div className="bg-white p-8 md:p-12 rounded-[50px] border border-[var(--indian-gold)]/20 shadow-2xl animate-fade-in-up">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-6 pb-4 border-b border-[var(--indian-maroon)]/10">Privilege Access</h2>
                <div className="flex gap-4">
                  <input type="text" placeholder="Enter Privilege Code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 bg-gray-50/50 border border-gray-100 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--indian-gold)] transition-all" />
                  <button type="button" onClick={handleApplyPromo} className="bg-[var(--indian-midnight)] text-[var(--indian-gold)] px-10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-lg">Apply</button>
                </div>
                {promoError && <p className="text-red-500 text-[8px] mt-4 font-bold uppercase tracking-widest">{promoError}</p>}
                {discount > 0 && <p className="text-green-600 text-[8px] mt-4 font-bold uppercase tracking-widest">ATELIER PRIVILEGE APPLIED: -₹{discount.toLocaleString()}</p>}
              </div>

              {/* Payment Protocol Note */}
              <div className="bg-[var(--indian-midnight)] p-10 rounded-[40px] border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[var(--indian-gold)]/10 rounded-full flex items-center justify-center border border-[var(--indian-gold)]/20 shadow-inner">📦</div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--indian-gold)]">Commission Protocol</p>
                        <p className="text-[10px] text-white/40 italic mt-1">Confirmed instantly via Atelier High-Speed Hub.</p>
                      </div>
                   </div>
                   <div className="hidden md:block w-px h-12 bg-white/10"></div>
                   <p className="text-[8px] text-white/30 uppercase tracking-[0.3em] font-bold">Secure Global Bridge Active</p>
                </div>
              </div>

              {error && (
                 <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl animate-fade-in-up">
                    <p className="text-red-600 font-serif font-bold text-sm tracking-tight">{error}</p>
                 </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing} 
                className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-8 rounded-full font-serif font-bold uppercase text-[12px] md:text-[14px] tracking-[0.5em] hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-[0_20px_60px_rgba(128,0,0,0.3)] disabled:opacity-50 ring-2 ring-[var(--indian-gold)]/20"
              >
                {isProcessing ? processingStep : `Place Commission — ₹${totalAmount.toLocaleString()}`}
              </button>
            </div>

            {/* Archive Summary Widget */}
            <div className="w-full lg:w-96">
              <div className="bg-white p-10 md:p-12 rounded-[50px] border border-[var(--indian-gold)]/20 shadow-2xl sticky top-36 animate-fade-in-up">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-10 pb-4 border-b border-[var(--indian-maroon)]/10">Archive Summary</h2>
                <div className="flex flex-col gap-6 mb-10 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex gap-6 items-center group">
                      <div className="w-16 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:scale-110 transition-transform flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-serif font-bold text-[var(--indian-maroon)] italic leading-tight uppercase">{item.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mt-2">SZ {item.size || 'M'} × QTY {item.qty || 1}</p>
                        <p className="text-sm font-serif font-bold text-[var(--indian-maroon)] mt-1">₹{Number(item.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-8 space-y-4">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-40"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600"><span>Privilege</span><span>-₹{discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-40"><span>Dispatch</span><span>FREE</span></div>
                  <div className="flex justify-between border-t border-gray-100 pt-6 mt-6">
                    <span className="text-[12px] font-bold uppercase tracking-[0.4em] opacity-30 mt-2">Total Total</span>
                    <span className="text-3xl font-serif font-bold italic text-[var(--indian-maroon)] gold-glow">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
