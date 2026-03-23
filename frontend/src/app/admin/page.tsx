'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../../config/api';
import { supabase } from '../../config/supabase';
import Navbar from '../../components/Navbar';

const API_URL = getApiUrl();
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const CATEGORIES = ['Fusion', 'Heritage', 'Cargo', 'Essentials', 'Accessories'];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' 
  });
  const [newBanner, setNewBanner] = useState({ title: '', image: '', link_product_id: '', active: true });

  const fetchArchive = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const [pRes, oRes, bRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').order('id', { ascending: false })
      ]);
      
      if (pRes.data) setInventory(pRes.data);
      if (bRes.data) setBanners(bRes.data);
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
    } catch (err: any) {
      console.error('Atelier Supabase Sync Error:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isBanner = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         if (isBanner) setNewBanner(prev => ({ ...prev, image: reader.result as string }));
         else setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (size: string) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image) return alert('Creation image required.');
    try {
      const payload = { ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock) };
      if (isEditingProduct) await supabase.from('products').update(payload).eq('id', isEditingProduct);
      else await supabase.from('products').insert(payload);
      setIsAddingProduct(false); setIsEditingProduct(null); fetchArchive(true);
      setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });
    } catch (err) { alert('Registry Failed.'); }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.image) return alert('Showroom visual required.');
    try {
      await supabase.from('banners').insert(newBanner);
      setIsAddingBanner(false); fetchArchive(true);
      setNewBanner({ title: '', image: '', link_product_id: '', active: true });
    } catch (err) { alert('Showroom Registry Failed.'); }
  };

  const handleDeleteBanner = async (id: string) => {
     if (!confirm('Discard this visual protocol?')) return;
     await supabase.from('banners').delete().eq('id', id);
     fetchArchive(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        await supabase.from('orders').update({ order_status: status, shipping_details: { courier, trackingId } }).eq('id', orderId);
        setSelectedOrder(null); fetchArchive(true); alert('Registry Entry Updated.');
     } catch (err) { alert('Registry Update Failed'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--indian-midnight)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
           <h1 className="text-4xl font-serif font-bold italic tracking-[0.4em] text-[var(--indian-gold)] mb-12 text-center uppercase underline decoration-[var(--indian-maroon)] underline-offset-8">ATELIER VAULT</h1>
           <form onSubmit={handleLogin} className="glass-midnight p-10 rounded-[40px] border border-white/10 shadow-2xl animate-fade-in-up">
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border-b-2 border-white/10 py-4 px-6 text-white text-center outline-none focus:border-[var(--indian-gold)] transition-all mb-8 tracking-[1em]" autoFocus />
              <button type="submit" className="w-full bg-[var(--indian-gold)] text-[var(--indian-midnight)] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl">verify pulse</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans pb-32 md:pb-0 overflow-x-hidden">
      <Navbar />

      <main className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 animate-fade-in-up">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4 italic">Command Center</p>
              <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter uppercase leading-none">ATELIER<span className="text-[var(--indian-maroon)] gold-glow"> HUB</span></h1>
           </div>
           <div className="flex flex-wrap gap-3">
              {['inventory', 'orders', 'banners'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}>{tab}</button>
              ))}
           </div>
        </div>

        {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-2xl font-serif font-bold uppercase italic border-b-2 border-[var(--indian-gold)]/20 pb-2">Archives</h2>
                 <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); }} className="bg-[var(--indian-midnight)] text-white px-8 md:px-12 py-5 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] transition-all shadow-xl">
                   {isAddingProduct ? 'Archive Form' : '+ Register Piece'}
                 </button>
              </div>

              {isAddingProduct && (
                 <form onSubmit={handleSaveProduct} className="bg-white p-10 md:p-16 rounded-[60px] mb-20 shadow-2xl border-2 border-[var(--indian-gold)]/10 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <div className="space-y-10">
                          <input type="text" placeholder="Creation Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-2xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                          <div className="grid grid-cols-2 gap-10">
                             <input type="number" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)]" required />
                             <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)]" required />
                          </div>
                          <div className="flex flex-wrap gap-2 pt-4">
                             {CATEGORIES.map(cat => (
                                <button key={cat} type="button" onClick={() => setNewProduct({...newProduct, category: cat})} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase transition-all ${newProduct.category === cat ? 'bg-[var(--indian-maroon)] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>{cat}</button>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-10">
                          <div className="flex flex-wrap gap-2">
                             {AVAILABLE_SIZES.map(sz => (
                                <button key={sz} type="button" onClick={() => toggleSize(sz)} className={`w-10 h-10 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center border-2 ${newProduct.sizes.includes(sz) ? 'bg-[var(--indian-midnight)] border-[var(--indian-gold)] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'}`}>{sz}</button>
                             ))}
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="w-full bg-gray-50 p-4 rounded-2xl text-[9px] font-bold uppercase text-gray-400" />
                          <textarea placeholder="Design Character..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50/50 p-6 rounded-[30px] h-32 outline-none text-sm font-serif italic" />
                       </div>
                    </div>
                    <button type="submit" className="w-full mt-12 bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] shadow-xl hover:scale-102 transition-all">Publish Pulse</button>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                 {inventory.map(item => (
                    <div key={item.id} className="bg-white rounded-[30px] group border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all">
                       <img src={item.image} alt={item.name} className="w-full aspect-square object-cover rounded-[20px] mb-6" />
                       <h3 className="text-sm font-serif font-bold uppercase">{item.name}</h3>
                       <p className="text-xl font-serif font-bold text-[var(--indian-maroon)] italic mt-1">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'banners' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-2xl font-serif font-bold uppercase italic border-b-2 border-[var(--indian-gold)]/20 pb-2">Showroom Vision</h2>
                 <button onClick={() => setIsAddingBanner(!isAddingBanner)} className="bg-[var(--indian-midnight)] text-white px-8 md:px-12 py-5 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] transition-all shadow-xl">
                   {isAddingBanner ? 'Close' : '+ Add Hub Banner'}
                 </button>
              </div>

              {isAddingBanner && (
                 <form onSubmit={handleSaveBanner} className="bg-white p-10 md:p-16 rounded-[60px] mb-20 shadow-2xl border-2 border-[var(--indian-gold)]/10 animate-fade-in-up max-w-2xl mx-auto">
                    <div className="space-y-8">
                       <input type="text" placeholder="Collection Title" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#800000]">High-Impact Visual Required</p>
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="w-full bg-gray-50 p-6 rounded-[30px] text-[10px] font-bold uppercase text-gray-400 cursor-pointer shadow-inner" required />
                       <button type="submit" className="w-full bg-[var(--indian-midnight)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[10px] tracking-[0.4em] shadow-xl hover:bg-white transition-all">Activate Visual Hub</button>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {banners.map(banner => (
                    <div key={banner.id} className="relative aspect-[16/9] rounded-[40px] overflow-hidden group shadow-2xl border-2 border-white/50">
                       <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                       <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-10 flex justify-between items-end">
                          <div>
                             <h3 className="text-2xl font-serif text-white italic">{banner.title}</h3>
                             <p className="text-[9px] font-bold text-[var(--indian-gold)] uppercase tracking-[0.4em] mt-2">{banner.active ? 'LIVE ATELIER FEED' : 'DORMANT'}</p>
                          </div>
                          <button onClick={() => handleDeleteBanner(banner.id)} className="bg-white/10 hover:bg-red-500/80 backdrop-blur-md text-white p-4 rounded-full transition-all">✕</button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-fade-in-up space-y-6">
              <h2 className="text-2xl font-serif font-bold uppercase italic mb-12 border-b-2 border-[var(--indian-gold)]/20 pb-2">Live Registry Feed</h2>
              {orders.map(order => (
                 <div key={order.id} className="bg-white p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                    <div className="flex-1">
                       <h4 className="text-xl font-serif font-bold uppercase leading-none">{order.user}</h4>
                       <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300 mt-3">{order.id} • {order.date}</p>
                    </div>
                    <div className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.4em] px-8 py-3 rounded-full border text-gray-400">{order.status}</div>
                    <p className="text-2xl font-serif font-bold italic text-[var(--indian-maroon)]">{order.total}</p>
                    <button onClick={() => setSelectedOrder(order)} className="bg-[var(--indian-midnight)] text-white p-4 rounded-full hover:scale-110 shadow-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                 </div>
              ))}
           </div>
        )}
      </main>

      {/* MODAL FOR ORDER DETAILS */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
            <div className="fixed inset-0 bg-[#0a0a0b]/95 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-5xl bg-[var(--indian-cream)] rounded-[60px] p-8 md:p-16 shadow-2xl border-2 border-[var(--indian-gold)]/30 animate-fade-in-up my-auto pointer-events-auto">
               <div className="flex flex-col md:flex-row justify-between mb-12 border-b pb-12 gap-10">
                  <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase text-[var(--indian-gold)] mb-3 tracking-[0.5em]">Process Registry Hub</p>
                     <h2 className="text-4xl md:text-7xl font-serif font-bold italic uppercase leading-tight">{selectedOrder.user}</h2>
                     <p className="text-xs text-gray-300 font-bold tracking-widest uppercase">{selectedOrder.id}</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-gray-100 flex flex-col gap-6 shadow-xl">
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">Status Protocol</p>
                     <div className="grid grid-cols-2 gap-2">
                        {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                           <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-3 rounded-full text-[9px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[var(--indian-maroon)] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{st}</button>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="Courier Provider" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white border border-gray-100 rounded-[30px] py-6 px-10 text-sm outline-none focus:border-[var(--indian-gold)] italic font-serif shadow-inner" />
                    <input type="text" placeholder="Tracking Number" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white border border-gray-100 rounded-[30px] py-6 px-10 text-sm outline-none focus:border-[var(--indian-gold)] italic font-serif shadow-inner" />
                  </div>
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id.replace('#', ''), selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-8 rounded-full font-bold uppercase text-[14px] tracking-[0.4em] shadow-[0_20px_50px_rgba(128,0,0,0.3)] hover:scale-[1.02] transition-all">Archive Registry Change</button>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-400 text-xl font-bold">✕</button>
            </div>
         </div>
      )}
    </div>
  );
}
