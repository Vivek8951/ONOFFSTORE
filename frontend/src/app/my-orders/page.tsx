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
    if (status === 'Delivered') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'Shipped') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'Accepted' || status === 'Processing') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (status === 'Cancelled') return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-gray-50 text-gray-400 border-gray-100';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans flex flex-col pt-32">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">MY ORDERS</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Track and manage your purchase history</p>
        </div>

        {/* Phone lookup form */}
        {!phone && (
          <form onSubmit={handleSearch} className="mb-12 bg-white border border-gray-100 rounded-3xl p-10 shadow-sm flex flex-col gap-6 max-w-md">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Enter your phone number to view orders</p>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              className="border-b-2 border-gray-100 py-3 text-lg font-bold outline-none focus:border-black tracking-widest"
              required
            />
            <button type="submit" className="bg-black text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-[#f21c43] transition-all rounded-xl">
              Find My Orders
            </button>
          </form>
        )}

        {phone && !isLoading && (
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Showing orders for {phone}</span>
            <button onClick={() => { setPhone(''); setOrders([]); localStorage.removeItem('userPhone'); }} className="text-[10px] font-black uppercase tracking-widest text-[#f21c43] underline">Change</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : searched && orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 p-20 text-center rounded-3xl">
            <p className="text-gray-400 font-black uppercase tracking-widest mb-8">No orders found for this number</p>
            <Link href="/shop" className="bg-black text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform inline-block rounded-xl">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex gap-6 items-start">
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-white rounded-full">{order.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{order.date}</span>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight mb-1">{order.item}</h3>
                      {order.size && <p className="text-xs font-bold text-gray-400 uppercase">Size: {order.size}</p>}
                      <p className="text-2xl font-black text-[#f21c43] mt-2">{order.total}</p>
                      {order.items?.length > 1 && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase">+{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                    <div className="flex flex-col md:items-end">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                      <span className={`text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-xl border-2 ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {order.trackingId && (
                      <div className="flex flex-col md:items-end">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Tracking</p>
                        <span className="text-xs font-bold text-gray-600">{order.courier} — {order.trackingId}</span>
                      </div>
                    )}

                    {order.address && (
                      <p className="text-[10px] text-gray-400 max-w-xs text-right hidden md:block">{order.address}</p>
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
