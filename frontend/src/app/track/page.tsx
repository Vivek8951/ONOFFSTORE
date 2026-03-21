'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useOrders } from '../../hooks/useOrders';

export default function TrackOrder() {
  const { orders, isReady } = useOrders();
  const [orderInput, setOrderInput] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderFromUrl = params.get('order');
    if (orderFromUrl && isReady) {
      setOrderInput(orderFromUrl);
      // Manually trigger the lookup logic
      setTimeout(() => {
        const foundOrder = orders.find(o => o.id.toUpperCase() === orderFromUrl.toUpperCase());
        if (foundOrder) {
          const statusMap = { 'Pending': 0, 'Accepted': 1, 'Processing': 2, 'Shipped': 3, 'Delivered': 4 };
          const currentIdx = statusMap[foundOrder.status as keyof typeof statusMap] || 0;
          const steps = [
            { status: 'Order Placed', location: 'Website', completed: true, date: foundOrder.date },
            { status: 'Order Accepted', location: 'Warehouse', completed: currentIdx >= 1, active: currentIdx === 1, date: currentIdx >= 1 ? 'Updated' : '-' },
            { status: 'Courier Assigned', location: foundOrder.courier || 'Pending', completed: currentIdx >= 2, active: currentIdx === 2, date: currentIdx >= 2 ? 'Processed' : '-' },
            { status: 'Dispatched to Hub', location: foundOrder.trackingId ? `ID: ${foundOrder.trackingId}` : 'Sorting Center', completed: currentIdx >= 3, active: currentIdx === 3, date: currentIdx >= 3 ? 'In Transit' : '-' },
            { status: 'Delivered', location: 'Final Destination', completed: currentIdx === 4, active: false, date: currentIdx === 4 ? 'Received' : '-' },
          ];
          setTrackingData({ orderNumber: foundOrder.id, courier: foundOrder.courier || 'Searching...', awb: foundOrder.trackingId || 'Allocating...', status: foundOrder.status, steps: steps });
        }
      }, 500);
    }
  }, [isReady, orders]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderInput) return;
    setError('');

    setLoading(true);
    setTrackingData(null);

    // Simulated lookup delay
    setTimeout(() => {
      setLoading(false);
      
      const foundOrder = orders.find(o => o.id.toUpperCase() === orderInput.toUpperCase());
      
      if (!foundOrder) {
        setError('Order not found. Please check your ID and try again.');
        return;
      }

      // Map Admin Status to Timeline Steps
      const statusMap = {
        'Pending': 0,
        'Accepted': 1,
        'Processing': 2,
        'Shipped': 3,
        'Delivered': 4
      };

      const currentIdx = statusMap[foundOrder.status as keyof typeof statusMap] || 0;

      const steps = [
        { status: 'Order Placed', location: 'Website', completed: true, date: foundOrder.date },
        { status: 'Order Accepted', location: 'Warehouse', completed: currentIdx >= 1, active: currentIdx === 1, date: currentIdx >= 1 ? 'Updated just now' : '-' },
        { status: 'Courier Assigned', location: foundOrder.courier || 'Pending', completed: currentIdx >= 2, active: currentIdx === 2, date: currentIdx >= 2 ? 'Processed' : '-' },
        { status: 'Dispatched to Hub', location: foundOrder.trackingId ? `ID: ${foundOrder.trackingId}` : 'Sorting Center', completed: currentIdx >= 3, active: currentIdx === 3, date: currentIdx >= 3 ? 'In Transit' : '-' },
        { status: 'Delivered', location: 'Final Destination', completed: currentIdx === 4, active: false, date: currentIdx === 4 ? 'Signature Received' : '-' },
      ];

      setTrackingData({
        orderNumber: foundOrder.id,
        courier: foundOrder.courier || 'Awaiting Assignment',
        awb: foundOrder.trackingId || 'Pending Allocation',
        status: foundOrder.status,
        steps: steps
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-12 pt-32 pb-24">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-[0.2em] mb-4 italic">
            TRACK SHIPMENT
          </h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 max-w-md mx-auto bg-white px-4 py-2 border inline-block">
            Enter your Order ID (e.g. ONOFF-1234) for live logistics updates
          </p>
        </div>

        {/* Tracking Input Form */}
        <div className="max-w-xl mx-auto bg-white p-8 shadow-xl border border-gray-100 relative z-10 rounded-2xl">
          <form onSubmit={handleTrackSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">Order Reference Number</label>
              <input 
                type="text" 
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="ONOFF-XXXX" 
                className="border-b-2 border-gray-100 py-4 font-black text-2xl tracking-widest uppercase outline-none focus:border-black transition-colors bg-transparent placeholder:text-gray-200"
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">
                ⚠️ {error}
              </p>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 bg-black text-white w-full py-5 text-xs font-black uppercase tracking-[0.3em] hover:bg-[#f21c43] transition-all disabled:opacity-50 shadow-lg active:scale-95"
            >
              {loading ? 'Locating Package...' : 'Track My Order'}
            </button>
          </form>
        </div>

        {/* Live Timeline Display */}
        {trackingData && (
          <div className="max-w-xl mx-auto mt-16 animate-fade-in-up">
            <div className="mb-12 border-b border-gray-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-2xl shadow-sm">
              <div className="space-y-4">
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1 font-black">Shipment ID</h2>
                  <h3 className="text-3xl font-black text-black tracking-tighter uppercase">{trackingData.orderNumber}</h3>
                </div>
                <div>
                  <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1 font-black">Carrier Service</h2>
                  <p className="text-sm font-black text-gray-800 uppercase tracking-widest">{trackingData.courier}</p>
                </div>
              </div>
              <div className="md:text-right space-y-4 w-full md:w-auto">
                <div className="bg-black text-white p-4 rounded-xl">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-black mb-1">Tracking Number</p>
                  <p className="text-sm font-black tracking-widest">{trackingData.awb || 'ASSIGNING...'}</p>
                </div>
              </div>
            </div>

            {/* Timelines */}
            <div className="relative border-l-2 border-gray-100 ml-6 space-y-12 pl-10 py-4">
              {trackingData.steps.map((step: any, index: number) => (
                <div key={index} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[51px] w-5 h-5 rounded-full border-4 border-[#faf9f6] z-10 transition-all duration-500 ${
                    step.active ? 'bg-[#f21c43] scale-150 shadow-[0_0_15px_rgba(242,28,67,0.5)]' : step.completed ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                  
                  {/* Step Content */}
                  <div className={`flex flex-col gap-1 transition-opacity duration-500 ${!step.completed && !step.active ? 'opacity-30' : 'opacity-100'}`}>
                    <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-3">
                      {step.status}
                      {step.active && <span className="text-[8px] bg-[#f21c43] text-white px-2 py-0.5 rounded-full animate-pulse">Tracking Live</span>}
                    </h4>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{step.location}</span>
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{step.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20 text-center border-t border-gray-100 pt-8">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">End-to-End Real-time Shipment Tracking powered by ONOFF Direct</p>
               <Link href="/shop" className="inline-block mt-8 text-[11px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-[#f21c43] hover:border-[#f21c43] transition-all">Continue Shopping</Link>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
