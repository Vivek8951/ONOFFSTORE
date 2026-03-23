'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();

export default function Checkout() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Atelier Protocol Initiated');
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (isProcessing) {
      const t1 = setTimeout(() => setProcessingStep('Syncing with Mumbai Hub...'), 3500);
      const t2 = setTimeout(() => setProcessingStep('Waiting for Atelier Cloud (10s)...'), 8000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setProcessingStep('Atelier Protocol Initiated');
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
    if (promoCode === 'OFFER10') {
      setDiscount(subtotal * 0.1);
      alert('Atelier Privilege Activated: 10% OFF');
    } else if (promoCode === 'VIP20') {
      setDiscount(200);
      alert('Atelier Privilege Activated: ₹200 OFF');
    } else {
      setPromoError('Invalid Privilege Code');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address) {
      setError('Please fill in all fields.'); return;
    }
    setError('');
    setIsProcessing(true);

    try {
      const payload = {
        customerDetails: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } 
      catch (e) { throw new Error('Atelier Hub did not return a valid server signal.'); }

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
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-50/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-200">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p className="text-[10px] font-serif font-semibold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-3">Order Confirmed</p>
            <h1 className="text-4xl font-serif font-semibold text-[var(--indian-maroon)] italic uppercase tracking-tight mb-4">Success, {orderPlaced.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 mb-10">Commission <span className="font-serif font-semibold tracking-wider text-[var(--indian-maroon)]">{orderPlaced.id}</span> is now active.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-orders" className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-8 py-5 font-serif font-semibold uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm">Track My Order</Link>
              <Link href="/shop" className="border border-[var(--indian-gold)]/40 text-[var(--indian-maroon)] bg-[var(--indian-cream)] px-8 py-5 font-serif font-semibold uppercase tracking-[0.2em] text-[10px] hover:border-[var(--indian-gold)] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm">Continue Shopping</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] font-sans flex flex-col pt-28 selection:bg-[var(--indian-gold)] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-8 py-10">
        <h1 className="text-4xl font-serif font-semibold italic text-[var(--indian-maroon)] uppercase tracking-tight mb-10">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 flex flex-col gap-8">
              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl animate-fade-in-up">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-6 pb-4 border-b border-[var(--indian-gold)]/20">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border border-gray-100 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors" />
                  <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border border-gray-100 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors" />
                  <input type="tel" placeholder="Phone" required maxLength={10} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border border-gray-100 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors" />
                  <input type="text" placeholder="City / State" required className="border border-gray-100 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors" />
                  <input type="text" placeholder="Shipping Address" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="border border-gray-100 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors md:col-span-2" />
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl animate-fade-in-up">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-4 pb-4 border-b border-[var(--indian-gold)]/20">Privilege Access</h2>
                <div className="flex gap-4">
                  <input type="text" placeholder="Enter Privilege Code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 border border-gray-100 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)]" />
                  <button type="button" onClick={handleApplyPromo} className="bg-[var(--indian-midnight)] text-[var(--indian-gold)] px-8 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--indian-gold)] hover:text-white transition-all">Apply</button>
                </div>
                {promoError && <p className="text-red-500 text-[9px] mt-2 font-bold uppercase tracking-widest">{promoError}</p>}
                {discount > 0 && <p className="text-green-600 text-[9px] mt-2 font-bold uppercase tracking-widest">Atelier Privilege Applied: -₹{discount.toLocaleString()}</p>}
              </div>

              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl animate-fade-in-up">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-4 pb-4 border-b border-[var(--indian-gold)]/20">Payment Protocol</h2>
                <div className="flex items-center gap-4 p-4 bg-[var(--indian-cream)]/50 rounded-xl border border-[var(--indian-gold)]/30">
                  <div className="w-10 h-10 bg-[var(--indian-maroon)]/10 rounded-full flex items-center justify-center grow-0 shrink-0">📦</div>
                  <div>
                    <p className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest">Handmade Commission Dispatch</p>
                    <p className="text-xs text-gray-500 mt-1 italic font-serif">Order will be confirmed via Atelier Protocol immediately.</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 font-serif font-bold text-sm">{error}</p>}

              <button type="submit" disabled={isProcessing} className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-sm font-serif font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-xl disabled:opacity-50">
                {isProcessing ? processingStep : `Place Commission — ₹${totalAmount.toLocaleString()}`}
              </button>
            </div>

            <div className="w-full lg:w-80">
              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl sticky top-36 animate-fade-in-up">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-6 pb-4 border-b border-[var(--indian-gold)]/20">Archive Summary</h2>
                {cartItems.map((item, i) => (
                  <div key={i} className="flex gap-4 mb-4">
                    <img src={item.image} className="w-12 h-16 object-cover rounded-md border border-gray-100" />
                    <div className="flex-1">
                      <p className="text-[10px] font-serif font-bold text-[var(--indian-maroon)] italic leading-tight">{item.name}</p>
                      <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Size {item.size || 'M'} × {item.qty || 1}</p>
                      <p className="text-xs font-serif font-bold text-[var(--indian-maroon)] mt-1">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-6 space-y-3">
                  <div className="flex justify-between text-[10px] font-serif uppercase tracking-widest opacity-60"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-[10px] font-serif uppercase tracking-widest text-green-600"><span>Privilege</span><span>-₹{discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-[10px] font-serif uppercase tracking-widest opacity-60"><span>Dispatch</span><span>FREE</span></div>
                  <div className="flex justify-between border-t border-gray-100 pt-3 mt-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">Total</span>
                    <span className="text-xl font-serif font-bold italic text-[var(--indian-maroon)]">₹{totalAmount.toLocaleString()}</span>
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
