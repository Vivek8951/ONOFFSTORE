'use client';

import { useOrders, Order } from '../../hooks/useOrders';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function MyOrders() {
  const { orders, isReady } = useOrders();

  // For demo: Only show orders for "John Doe" (simulated logged-in user)
  const myOrders = orders.filter(o => o.user === 'John Doe');

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans flex flex-col pt-32">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">PURCHASE HISTORY</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">View and track all your luxury orders</p>
        </div>

        {!isReady ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 p-20 text-center rounded-3xl">
             <p className="text-gray-400 font-black uppercase tracking-widest mb-8">No orders found in your history</p>
             <Link href="/shop" className="bg-black text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  {/* Item Image Placeholder / Info */}
                  <div className="flex gap-6 items-center">
                    <div className="w-24 h-32 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden shrink-0">
                       <img 
                         src="https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=400" 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                         alt="Order Item" 
                       />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-white rounded-full">{order.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{order.date}</span>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight mb-1">{order.item}</h3>
                      <p className="text-xs font-bold text-gray-400 mb-4 uppercase">Size: {order.size}</p>
                      <p className="text-2xl font-black text-[#f21c43]">{order.total}</p>
                    </div>
                  </div>

                  {/* Status and Action */}
                  <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                    <div className="flex flex-col items-end">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Status</p>
                      <span className={`text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-xl border-2 ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                        order.status === 'Shipped' ? 'bg-black text-white border-black' :
                        'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                         {order.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                       <Link 
                         href={`/track?order=${order.id}`}
                         className="border-2 border-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-xl"
                       >
                         Track Movement
                       </Link>
                       <button className="bg-gray-50 text-gray-400 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:text-black hover:bg-gray-100 transition-all rounded-xl">
                          Need Help?
                       </button>
                    </div>
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
