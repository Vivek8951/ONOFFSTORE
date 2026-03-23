'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './config/supabase';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const CATEGORIES = ['Fusion', 'Heritage', 'Cargo', 'Essentials', 'Accessories'];

export default function AdminDashboard() {
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
      console.error('Archive Sync Failed:', err.message);
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

  const toggleSize = (size: string) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.image) return alert('Atelier Signal: Image Protocol Required.');

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
    } catch (err) { alert('Registry Error: Could not save piece.'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const { error } = await supabase.from('orders').update({ order_status: status, shipping_details: { courier, trackingId } }).eq('id', orderId);
        if (error) throw error;
        setSelectedOrder(null); fetchArchive(true); alert('Protocol Updated Successfully.');
     } catch (err) { alert('Registry Update Fail.'); }
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
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0b] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl">unlock vault</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0a0a0b] font-sans pb-32 md:pb-0 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `.gold-glow { text-shadow: 0 0 15px rgba(212,175,55,0.3); } @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; } .no-scrollbar::-webkit-scrollbar { display: none; }`}} />

      {isSyncing && (
         <div className="fixed top-12 left-6 z-[500] bg-green-500 text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            STANDALONE NODE SYNC
         </div>
      )}

      <header className="pt-20 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37] mb-4 italic">Registry Center</p>
            <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter uppercase leading-none">THE <span className="text-[#800000] gold-glow uppercase">HUB</span></h1>
         </div>
         <div className="flex gap-4">
            {['inventory', 'orders'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[#800000] text-[#d4af37] shadow-xl' : 'bg-white text-gray-400 border'}`}>{tab}</button>
            ))}
         </div>
      </header>

      <main className="px-6 md:px-12 max-w-7xl mx-auto py-20 pb-40">
         {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-10 pb-4 border-b">
                <h2 className="text-2xl font-serif font-bold italic uppercase tracking-widest">Archive Vault</h2>
                <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); }} className="bg-[#0a0a0b] text-white px-10 py-5 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-[#800000] transition-colors">{isAddingProduct ? 'Hide Registry' : '+ Register Piece'}</button>
              </div>

              {isAddingProduct && (
                <form onSubmit={handleSaveProduct} className="bg-white p-10 md:p-16 rounded-[60px] mb-20 shadow-2xl border-2 border-[#d4af37]/10 animate-fade-in-up">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-10">
                         <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Name</label>
                            <input type="text" placeholder="Creation Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b py-2 outline-none italic font-serif text-xl" required />
                         </div>
                         <div className="grid grid-cols-2 gap-10">
                            <div>
                               <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Price (₹)</label>
                               <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b py-2 outline-none italic font-serif text-xl" required />
                            </div>
                            <div>
                               <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Stock</label>
                               <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b py-2 outline-none italic font-serif text-xl" required />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Category Protocol</label>
                            <div className="flex flex-wrap gap-2">
                               {CATEGORIES.map(cat => (
                                  <button key={cat} type="button" onClick={() => setNewProduct({...newProduct, category: cat})} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase transition-all ${newProduct.category === cat ? 'bg-[#800000] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>{cat}</button>
                               ))}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-10">
                         <div className="space-y-4">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Dimensions (Sizes)</label>
                            <div className="flex flex-wrap gap-2">
                               {AVAILABLE_SIZES.map(sz => (
                                  <button key={sz} type="button" onClick={() => toggleSize(sz)} className={`w-10 h-10 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center border-2 ${newProduct.sizes.includes(sz) ? 'bg-[#0a0a0b] border-[#d4af37] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-300'}`}>{sz}</button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-300">Visual Capture</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-gray-50 p-4 rounded-2xl text-[10px] font-bold uppercase text-gray-400" />
                         </div>
                         <textarea placeholder="The design character and details..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50/50 p-6 rounded-[30px] h-32 outline-none text-sm font-serif italic" />
                      </div>
                   </div>
                   <button type="submit" className="w-full mt-16 bg-[#800000] text-[#d4af37] py-6 rounded-full font-bold uppercase text-[12px] tracking-[0.4em] shadow-xl hover:scale-105 transition-all">Publish Piece to Registry</button>
                </form>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {inventory.map(item => (
                    <div key={item.id} className="bg-white rounded-[30px] overflow-hidden group border border-gray-100 p-4">
                       <img src={item.image} className="w-full aspect-[4/5] object-cover rounded-[20px] mb-4 group-hover:scale-105 transition-transform duration-700" />
                       <h3 className="text-sm font-serif font-bold uppercase">{item.name}</h3>
                       <p className="text-lg font-bold text-[#800000] mb-2 font-serif italic">₹{Number(item.price).toLocaleString()}</p>
                       <p className="text-[8px] font-bold uppercase text-gray-300 tracking-tighter">{item.sizes?.join(', ')}</p>
                    </div>
                 ))}
              </div>
           </div>
         )}

         {activeTab === 'orders' && (
           <div className="animate-fade-in-up space-y-6">
              <h2 className="text-2xl font-serif font-bold italic uppercase mb-10 pb-4 border-b">Live Feed Registry</h2>
              {orders.map(order => (
                 <div key={order.id} className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                    <div className="flex-1">
                       <h4 className="text-xl font-serif font-bold uppercase">{order.user}</h4>
                       <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mt-2">{order.id} • {order.date}</p>
                    </div>
                    <div className="bg-gray-50 text-gray-300 text-[9px] font-bold uppercase tracking-widest px-6 py-2 rounded-full border border-gray-100">{order.status}</div>
                    <p className="text-2xl font-serif font-bold italic text-[#800000]">{order.total}</p>
                    <button onClick={() => setSelectedOrder(order)} className="bg-[#0a0a0b] text-white p-4 rounded-full hover:scale-110 shadow-lg transition-all active:scale-95"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                 </div>
              ))}
           </div>
         )}
      </main>

      {/* MODAL FOR STATUS UPDATE */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#0a0a0b]/95 backdrop-blur-xl animate-fade-in-up">
            <div className="absolute inset-0" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-4xl bg-[#faf9f6] rounded-[60px] p-8 md:p-16 shadow-2xl border-2 border-[#d4af37]/30 my-auto pointer-events-auto max-h-[90vh] overflow-y-auto no-scrollbar">
               <div className="flex flex-col md:flex-row justify-between mb-10 border-b pb-10 gap-10">
                  <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase text-[#d4af37] mb-3 tracking-[0.5em]">Process Registry</p>
                     <h2 className="text-4xl md:text-5xl font-serif font-bold italic uppercase leading-none mb-4">{selectedOrder.user}</h2>
                     <p className="text-xs text-gray-300 font-bold tracking-widest uppercase">{selectedOrder.id}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[30px] border border-gray-100 flex flex-col gap-4">
                     <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">Protocol Progress</p>
                     <div className="grid grid-cols-2 gap-2">
                        {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                           <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-2.5 rounded-full text-[8px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[#800000] text-[#d4af37] shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{st}</button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="Courier Hub" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white border border-gray-200 rounded-2xl py-5 px-8 text-sm outline-none focus:border-[#d4af37] italic font-serif shadow-inner" />
                    <input type="text" placeholder="Tracking Number" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white border border-gray-200 rounded-2xl py-5 px-8 text-sm outline-none focus:border-[#d4af37] italic font-serif shadow-inner" />
                  </div>
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id.replace('#', ''), selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[#800000] text-[#d4af37] py-6 rounded-full font-bold uppercase text-[12px] tracking-[0.4em] shadow-xl hover:scale-102 transition-all">Registry Confirmation</button>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-300 text-xl">✕</button>
            </div>
         </div>
      )}
    </div>
  );
}
