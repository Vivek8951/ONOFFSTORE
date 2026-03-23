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
  const [isReady, setIsReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });

  const fetchArchive = useCallback(async (silent = false) => {
    if (!silent) setIsReady(false);
    else setIsSyncing(true);
    
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
        id: `#${o._id.slice(-6).toUpperCase()}`, _id: o._id, user: o.customerDetails?.name || 'Member', total: `₹${o.totalAmount}`, status: o.orderStatus || 'Pending', items: o.items || [], date: new Date(o.createdAt).toLocaleString(), courier: o.shippingDetails?.courier || '', trackingId: o.shippingDetails?.trackingId || '', customerDetails: o.customerDetails
      })));

      setBanners(bData);
    } catch (err: any) {
      console.error('Atelier Sync Failed:', err.message);
    } finally {
      setIsReady(true);
      setIsSyncing(false);
    }
  }, []);

  // REALTIME POLLING & FOCUS SYNC
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditingProduct ? `${API_URL}/api/products/${isEditingProduct}` : `${API_URL}/api/products`;
    const method = isEditingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, price: parseInt(newProduct.price as any), stock: parseInt(newProduct.stock as any) })
      });
      if (res.ok) { setIsAddingProduct(false); setIsEditingProduct(null); fetchArchive(true); }
    } catch (err) { alert('Failed to Publish Piece'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
           method: 'PUT', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status, courier, trackingId })
        });
        if (res.ok) { setSelectedOrder(null); fetchArchive(true); }
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
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0b] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]">unlock vault</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0a0a0b] font-sans pb-32 md:pb-0 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `.gold-glow { text-shadow: 0 0 15px rgba(212,175,55,0.3); } @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; } .no-scrollbar::-webkit-scrollbar { display: none; }`}} />

      {isSyncing && (
         <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[500] bg-[#d4af37] text-[#0a0a0b] px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl animate-fade-in-up flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            REALTIME ATELIER SYNC
         </div>
      )}

      <header className="pt-20 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37] mb-4 italic">Command Center</p>
            <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter leading-none uppercase">THE <span className="text-[#800000] gold-glow uppercase">HUB</span></h1>
         </div>
         <div className="hidden md:flex gap-4">
            {['inventory', 'orders', 'banners'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[#800000] text-[#d4af37] shadow-xl' : 'bg-white text-gray-400 border'}`}>{tab}</button>
            ))}
         </div>
      </header>

      <main className="px-6 md:px-12 max-w-7xl mx-auto py-20">
         {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-serif font-bold italic">Archive</h2>
                 <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); }} className="bg-[#0a0a0b] text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">
                   {isAddingProduct ? 'Archive' : '+ Add Creation'}
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {inventory.map(item => (
                    <div key={item.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all relative">
                       <img src={item.image} className="w-full aspect-square object-cover transition-transform duration-[2s] group-hover:scale-110" />
                       <div className="p-8">
                          <h3 className="text-xl font-serif font-bold uppercase mb-2">{item.name}</h3>
                          <p className="text-2xl font-serif font-bold text-[#800000]">₹{Number(item.price).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
         )}

         {activeTab === 'orders' && (
           <div className="animate-fade-in-up">
              <h2 className="text-3xl font-serif font-bold italic mb-12">Feed</h2>
              <div className="space-y-6">
                 {orders.map(order => (
                    <div key={order._id} className="bg-white p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                       <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold uppercase">{order.user}</h4>
                          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mt-2">#{order._id.slice(-6).toUpperCase()} • {order.date}</p>
                       </div>
                       <div className="bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-widest px-6 py-2 rounded-full border border-gray-100">{order.status}</div>
                       <p className="text-2xl font-serif font-bold italic text-[#800000]">{order.total}</p>
                       <button onClick={() => setSelectedOrder(order)} className="bg-[#0a0a0b] text-white p-4 rounded-full"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                    </div>
                 ))}
              </div>
           </div>
         )}
      </main>

      {/* MOBILE BOTTOM NAV: ULTRA PREMIUM */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 bg-[#0a0a0b]/90 backdrop-blur-3xl rounded-full border border-white/20 p-4 flex justify-around items-center shadow-2xl z-[500] pointer-events-auto">
         {['inventory', 'orders', 'banners'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1.5 p-3 rounded-full transition-all duration-500 font-bold uppercase tracking-widest text-[8px] ${activeTab === tab ? 'bg-[#d4af37] text-[#0a0a0b] scale-125 shadow-lg' : 'text-white/40'}`}>
               {tab.slice(0,3)}
            </button>
         ))}
      </nav>
    </div>
  );
}
