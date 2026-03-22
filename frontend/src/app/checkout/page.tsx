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

  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.qty || 1)), 0) || 16998;

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
        items: cartItems.length > 0 ? cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          quantity: item.qty || 1,
          price: Number(item.price),
          size: item.size || 'M',
        })) : [
          { name: 'Oversized Parachute Cargo', quantity: 1, price: 8499 },
          { name: 'Essential Utility Jacket', quantity: 1, price: 8499 },
        ],
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
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-32">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-100">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f21c43] mb-3">Order Confirmed</p>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Thank You, {orderPlaced.name.split(' ')[0]}!</h1>
            <p className="text-gray-500 mb-2">Order <span className="font-black text-black">{orderPlaced.id}</span> has been placed successfully.</p>
            <p className="text-gray-500 mb-10 text-sm">A confirmation email has been sent to <strong>{orderPlaced.email}</strong></p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-orders" className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-[#f21c43] transition-all rounded-xl">
                Track My Order
              </Link>
              <Link href="/shop" className="border-2 border-black text-black px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all rounded-xl">
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
    <div className="min-h-screen bg-[#fafafa] font-sans flex flex-col pt-28">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-8 py-10">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-10">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left — Customer Details */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Shipping */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" placeholder="Full Name" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="email" placeholder="Email Address" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="tel" placeholder="Phone Number (10 digits)" required maxLength={10}
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="text" placeholder="City / State" required
                    className="border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-black transition-colors"
                  />
                  <input
                    type="text" placeholder="Full Shipping Address" required
                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="border border-gray-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-black transition-colors md:col-span-2"
                  />
                </div>
              </div>

              {/* Payment Note */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest mb-4 pb-4 border-b border-gray-100">Payment</h2>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f21c43" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  <div>
                    <p className="text-sm font-black uppercase">Cash on Delivery / Demo Payment</p>
                    <p className="text-xs text-gray-400 mt-1">Razorpay integration active. Order will be confirmed immediately.</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-[#f21c43] font-bold text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-black text-white font-black text-base py-5 uppercase tracking-widest hover:bg-[#f21c43] transition-all rounded-2xl disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing Order...</>
                ) : `Place Order — ₹${totalAmount.toLocaleString()}`}
              </button>
            </div>

            {/* Right — Order Summary */}
            <div className="w-full lg:w-80">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-36">
                <h2 className="text-sm font-black uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">Order Summary</h2>

                {cartItems.length > 0 ? (
                  <div className="flex flex-col gap-4 mb-6">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-18 object-cover rounded-xl border border-gray-100" />
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400">Size: {item.size || 'M'} × {item.qty || 1}</p>
                          <p className="text-sm font-black text-[#f21c43] mt-1">₹{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-6">
                    {[
                      { name: 'Oversized Parachute Cargo', price: '₹8,499', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200' },
                      { name: 'Essential Utility Jacket', price: '₹8,499', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200' },
                    ].map(item => (
                      <div key={item.name} className="flex gap-3 items-center">
                        <img src={item.img} alt={item.name} className="w-14 object-cover rounded-xl border border-gray-100 aspect-square" />
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-tight">{item.name}</p>
                          <p className="text-sm font-black text-[#f21c43] mt-1">{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{totalAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="font-bold text-green-600">FREE</span></div>
                  <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
                    <span className="font-black uppercase">Total</span>
                    <span className="font-black text-[#f21c43]">₹{totalAmount.toLocaleString()}</span>
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
