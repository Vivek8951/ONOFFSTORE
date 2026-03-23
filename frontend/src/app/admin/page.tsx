'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../../config/api';
import { supabase } from '../../config/supabase';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

const API_URL = getApiUrl();
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function AdminPage() {
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
      // 🚀 SUPABASE HIGH-SPEED SYNC: Bypassing Express for Instant Load
      const [pRes, oRes, bRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').order('id', { ascending: false })
      ]);
      
      if (pRes.data) setInventory(pRes.data);
      if (oRes.data) {
         setOrders(oRes.data.map((o: any) => ({
            ...o,
            id: `#${o.id.slice(-6).toUpperCase()}`,
            user: o.customer_details?.name || 'Member',
            total: `₹${Number(o.total_amount).toLocaleString()}`,
            status: o.order_status,
            date: new Date(o.created_at).toLocaleString(),
            courier: o.shipping_details?.courier || '',
            trackingId: o.shipping_details?.trackingId || ''
         })));
      }
      if (bRes.data) setBanners(bRes.data);

    } catch (err: any) {
      console.error('Atelier Supabase Sync Failed:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // REALTIME POLLING & FOCUS SYNC (Supabase is fast enough for 10s polling)
  useEffect(() => {
    if (isAuthenticated) {
      fetchArchive();
      const timer = setInterval(() => fetchArchive(true), 15000); 
      window.addEventListener('focus', () => fetchArchive(true));
      return () => { clearInterval(timer); window.removeEventListener('focus', () => fetchArchive(true)); };
    }
  }, [isAuthenticated, fetchArchive]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'onoffadmin') setIsAuthenticated(true);
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
    try {
      if (isEditingProduct) {
        await supabase.from('products').update({
          name: newProduct.name,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          image: newProduct.image,
          description: newProduct.description,
          category: newProduct.category
        }).eq('id', isEditingProduct);
      } else {
        await supabase.from('products').insert({
          name: newProduct.name,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          image: newProduct.image,
          description: newProduct.description,
          category: newProduct.category
        });
      }
      setIsAddingProduct(false); setIsEditingProduct(null); fetchArchive(true);
      setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });
    } catch (err) { alert('Supabase Publish Failed'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        // UPDATE SUPABASE HUB
        const { error } = await supabase.from('orders')
           .update({ 
              order_status: status, 
              shipping_details: { courier, trackingId } 
           })
           .eq('id', orderId);

        if (error) throw error;
        
        // SYNC BACK TO EXPRESS (Legacy Bridge)
        fetch(`${API_URL}/api/orders/${orderId}/status`, {
           method: 'PUT', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status, courier, trackingId })
        }).catch(() => null); // Silent fallback

        setSelectedOrder(null); 
        fetchArchive(true); 
        alert('Atelier Supabase Hub: Order Registry Updated.');
     } catch (err) { alert('Status Update Failed'); }
  };

  const handleResendInvoice = async (orderId: string) => {
     try {
        const res = await fetch(`${API_URL}/api/orders/resend-invoice`, {
           method: 'POST', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ orderId })
        });
        if (res.ok) alert('Atelier Hub: Digital Bill successfully dispatched via Email.');
     } catch (err) { alert('Email Dispatch Failed'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--indian-midnight)] flex items-center justify-center p-6 selection:bg-[var(--indian-gold)]">
        <div className="w-full max-w-md animate-fade-in-up">
           <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold italic tracking-[0.4em] text-[var(--indian-gold)] mb-4 gold-glow uppercase">ONOFF</h1>
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Vault Access Required</p>
           </div>
           <form onSubmit={handleLogin} className="glass-midnight p-10 rounded-[40px] border border-white/10 shadow-2xl">
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border-b-2 border-white/10 py-4 px-6 text-white text-center outline-none focus:border-[var(--indian-gold)] transition-all mb-8 tracking-[1em]" autoFocus />
              <button type="submit" className="w-full bg-[var(--indian-gold)] text-[var(--indian-midnight)] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]">unlock vault</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans pb-32 md:pb-0 overflow-x-hidden">
      <Navbar />

      {/* SUPABASE SYNC INDICATOR */}
      {isSyncing && (
         <div className="fixed top-28 left-6 z-[500] bg-green-500 text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl animate-fade-in-up flex items-center gap-3">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            Supabase Live Node Connected
         </div>
      )}

      <main className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 animate-fade-in-up">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4 italic">Supabase High-Speed Hub</p>
              <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter">ATELIER<span className="text-[var(--indian-maroon)] gold-glow uppercase"> HUB</span></h1>
           </div>
           <div className="hidden md:flex gap-4">
              {['inventory', 'orders', 'banners'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}>{tab}</button>
              ))}
           </div>
        </div>

        {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-serif font-bold uppercase italic border-b-2 border-[var(--indian-gold)]/20 pb-2">Archive</h2>
                 <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); }} className="bg-[var(--indian-midnight)] text-white px-8 md:px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] transition-all shadow-xl">
                   {isAddingProduct ? 'Close' : '+ Add Creation'}
                 </button>
              </div>

              {isAddingProduct && (
                 <form onSubmit={handleSaveProduct} className="glass-card p-8 md:p-12 rounded-[50px] mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-2 border-[var(--indian-gold)]/20 shadow-2xl">
                    <div className="space-y-8">
                       <input type="text" placeholder="Creation Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="text" placeholder="Commission (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="number" placeholder="Archive Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                    </div>
                    <div className="flex flex-col gap-8">
                       <textarea placeholder="Philosophy..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50/50 p-8 rounded-[30px] h-40 outline-none focus:border-[var(--indian-gold)]/30 transition-all font-serif italic" />
                       <div className="space-y-4">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-xs font-bold" />
                          <button type="submit" className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-white hover:text-[var(--indian-maroon)] transition-all shadow-xl">
                             {isEditingProduct ? 'Update Supabase Hub' : 'Publish to Feed'}
                          </button>
                       </div>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                 {inventory.map(item => (
                    <div key={item.id} className="glass-card rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all border border-gray-100/50">
                       <div className="aspect-square relative overflow-hidden bg-gray-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => { setIsEditingProduct(item.id); setIsAddingProduct(true); setNewProduct({...item, price: item.price.toString()}); }} className="bg-white/90 p-4 rounded-full shadow-xl text-lg hover:scale-110">✎</button>
                          </div>
                       </div>
                       <div className="p-8">
                          <h3 className="text-xl font-serif font-bold uppercase tracking-tight">{item.name}</h3>
                          <p className="text-2xl font-serif font-bold text-[var(--indian-maroon)] mt-2 italic">₹{Number(item.price).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-fade-in-up">
              <h2 className="text-3xl font-serif font-bold uppercase italic mb-12 border-b-2 border-[var(--indian-gold)]/20 pb-2">Live Registry</h2>
              <div className="space-y-6">
                 {orders.map(order => (
                    <div key={order.id} className="glass-card p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                       <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold uppercase tracking-tight">{order.user}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-2">{order.id} • {order.date}</p>
                       </div>
                       <div className={`text-[10px] font-bold uppercase tracking-[0.4em] px-8 py-3 rounded-full border ${order.status === 'Accepted' || order.status === 'Processing' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-300 border-gray-200'}`}>
                          {order.status}
                       </div>
                       <div className="flex items-center gap-8">
                          <p className="text-2xl font-serif font-bold italic text-[var(--indian-maroon)]">{order.total}</p>
                          <button onClick={() => setSelectedOrder(order)} className="bg-[var(--indian-midnight)] text-white p-4 rounded-full hover:scale-110 shadow-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION: ULTRA ELITE */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 glass-midnight rounded-full border border-white/20 p-4 flex justify-around items-center shadow-2xl z-[500] pointer-events-auto">
         {['inventory', 'orders', 'banners'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1.5 p-3 rounded-full transition-all duration-500 ${activeTab === tab ? 'bg-[var(--indian-gold)] text-[var(--indian-midnight)] scale-125 shadow-lg' : 'text-white/40'}`}>
               <span className="text-[7px] font-bold uppercase tracking-widest">{tab.slice(0,3)}</span>
            </button>
         ))}
      </nav>

      {/* MODAL FOR ORDER DETAILS */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
            <div className="fixed inset-0 bg-[#0a0a0b]/95 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-4xl bg-[var(--indian-cream)] rounded-[60px] p-8 md:p-16 shadow-2xl border-2 border-[var(--indian-gold)]/30 animate-fade-in-up my-auto pointer-events-auto">
               <div className="flex flex-col md:flex-row justify-between gap-12 mb-12 border-b pb-8">
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--indian-gold)] mb-4 italic">Registry Entry</p>
                     <h2 className="text-4xl md:text-6xl font-serif font-bold italic uppercase">{selectedOrder.user}</h2>
                  </div>
                  <div className="bg-white p-6 rounded-[30px] border border-gray-100 flex flex-col gap-4">
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Atelier Hub Status</p>
                     <div className="grid grid-cols-2 gap-2">
                        {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                           <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-2.5 rounded-full text-[8px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[var(--indian-maroon)] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>{st}</button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <input type="text" placeholder="Courier Hub" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[var(--indian-gold)] font-serif italic" />
                     <input type="text" placeholder="Tracking ID" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[var(--indian-gold)] font-serif italic" />
                     <button onClick={() => handleResendInvoice(selectedOrder.id.replace('#', ''))} className="w-full bg-white border border-[var(--indian-gold)]/20 text-[var(--indian-maroon)] py-4 rounded-full font-bold uppercase text-[9px] tracking-[0.3em] hover:bg-[var(--indian-gold)] hover:text-white transition-all">Resend Digital Bill 📧</button>
                  </div>
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id.replace('#', ''), selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[12px] tracking-[0.4em] shadow-xl h-fit">Registry Confirm Update</button>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-400">✕</button>
            </div>
         </div>
      )}
    </div>
  );
}
