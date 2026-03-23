'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Try auto-load from localStorage (if user logged in via mobile OTP on frontend)
  useEffect(() => {
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
      setPhone(savedPhone);
      fetchOrders(savedPhone);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = async (ph: string) => {
    setIsLoading(true);
    try {
      // Fetch ALL orders and filter by phone on client side
      // (since backend doesn't have phone-filtered endpoint yet)
      const res = await fetch(`${API_URL}/api/orders/admin/all`);
      const data = await res.json();
      const mine = data.filter((o: any) =>
        o.customerDetails?.phone === ph ||
        o.customerDetails?.phone?.replace(/\D/g, '') === ph.replace(/\D/g, '')
      );
      setOrders(mine.map((o: any) => ({
        id: `#${o._id.slice(-6).toUpperCase()}`,
        _id: o._id,
        item: o.items?.[0]?.name || 'Archive Item',
        size: o.items?.[0]?.size || '',
        total: `₹${o.totalAmount?.toLocaleString()}`,
        status: o.orderStatus || 'Pending',
        date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        courier: o.shippingDetails?.courier,
        trackingId: o.shippingDetails?.trackingId,
        address: o.customerDetails?.address,
        email: o.customerDetails?.email,
        items: o.items || [],
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setSearched(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    localStorage.setItem('userPhone', phoneInput.trim());
    setPhone(phoneInput.trim());
    fetchOrders(phoneInput.trim());
  };

  const statusColor = (status: string) => {
    if (status === 'Delivered') return 'bg-green-50/50 text-green-800 border-green-200 font-serif font-semibold';
    if (status === 'Shipped') return 'bg-[#1a2f4c]/10 text-[#1a2f4c] border-[#1a2f4c]/20 font-serif font-semibold';
    if (status === 'Accepted' || status === 'Processing') return 'bg-[var(--indian-gold)]/10 text-[var(--indian-maroon)] border-[var(--indian-gold)]/30 font-serif font-semibold';
    if (status === 'Cancelled') return 'bg-red-50 text-red-600 border-red-200 font-serif font-semibold';
    return 'bg-[var(--indian-cream)] text-gray-500 border-gray-200 font-serif font-semibold';
  };

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans flex flex-col pt-32 selection:bg-[var(--indian-gold)] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-semibold text-[var(--indian-maroon)] uppercase tracking-tighter italic mb-4">MY ORDERS</h1>
          <p className="text-[10px] font-serif font-semibold uppercase tracking-[0.3em] text-[var(--indian-maroon)]/60">Track and manage your purchase history</p>
        </div>

        {/* Phone lookup form */}
        {!phone && (
          <form onSubmit={handleSearch} className="mb-12 bg-white border border-[var(--indian-gold)]/20 rounded-[30px] p-10 shadow-xl flex flex-col gap-6 max-w-md">
            <p className="text-[10px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]/80">Enter your phone number to view orders</p>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              className="border-b-2 border-gray-100 py-3 text-lg font-serif font-semibold outline-none focus:border-[var(--indian-maroon)] tracking-widest"
              required
            />
            <button type="submit" className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-5 font-serif font-semibold uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-sm">
              Find My Orders
            </button>
          </form>
        )}

        {phone && !isLoading && (
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]/80">Showing orders for {phone}</span>
            <button onClick={() => { setPhone(''); setOrders([]); localStorage.removeItem('userPhone'); }} className="text-[10px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)] border-b border-[var(--indian-maroon)] hover:text-[var(--indian-gold)] hover:border-[var(--indian-gold)] transition-all">Change</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : searched && orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[var(--indian-gold)]/30 p-20 text-center rounded-[30px] shadow-sm">
            <p className="text-[var(--indian-maroon)]/50 font-serif font-semibold uppercase tracking-widest mb-8 text-[11px]">No orders found for this number</p>
            <Link href="/shop" className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-10 py-5 font-serif font-semibold tracking-[0.2em] text-[10px] hover:scale-105 transition-transform inline-block rounded-sm uppercase shadow-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="bg-white border border-[var(--indian-gold)]/20 rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[var(--indian-maroon)]/30 transition-all group cursor-pointer"
              >
                <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex gap-6 items-start">
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-[9px] font-serif font-semibold uppercase tracking-widest px-3 py-1 bg-[var(--indian-maroon)] text-[var(--indian-gold)] rounded-sm border border-[var(--indian-gold)]/30 shadow-sm">{order.id}</span>
                        <span className="text-[9px] font-serif font-semibold uppercase tracking-widest text-gray-400 italic">{order.date}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-semibold italic uppercase tracking-wide text-[var(--indian-maroon)] mb-1 leading-none">{order.item}</h3>
                      {order.size && <p className="text-[10px] font-serif font-semibold text-gray-500 uppercase tracking-widest mt-1">Size: {order.size}</p>}
                      <p className="text-2xl font-serif font-semibold text-[var(--indian-maroon)] mt-3 italic">₹{(parseInt(order.total.replace(/[^0-9]/g, ""))||0).toLocaleString()}</p>
                      {order.items?.length > 1 && (
                        <p className="text-[9px] font-serif font-semibold text-gray-400 uppercase tracking-widest mt-1">+{order.items.length - 1} accessory items embedded</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-5 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-[var(--indian-gold)]/20">
                    <div className="flex flex-col items-start md:items-end w-full">
                      <p className="text-[9px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]/60 mb-2">Order Status</p>
                      <span className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-sm border ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    {order.trackingId && (
                      <div className="flex flex-col md:items-end w-full">
                        <span className="text-[10px] border-b border-[var(--indian-maroon)]/30 text-[var(--indian-maroon)] tracking-widest font-mono hover:bg-[var(--indian-gold)]/20">Track: {order.trackingId}</span>
                      </div>
                    )}
                    <p className="text-[9px] font-serif italic text-[var(--indian-maroon)] group-hover:text-[var(--indian-gold)] transition-colors mt-2 underline">Click to explicitly view order timeline</p>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                <div className={`border-t border-[var(--indian-gold)]/20 px-8 md:px-10 bg-[var(--indian-cream)]/30 transition-all duration-500 overflow-hidden ${expandedOrderId === order.id ? 'max-h-[1000px] opacity-100 py-8' : 'max-h-0 opacity-0 py-0'}`}>
                   <h4 className="text-[11px] font-serif font-semibold uppercase tracking-[0.2em] text-[var(--indian-maroon)] border-b border-[var(--indian-maroon)]/20 pb-3 mb-6">Status Log</h4>
                   
                   <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative mb-8">
                     <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[var(--indian-gold)]/30 hidden md:block -z-10"></div>
                     {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                       const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                       const currentIdx = statuses.indexOf(order.status === 'Accepted' ? 'Processing' : order.status);
                       const isPast = idx <= currentIdx;
                       const isCurrent = idx === currentIdx;
                       const isCancelled = order.status === 'Cancelled';
                       return (
                         <div key={step} className={`flex flex-col items-center gap-2 bg-[var(--indian-cream)] px-2 z-10 ${isCancelled ? 'opacity-30 grayscale' : (isPast ? 'opacity-100' : 'opacity-40')}`}>
                           <div className={`w-4 h-4 rounded-full border-2 ${isCurrent && !isCancelled ? 'border-[var(--indian-maroon)] bg-[var(--indian-gold)] scale-150' : (isPast && !isCancelled ? 'bg-[var(--indian-maroon)] border-[var(--indian-maroon)]' : 'border-gray-300 bg-white')}`} />
                           <span className={`text-[9px] font-serif font-semibold uppercase tracking-widest ${isCurrent && !isCancelled ? 'text-[var(--indian-maroon)]' : 'text-gray-500'}`}>{step}</span>
                         </div>
                       );
                     })}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm mt-8 border-t border-[var(--indian-maroon)]/10 pt-8">
                      <div>
                         <p className="text-[9px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]/60 mb-2">Delivery Destination</p>
                         <p className="text-xs font-serif font-semibold italic text-[var(--indian-maroon)] leading-relaxed max-w-sm">{order.address}</p>
                         <p className="text-xs font-sans mt-2">{order.email}</p>
                      </div>
                      {order.trackingId && (
                        <div>
                          <p className="text-[9px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]/60 mb-2">Logistics Routing</p>
                          <div className="bg-white border border-[var(--indian-gold)]/30 p-5 rounded-sm mt-2">
                             <div className="flex justify-between items-center mb-3">
                               <span className="text-[12px] font-serif font-semibold text-[var(--indian-maroon)] italic">{order.courier}</span>
                               <a href={"https://www.google.com/search?q=track+" + order.trackingId} target="_blank" rel="noreferrer" className="text-[9px] font-serif font-semibold text-[var(--indian-gold)] uppercase tracking-widest underline">Auto Track</a>
                             </div>
                             <span className="text-sm border-b border-[var(--indian-maroon)]/30 text-[var(--indian-maroon)] tracking-widest font-mono select-all pt-1 block">{order.trackingId}</span>
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
