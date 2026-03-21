'use client';

import { useState, useEffect } from 'react';

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, pending: 0, completed: 0 });
  const [isOffline, setIsOffline] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [emails, setEmails] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const orderRes = await fetch('http://localhost:5000/api/orders/admin/all');
      const orderData = await orderRes.json();
      setOrders(orderData);
      
      const prodRes = await fetch('http://localhost:5000/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      // Stats calculation
      const rev = orderData.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
      const pend = orderData.filter((o: any) => o.paymentDetails?.status === 'Pending').length;
      const comp = orderData.filter((o: any) => o.paymentDetails?.status === 'Completed').length;
      setStats({ revenue: rev, pending: pend, completed: comp });
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Live sync
    return () => clearInterval(interval);
  }, []);

  const handleSendBill = async (orderId: string, overrideEmail: string) => {
    setIsSending(orderId);
    try {
      const res = await fetch('http://localhost:5000/api/orders/resend-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, overrideEmail })
      });
      if (res.ok) alert(`SUCCESS: Digital Bill sent to ${overrideEmail}`);
      else alert('ERROR: Delivery Protocol Failed');
    } catch (err) {
      alert('ERROR: Server Not Responding');
    } finally {
      setIsSending(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#eee] font-mono p-8 selection:bg-[#f21c43]">
      
      {/* 🚀 HUD - Operations Display */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 mb-12 gap-6">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3 italic">
            SMART<span className="text-[#f21c43]">ON</span> <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-500 tracking-widest font-bold not-italic">COMMAND_CENTER_2.4</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.5em] font-black">LOGISTICS_OPERATIONS_HUB</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl min-w-[160px] shadow-2xl">
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Valuation</p>
            <p className="text-2xl font-black text-white italic">₹{stats.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl min-w-[160px] shadow-2xl flex flex-col justify-center">
            <p className="text-[9px] text-[#f21c43] uppercase font-black mb-1">System Status</p>
            <p className={`text-xs font-black uppercase ${isOffline ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
              {isOffline ? 'OFFLINE_ERR' : 'ACTIVE_NODE'}
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation - Industrial Tabs */}
        <nav className="lg:col-span-2 flex flex-col gap-3">
          {['orders', 'inventory', 'logistics', 'terminal'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-6 py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-transparent shadow-xl ${activeTab === tab ? 'bg-white text-black translate-x-3' : 'bg-white/5 text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* 📟 CORE PANEL */}
        <section className="lg:col-span-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.5em]">Global Drop Stream</h2>
                  <button onClick={fetchData} className="text-[8px] font-black border border-white/10 px-4 py-2 hover:bg-white hover:text-black transition-all uppercase">Re-Sync Node</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-widest text-gray-500 bg-black">
                        <th className="p-8">ORDER_TAG</th>
                        <th className="p-8">MEMBER_SIGNAL</th>
                        <th className="p-8">OVERRIDE_EMAIL</th>
                        <th className="p-8 text-right">PROTOCOL</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-medium">
                      {orders.map((order: any) => (
                        <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td className="p-8">
                             <span className="block font-black text-white italic text-lg">#{order._id.toString().slice(-6).toUpperCase()}</span>
                             <span className="text-[8px] text-gray-500 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="p-8">
                             <span className="block font-black uppercase text-gray-200">{order.customerDetails?.name}</span>
                             <span className="text-[9px] text-[#f21c43] font-bold">{order.paymentDetails?.status}</span>
                          </td>
                          <td className="p-8">
                             <input 
                                type="text"
                                placeholder={order.customerDetails?.email}
                                onChange={(e) => setEmails({ ...emails, [order._id]: e.target.value })}
                                className="bg-white/5 border border-white/10 p-3 w-full rounded text-[10px] focus:border-[#f21c43] outline-none text-white italic placeholder:text-gray-700"
                             />
                          </td>
                          <td className="p-8 text-right">
                             <button 
                                onClick={() => handleSendBill(order._id, emails[order._id] || order.customerDetails?.email)}
                                disabled={isSending === order._id}
                                className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest transition-all shadow-xl ${isSending === order._id ? 'bg-gray-800 text-gray-500' : 'bg-[#f21c43] text-white hover:bg-white hover:text-black active:scale-95'}`}
                             >
                               {isSending === order._id ? 'PROCESSING...' : 'SEND_DIGITAL_BILL'}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="p-40 text-center flex flex-col items-center gap-8 animate-pulse text-gray-700">
                      <div className="w-16 h-16 border-[3px] border-white/10 border-t-[#f21c43] rounded-full animate-spin"></div>
                      <p className="text-[10px] uppercase font-black tracking-[1em]">Listening for Member Entrance...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
               <div className="p-12 animate-fade-in">
                  <div className="flex justify-between items-center mb-12">
                     <h2 className="text-2xl font-black italic uppercase tracking-tighter">Inventory Matrix</h2>
                     <button className="bg-white text-black px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#f21c43] hover:text-white transition-all">+ Add New Object</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {products.map((p: any) => (
                       <div key={p.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl group relative overflow-hidden">
                          <img src={p.image} className="w-full h-48 object-cover rounded-xl opacity-50 group-hover:opacity-100 transition-all grayscale group-hover:grayscale-0" alt={p.name} />
                          <div className="mt-6 flex justify-between items-start">
                             <div>
                                <h3 className="text-sm font-black uppercase tracking-tight italic">{p.name}</h3>
                                <p className="text-[10px] text-gray-500 mt-1">₹{p.price}</p>
                             </div>
                             <button className="text-[8px] border border-white/20 px-3 py-1 uppercase font-black hover:border-white transition-all">EDIT</button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </section>
      </main>

      {/* 🖥️ Terminal Status Bar */}
      <footer className="mt-20 border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center opacity-40 text-[9px] font-black tracking-widest uppercase gap-6">
        <div className="flex gap-12">
          <span>Node_ID: SMARTON_HUB_MUMBAI</span>
          <span>LATENCY: 12ms</span>
          <span>ENCRYPT: SHA-256</span>
        </div>
        <div className="flex gap-8">
           <span>DB: MongoDB Atlas Cluster_0</span>
           <span>LOGS: Streamed_v2.0</span>
        </div>
        <div className="text-right italic">SMARTON COMMAND v1.08_STABLE_REL</div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 1s ease-out; }
      `}</style>
    </div>
  );
}
