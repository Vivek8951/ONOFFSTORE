'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from './config/api';

const API_URL = getApiUrl();
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });

  const fetchArchive = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    
    try {
      const [pRes, oRes, bRes] = await Promise.all([
        fetch(`${API_URL}/api/products`, { cache: 'no-store' }),
        fetch(`${API_URL}/api/orders/admin/all`, { cache: 'no-store' }),
        fetch(`${API_URL}/api/banners/admin/all`, { cache: 'no-store' })
      ]);
      
      const pData = await pRes.json();
      const oData = await oRes.json();
      const bData = await bRes.json();

      setInventory(pData.map((p: any) => ({
        id: p._id, name: p.name, price: p.price, stock: p.stock, image: p.image, sizes: p.sizes || ['S', 'M', 'L'], category: p.category, description: p.description
      })));

      setOrders(oData.map((o: any) => ({
        id: `#${o._id.slice(-6).toUpperCase()}`, _id: o._id, user: o.customerDetails?.name || 'Member', email: o.customerDetails?.email, phone: o.customerDetails?.phone, address: o.customerDetails?.address, total: `₹${o.totalAmount}`, status: o.orderStatus || 'Pending', items: o.items || [], date: new Date(o.createdAt).toLocaleString(), courier: o.shippingDetails?.courier || '', trackingId: o.shippingDetails?.trackingId || '', customerDetails: o.customerDetails
      })));

      setBanners(bData);
    } catch (err: any) {
      console.error('Atelier Sync Failed:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchArchive();
      const timer = setInterval(() => fetchArchive(true), 30000); 
      window.addEventListener('focus', () => fetchArchive(true));
      return () => { clearInterval(timer); window.removeEventListener('focus', () => fetchArchive(true)); };
    }
  }, [isAuthenticated, fetchArchive]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else alert('Invalid Access Code');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
           method: 'PUT', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status, courier, trackingId })
        });
        if (res.ok) { setSelectedOrder(null); fetchArchive(true); alert('Registry Updated Successfully.'); }
     } catch (err) { alert('Status Update Failed'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 selection:bg-[#d4af37]">
        <style dangerouslySetInnerHTML={{ __html: `.gold-glow { text-shadow: 0 0 20px rgba(212,175,55,0.4); } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }`}} />
        <div className="w-full max-w-md animate-fade-in-up">
           <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold italic tracking-[0.4em] text-[#d4af37] mb-4 gold-glow uppercase">ONOFF</h1>
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Vault Access Required</p>
           </div>
           <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border-b-2 border-white/10 py-4 px-6 text-white text-center outline-none focus:border-[#d4af37] transition-all mb-8 tracking-[1em]" autoFocus />
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0b] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:scale-105 transition-all shadow-xl">unlock vault</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0a0a0b] font-sans pb-32 md:pb-0 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `.gold-glow { text-shadow: 0 0 15px rgba(212,175,55,0.3); } @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; } .no-scrollbar::-webkit-scrollbar { display: none; }`}} />

      {isSyncing && (
         <div className="fixed top-12 left-6 z-[500] bg-[#d4af37] text-[#0a0a0b] px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl animate-fade-in-up flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            SYNC ACTIVE
         </div>
      )}

      <header className="pt-20 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37] mb-4 italic">Command Center</p>
            <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter leading-none uppercase">THE <span className="text-[#800000] gold-glow uppercase">HUB</span></h1>
         </div>
         <div className="flex gap-4">
            {['inventory', 'orders', 'banners'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 md:px-10 py-4 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[#800000] text-[#d4af37] shadow-xl' : 'bg-white text-gray-400 border'}`}>{tab}</button>
            ))}
         </div>
      </header>

      <main className="px-6 md:px-12 max-w-7xl mx-auto py-20 pb-40">
         {activeTab === 'orders' && (
           <div className="animate-fade-in-up space-y-6">
              {orders.map(order => (
                 <div key={order._id} className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                    <div className="flex-1">
                       <h4 className="text-xl font-serif font-bold uppercase">{order.user}</h4>
                       <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mt-2">#{order._id.slice(-6).toUpperCase()} • {order.date}</p>
                    </div>
                    <div className="bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-widest px-6 py-2 rounded-full border border-gray-100">{order.status}</div>
                    <p className="text-2xl font-serif font-bold italic text-[#800000]">{order.total}</p>
                    <button onClick={() => setSelectedOrder(order)} className="bg-[#0a0a0b] text-white p-4 rounded-full hover:scale-110 shadow-lg transition-all active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                 </div>
              ))}
           </div>
         )}
      </main>

      {/* MODAL FOR STATUS UPDATE */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#0a0a0b]/95 backdrop-blur-xl animate-fade-in-up overflow-y-auto">
            <div className="absolute inset-0" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-4xl bg-[#faf9f6] rounded-[60px] p-8 md:p-16 shadow-2xl border-2 border-[#d4af37]/30 my-auto pointer-events-auto overflow-y-auto max-h-[90vh] no-scrollbar">
               <div className="flex flex-col md:flex-row justify-between gap-12 mb-12 border-b pb-10">
                  <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase text-[#d4af37] mb-3 tracking-[0.5em]">Process Registry</p>
                     <h2 className="text-4xl md:text-6xl font-serif font-bold italic uppercase leading-none mb-4">{selectedOrder.user}</h2>
                     <p className="text-xs text-gray-300 font-bold tracking-widest uppercase">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[30px] border border-gray-100 flex flex-col gap-4">
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">Status Protocol</p>
                     <div className="grid grid-cols-2 gap-2">
                        {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                           <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-2.5 rounded-full text-[8px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[#800000] text-[#d4af37] shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{st}</button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div className="bg-white/50 p-6 rounded-[30px] border border-gray-100">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#800000] mb-4">Logistics</h3>
                        <div className="space-y-4">
                           <input type="text" placeholder="Courier Hub" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-2 text-sm outline-none focus:border-[#d4af37] italic font-serif" />
                           <input type="text" placeholder="Tracking ID" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-2 text-sm outline-none focus:border-[#d4af37] italic font-serif" />
                        </div>
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <div className="bg-white p-6 rounded-[30px] border border-gray-100 flex-1 mb-8 overflow-y-auto max-h-[200px] no-scrollbar">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mb-4">Items Summary</h3>
                        <div className="space-y-3">
                           {selectedOrder.items.map((item: any, i: number) => (
                              <p key={i} className="text-[11px] font-bold text-gray-600 flex justify-between uppercase"><span>{item.name}</span> <span className="text-gray-300">SZ {item.size}</span></p>
                           ))}
                        </div>
                     </div>
                     <button onClick={() => handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[#800000] text-[#d4af37] py-5 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] shadow-xl hover:scale-105 transition-all">Registry Confirmation</button>
                  </div>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-300 text-xl">✕</button>
            </div>
         </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 bg-[#0a0a0b]/90 backdrop-blur-2xl rounded-full border border-white/20 p-4 flex justify-around items-center shadow-2xl z-[500] pointer-events-auto">
         {['inventory', 'orders', 'banners'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1.5 p-3 rounded-full transition-all duration-500 font-bold uppercase tracking-widest text-[8px] ${activeTab === tab ? 'bg-[#d4af37] text-[#0a0a0b] scale-125 shadow-lg' : 'text-white/40'}`}>
               {tab.slice(0,3)}
            </button>
         ))}
      </nav>
    </div>
  );
}
