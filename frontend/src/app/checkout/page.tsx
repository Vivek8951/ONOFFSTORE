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
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [error, setError] = useState('');

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onoff_cart');
    if (saved) {
      try { setCartItems(JSON.parse(saved)); } catch {}
    }
    // Pre-fill from user profile if logged in
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
    // Save phone for My Orders lookup
    const phone = localStorage.getItem('userPhone');
    if (phone) setForm(f => ({ ...f, phone }));
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.qty || 1)), 0);

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

      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Order creation failed');

      // Save phone so My Orders can look up their orders
      localStorage.setItem('userPhone', form.phone);

      // Mark payment as verified (demo — in production Razorpay webhook does this)
      await fetch(`${API_URL}/api/orders/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: data.razorpayOrder?.id || 'demo_' + Date.now(),
          razorpay_payment_id: 'pay_demo_' + Date.now(),
        }),
      });

      // Clear cart
      localStorage.removeItem('onoff_cart');
      setCartItems([]);

      setOrderPlaced({
        id: `#${data.dbOrderId?.slice(-6).toUpperCase()}`,
        name: form.name,
        email: form.email,
        total: `₹${totalAmount.toLocaleString()}`,
      });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-[10px] font-serif font-semibold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-3">Order Confirmed</p>
            <h1 className="text-4xl font-serif font-semibold text-[var(--indian-maroon)] italic uppercase tracking-tight mb-4">Thank You, {orderPlaced.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 mb-2">Order <span className="font-serif font-semibold tracking-wider text-[var(--indian-maroon)]">{orderPlaced.id}</span> has been placed successfully.</p>
            <p className="text-gray-500 mb-10 text-[10px] font-serif uppercase tracking-widest">A confirmation email has been sent to <strong>{orderPlaced.email}</strong></p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-orders" className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-8 py-5 font-serif font-semibold uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm">
                Track My Order
              </Link>
              <Link href="/shop" className="border border-[var(--indian-gold)]/40 text-[var(--indian-maroon)] bg-[var(--indian-cream)] px-8 py-5 font-serif font-semibold uppercase tracking-[0.2em] text-[10px] hover:border-[var(--indian-gold)] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm shadow-sm">
                Continue Shopping
              </Link>
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
            {/* Left — Customer Details */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Shipping */}
              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-6 pb-4 border-b border-[var(--indian-gold)]/20">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Full Name" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="border border-gray-200 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors"
                  />
                  <input
                    type="email" placeholder="Email Address" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="border border-gray-200 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors"
                  />
                  <input
                    type="tel" placeholder="Phone Number (10 digits)" required maxLength={10}
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="border border-gray-200 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors"
                  />
                  <input
                    type="text" placeholder="City / State" required
                    className="border border-gray-200 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors"
                  />
                  <input
                    type="text" placeholder="Full Shipping Address" required
                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="border border-gray-200 rounded-sm p-4 text-sm font-medium outline-none focus:border-[var(--indian-maroon)] transition-colors md:col-span-2"
                  />
                </div>
              </div>

              {/* Payment Note */}
              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-4 pb-4 border-b border-[var(--indian-gold)]/20">Payment</h2>
                <div className="flex items-center gap-4 p-4 bg-[var(--indian-cream)]/50 rounded-xl border border-[var(--indian-gold)]/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--indian-maroon)" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  <div>
                    <p className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest">Cash on Delivery / Demo Payment</p>
                    <p className="text-xs text-gray-500 mt-1 italic font-serif">Razorpay integration active. Order will be confirmed immediately.</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-[var(--indian-maroon)] font-serif font-semibold text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] font-serif font-semibold text-xs py-5 uppercase tracking-[0.2em] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm disabled:opacity-60 flex items-center justify-center gap-3 shadow-md"
              >
                {isProcessing ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing Order...</>
                ) : `Place Order — ₹${totalAmount.toLocaleString()}`}
              </button>
            </div>

            {/* Right — Order Summary */}
            <div className="w-full lg:w-80">
              <div className="bg-white p-8 rounded-2xl border border-[var(--indian-gold)]/20 shadow-xl sticky top-36">
                <h2 className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest mb-6 pb-4 border-b border-[var(--indian-gold)]/20">Order Summary</h2>

                {cartItems.length > 0 ? (
                  <div className="flex flex-col gap-4 mb-6">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-18 object-cover rounded-md border border-[var(--indian-gold)]/30" />
                        <div className="flex-1">
                          <p className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] italic leading-tight">{item.name}</p>
                          <p className="text-[9px] font-serif uppercase tracking-widest text-gray-400">Size: {item.size || 'M'} × {item.qty || 1}</p>
                          <p className="text-sm font-serif font-semibold text-[var(--indian-maroon)] mt-1">₹{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-6 items-center justify-center opacity-70 py-6 text-center">
                     <p className="text-[10px] font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-widest">Cart is empty</p>
                  </div>
                )}

                <div className="border-t border-[var(--indian-gold)]/20 pt-4 flex flex-col gap-2 text-[10px] font-serif uppercase tracking-widest">
                  <div className="flex justify-between"><span className="text-[var(--indian-maroon)]/60 font-semibold">Subtotal</span><span className="font-semibold text-[var(--indian-maroon)]">₹{totalAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--indian-maroon)]/60 font-semibold">Shipping</span><span className="font-semibold text-[var(--indian-maroon)]">FREE</span></div>
                  <div className="flex justify-between pt-3 border-t border-[var(--indian-gold)]/20 text-base mt-2">
                    <span className="font-serif font-semibold text-[10px] uppercase text-gray-500 tracking-widest mt-1">Total</span>
                    <span className="font-serif font-semibold text-xl text-[var(--indian-maroon)] italic">₹{totalAmount.toLocaleString()}</span>
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
