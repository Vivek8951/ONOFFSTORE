'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './config/supabase';

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
      // 🚀 SUPABASE HIGH-SPEED SYNC: Standalone Admin Node
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
      console.error('Atelier Supabase Node Failure:', err.message);
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
    } catch (err) { alert('Supabase Hub Reject'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const { error } = await supabase.from('orders')
           .update({ 
              order_status: status, 
              shipping_details: { courier, trackingId } 
           })
           .eq('id', orderId);

        if (error) throw error;
        setSelectedOrder(null); fetchArchive(true); alert('Registry Update Success.');
     } catch (err) { alert('Registry Update Failed'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6">
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
         <div className="fixed top-12 left-6 z-[500] bg-green-500 text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl animate-fade-in-up flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            Supabase Standalone Node Connected
         </div>
      )}

      <header className="pt-20 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37] mb-4 italic">Command Center</p>
            <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter uppercase leading-none">THE <span className="text-[#800000] gold-glow uppercase">HUB</span></h1>
         </div>
         <div className="flex gap-4">
            {['inventory', 'orders', 'banners'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[#800000] text-[#d4af37] shadow-xl' : 'bg-white text-gray-400 border'}`}>{tab}</button>
            ))}
         </div>
      </header>

      <main className="px-6 md:px-12 max-w-7xl mx-auto py-20 pb-40">
         {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-serif font-bold italic uppercase">Showroom</h2>
                <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); }} className="bg-[#0a0a0b] text-white px-10 py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-xl">{isAddingProduct ? 'Hide' : '+ Add Creation'}</button>
              </div>

              {isAddingProduct && (
                <form onSubmit={handleSaveProduct} className="bg-white p-10 rounded-[50px] mb-20 shadow-2xl border border-gray-100 animate-fade-in-up">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <input type="text" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b py-2 outline-none italic font-serif" required />
                         <input type="number" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b py-2 outline-none italic font-serif" required />
                      </div>
                      <div className="flex flex-col gap-6">
                         <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50/50 p-6 rounded-[30px] h-32 outline-none text-xs" />
                         <button type="submit" className="w-full bg-[#800000] text-[#d4af37] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl">Archive Creation</button>
                      </div>
                   </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {inventory.map(item => (
                    <div key={item.id} className="bg-white rounded-[40px] overflow-hidden group border border-gray-100 p-6">
                       <img src={item.image} className="w-full aspect-square object-cover rounded-[30px] mb-6" />
                       <h3 className="text-lg font-serif font-bold uppercase">{item.name}</h3>
                       <p className="text-xl font-bold text-[#800000] italic">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                 ))}
              </div>
           </div>
         )}

         {activeTab === 'orders' && (
           <div className="animate-fade-in-up space-y-6">
              {orders.map(order => (
                 <div key={order.id} className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                    <div className="flex-1">
                       <h4 className="text-xl font-serif font-bold uppercase">{order.user}</h4>
                       <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mt-2">{order.id} • {order.date}</p>
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
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#0a0a0b]/95 backdrop-blur-xl animate-fade-in-up">
            <div className="absolute inset-0" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-4xl bg-[#faf9f6] rounded-[60px] p-8 md:p-16 shadow-2xl border-2 border-[#d4af37]/30 my-auto pointer-events-auto max-h-[90vh] overflow-y-auto no-scrollbar">
               <div className="flex flex-col md:flex-row justify-between gap-12 mb-10 border-b pb-10">
                  <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase text-[#d4af37] mb-3 tracking-[0.5em]">Process Registry</p>
                     <h2 className="text-4xl md:text-5xl font-serif font-bold italic uppercase leading-none mb-4">{selectedOrder.user}</h2>
                     <p className="text-xs text-gray-300 font-bold tracking-widest uppercase">{selectedOrder.id}</p>
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
                  <div className="space-y-6">
                    <input type="text" placeholder="Courier Provider" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#d4af37] italic font-serif shadow-inner" />
                    <input type="text" placeholder="AWB Tracking ID" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#d4af37] italic font-serif shadow-inner" />
                  </div>
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id.replace('#', ''), selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[#800000] text-[#d4af37] py-6 rounded-full font-bold uppercase text-[12px] tracking-[0.4em] shadow-[0_15px_40px_rgba(128,0,0,0.3)] hover:scale-[1.02] transition-all">Registry Confirmation</button>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-300 text-xl">✕</button>
            </div>
         </div>
      )}
    </div>
  );
}
