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
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    stock: 0, 
    image: '', 
    sizes: ['M'], 
    category: 'Fusion', 
    description: '' 
  });

  const fetchArchive = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const [pRes, oRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
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
    if (!newProduct.image) return alert('Please upload a creation image.');

    try {
      const payload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        image: newProduct.image,
        description: newProduct.description,
        category: newProduct.category,
        sizes: newProduct.sizes
      };

      if (isEditingProduct) {
        await supabase.from('products').update(payload).eq('id', isEditingProduct);
      } else {
        await supabase.from('products').insert(payload);
      }
      setIsAddingProduct(false); setIsEditingProduct(null); fetchArchive(true);
      setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });
    } catch (err) { alert('Supabase Hub Reject: Product Registry Failed.'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const { error } = await supabase.from('orders').update({ order_status: status, shipping_details: { courier, trackingId } }).eq('id', orderId);
        if (error) throw error;
        setSelectedOrder(null); fetchArchive(true); alert('Atelier Hub: Registry Entry Updated.');
     } catch (err) { alert('Registry Update Failed'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--indian-midnight)] flex items-center justify-center p-6 selection:bg-[var(--indian-gold)]">
        <div className="w-full max-w-md">
           <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold italic tracking-[0.4em] text-[var(--indian-gold)] mb-4 uppercase">ONOFF</h1>
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Vault Access Required</p>
           </div>
           <form onSubmit={handleLogin} className="glass-midnight p-10 rounded-[40px] border border-white/10 shadow-2xl animate-fade-in-up">
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border-b-2 border-white/10 py-4 px-6 text-white text-center outline-none focus:border-[var(--indian-gold)] transition-all mb-8 tracking-[1em]" autoFocus />
              <button type="submit" className="w-full bg-[var(--indian-gold)] text-[var(--indian-midnight)] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all">unlock vault</button>
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
              <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter uppercase leading-none">THE <span className="text-[var(--indian-maroon)] gold-glow uppercase">HUB</span></h1>
           </div>
           <div className="flex gap-4">
              {['inventory', 'orders'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}>{tab}</button>
              ))}
           </div>
        </div>

        {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-serif font-bold uppercase italic border-b-2 border-[var(--indian-gold)]/20 pb-2">Archive Feed</h2>
                 <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); }} className="bg-[var(--indian-midnight)] text-white px-8 md:px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] transition-all shadow-xl">
                   {isAddingProduct ? 'Hide Form' : '+ Add New Creation'}
                 </button>
              </div>

              {isAddingProduct && (
                 <form onSubmit={handleSaveProduct} className="bg-white p-8 md:p-16 rounded-[60px] mb-20 shadow-2xl border-2 border-[var(--indian-gold)]/10 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <div className="space-y-10">
                          <div className="space-y-2">
                             <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Creation Identity</label>
                             <input type="text" placeholder="e.g. Regal Velvet Sherwani" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-2xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-10">
                             <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Commission (₹)</label>
                                <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Vault Stock</label>
                                <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Drop Category</label>
                             <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                   <button key={cat} type="button" onClick={() => setNewProduct({...newProduct, category: cat})} className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase transition-all ${newProduct.category === cat ? 'bg-[var(--indian-maroon)] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{cat}</button>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-10">
                          <div className="space-y-4">
                             <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Available Dimensions (Sizes)</label>
                             <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SIZES.map(sz => (
                                   <button key={sz} type="button" onClick={() => toggleSize(sz)} className={`w-12 h-12 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center border-2 ${newProduct.sizes.includes(sz) ? 'bg-[var(--indian-midnight)] border-[var(--indian-gold)] text-white' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'}`}>{sz}</button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Visual Capture</label>
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-gray-50 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-400" />
                          </div>

                          <textarea placeholder="The design philosophy and fabric character..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50/50 p-8 rounded-[30px] h-32 outline-none text-sm font-serif italic" />
                       </div>
                    </div>
                    <button type="submit" className="w-full mt-16 bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-7 rounded-full font-bold uppercase text-[12px] tracking-[0.5em] shadow-[0_15px_40px_rgba(128,0,0,0.3)] hover:scale-[1.02] transition-all">Publish Creation to Atelier</button>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {inventory.map(item => (
                    <div key={item.id} className="bg-white rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all border border-gray-100/50 p-6">
                       <div className="aspect-[4/5] relative overflow-hidden rounded-[30px] mb-8 bg-gray-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                       </div>
                       <h3 className="text-xl font-serif font-bold uppercase tracking-tight">{item.name}</h3>
                       <p className="text-2xl font-serif font-bold text-[var(--indian-maroon)] mt-2 italic">₹{Number(item.price).toLocaleString()}</p>
                       <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 mt-4 italic">{item.category} • {item.sizes?.join(', ')}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-fade-in-up space-y-6">
              <h2 className="text-3xl font-serif font-bold uppercase italic mb-12 border-b-2 border-[var(--indian-gold)]/20 pb-2">Live Feed</h2>
              {orders.map(order => (
                 <div key={order.id} className="bg-white p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                    <div className="flex-1">
                       <h4 className="text-xl font-serif font-bold uppercase tracking-tight">{order.user}</h4>
                       <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-2">{order.id} • {order.date}</p>
                    </div>
                    <div className="bg-gray-50 text-gray-300 text-[10px] font-bold uppercase tracking-[0.4em] px-8 py-3 rounded-full border border-gray-100">{order.status}</div>
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
               <div className="flex flex-col md:flex-row justify-between mb-12 border-b pb-10">
                  <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase text-[var(--indian-gold)] mb-3 tracking-[0.5em]">Process Registry</p>
                     <h2 className="text-4xl md:text-6xl font-serif font-bold italic uppercase leading-none mb-4">{selectedOrder.user}</h2>
                     <p className="text-xs text-gray-300 font-bold tracking-widest uppercase">{selectedOrder.id}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[30px] border border-gray-100 flex flex-col gap-4">
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">Status Protocol</p>
                     <div className="grid grid-cols-2 gap-2">
                        {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                           <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-2.5 rounded-full text-[8px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[var(--indian-maroon)] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{st}</button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="Courier Provider" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white border border-gray-200 rounded-2xl py-5 px-8 text-sm outline-none focus:border-[var(--indian-gold)] italic font-serif shadow-inner" />
                    <input type="text" placeholder="AWB Tracking ID" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white border border-gray-200 rounded-2xl py-5 px-8 text-sm outline-none focus:border-[var(--indian-gold)] italic font-serif shadow-inner" />
                  </div>
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id.replace('#', ''), selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-7 rounded-full font-bold uppercase text-[13px] tracking-[0.4em] shadow-[0_15px_40px_rgba(128,0,0,0.3)] hover:scale-[1.02] transition-all">Registry Confirmation</button>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-400 text-xl">✕</button>
            </div>
         </div>
      )}
    </div>
  );
}
