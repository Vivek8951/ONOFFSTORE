'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../../config/api';
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
        id: `#${o._id.slice(-6).toUpperCase()}`, _id: o._id, user: o.customerDetails?.name || 'Member', email: o.customerDetails?.email, phone: o.customerDetails?.phone, address: o.customerDetails?.address, total: `₹${o.totalAmount}`, status: o.orderStatus || 'Pending', items: o.items || [], date: new Date(o.createdAt).toLocaleString(), courier: o.shippingDetails?.courier || '', trackingId: o.shippingDetails?.trackingId || '', customerDetails: o.customerDetails
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
    const url = isEditingProduct ? `${API_URL}/api/products/${isEditingProduct}` : `${API_URL}/api/products`;
    const method = isEditingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, price: parseInt(newProduct.price as any), stock: parseInt(newProduct.stock as any) })
      });
      if (res.ok) { setIsAddingProduct(false); setIsEditingProduct(null); fetchArchive(true); setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' }); }
    } catch (err) { alert('Failed to Publish Piece'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
           method: 'PUT', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status, courier, trackingId })
        });
        if (res.ok) { setSelectedOrder(null); fetchArchive(true); alert('Atelier Hub: Order Registry Updated Successfully.'); }
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

      {/* SYNC INDICATOR */}
      {isSyncing && (
         <div className="fixed top-28 left-6 z-[500] bg-[var(--indian-gold)] text-[var(--indian-midnight)] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl animate-fade-in-up flex items-center gap-3 border border-[var(--indian-midnight)]/10">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></span>
            ATELIER REALTIME SYNC
         </div>
      )}

      <main className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 animate-fade-in-up">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4 italic">Command Center</p>
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
                 <h2 className="text-3xl font-serif font-bold uppercase italic tracking-tighter">THE PIECES</h2>
                 <button onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' }); }} className="bg-[var(--indian-midnight)] text-white px-8 md:px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] transition-all shadow-xl">
                   {isAddingProduct ? 'Archive' : '+ Add Creation'}
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
                       <textarea placeholder="The design philosophy..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50/50 p-8 rounded-[30px] h-40 outline-none focus:border-[var(--indian-gold)]/30 transition-all font-serif italic" />
                       <div className="space-y-4">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-xs font-bold" />
                          <button type="submit" className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-xl">
                             {isEditingProduct ? 'Update Hub Entry' : 'Publish to Feed'}
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
                             <button onClick={() => { setIsEditingProduct(item.id); setIsAddingProduct(true); setNewProduct({...item, price: item.price.toString()}); }} className="bg-white/90 p-4 rounded-full shadow-xl text-lg hover:scale-110 transition-all">✎</button>
                          </div>
                          <div className="absolute top-6 left-6 bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-[var(--indian-gold)]/40">S: {item.stock}</div>
                       </div>
                       <div className="p-8">
                          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-[var(--indian-gold)] mb-3 italic">{item.category}</p>
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
              <h2 className="text-3xl font-serif font-bold uppercase italic mb-12">LIVE FEED</h2>
              <div className="space-y-6">
                 {orders.map(order => (
                    <div key={order._id} className="glass-card p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                       <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold uppercase tracking-tight">{order.user}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-2">#{order._id.slice(-6).toUpperCase()} • {order.date}</p>
                       </div>
                       <div className={`text-[10px] font-bold uppercase tracking-[0.4em] px-8 py-3 rounded-full border ${order.status === 'Accepted' || order.status === 'Processing' ? 'bg-[var(--indian-gold)]/10 text-[var(--indian-maroon)] border-[var(--indian-gold)]/30' : 'bg-gray-50 text-gray-300 border-gray-200'}`}>
                          {order.status}
                       </div>
                       <div className="flex items-center gap-8">
                          <p className="text-2xl font-serif font-bold italic text-[var(--indian-maroon)]">{order.total}</p>
                          <button onClick={() => setSelectedOrder(order)} className="bg-[var(--indian-midnight)] text-white p-4 rounded-full hover:scale-110 transition-all shadow-lg active:scale-95"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION: ULTRA ELITE */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 glass-midnight rounded-full border border-white/20 p-4 flex justify-around items-center shadow-2xl z-[500] pointer-events-auto">
         {[
            { id: 'inventory', label: 'Vault', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 3' },
            { id: 'orders', label: 'Feed', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9 M16 2v4 M22 2v4' },
            { id: 'banners', label: 'Ads', icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5' }
         ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1.5 p-3 rounded-full transition-all duration-500 ${activeTab === tab.id ? 'bg-[var(--indian-gold)] text-[var(--indian-midnight)] scale-125 shadow-[0_0_20px_var(--indian-gold)]' : 'text-white/40'}`}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={tab.icon.split(' ')[0]} />{tab.icon.split(' ')[1] && <path d={tab.icon.split(' ')[1]} />}</svg>
               <span className="text-[7px] font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
         ))}
      </nav>

      {/* MODAL FOR ORDER DETAILS */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
            <div className="fixed inset-0 bg-[#0a0a0b]/95 backdrop-blur-xl" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-5xl bg-[var(--indian-cream)] rounded-[60px] p-8 md:p-16 shadow-2xl border-2 border-[var(--indian-gold)]/30 animate-fade-in-up my-auto pointer-events-auto">
               <div className="flex flex-col md:flex-row justify-between gap-12 mb-16 pb-12 border-b border-gray-100">
                  <div className="flex-1">
                     <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4 italic">Purchase Archive Registry</p>
                     <h2 className="text-4xl md:text-7xl font-serif font-bold italic tracking-tighter uppercase leading-none mb-4">{selectedOrder.user}</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">#{selectedOrder._id.slice(-8).toUpperCase()} • {selectedOrder.date}</p>
                  </div>
                  <div className="flex flex-col gap-4 min-w-[300px]">
                     <button onClick={() => handleResendInvoice(selectedOrder._id)} className="w-full bg-white border border-[var(--indian-gold)]/20 text-[var(--indian-maroon)] py-5 rounded-full font-bold uppercase text-[9px] tracking-[0.3em] hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-md">Resend Digital Bill 📧</button>
                     <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-inner">
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Current Protocol Status</p>
                        <div className="grid grid-cols-2 gap-2">
                           {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                              <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-2.5 rounded-full text-[8px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[var(--indian-maroon)] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{st}</button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                  <div className="space-y-10">
                     <div className="bg-white/50 p-8 rounded-[40px] border border-gray-50 shadow-sm">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-6 text-[var(--indian-maroon)]">Shipping Coordinates</h3>
                        <div className="space-y-4 text-sm font-medium">
                           <p className="flex justify-between border-b pb-2"><span className="opacity-40">Recipient</span> {selectedOrder.user}</p>
                           <p className="flex justify-between border-b pb-2"><span className="opacity-40">Email</span> {selectedOrder.email}</p>
                           <p className="flex justify-between border-b pb-2"><span className="opacity-40">Phone</span> {selectedOrder.phone}</p>
                           <p className="mt-4 text-xs italic opacity-60 leading-relaxed font-serif">{selectedOrder.address}</p>
                        </div>
                     </div>
                     
                     <div className="bg-[var(--indian-midnight)] text-white p-8 rounded-[40px] border border-white/10">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-6 text-[var(--indian-gold)]">Logistics Registry</h3>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Courier Hub</label>
                              <input type="text" placeholder="e.g. Delhivery, BlueDart" value={selectedOrder.courier || ''} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white/5 border-b border-white/20 py-2 text-sm outline-none focus:border-[var(--indian-gold)] transition-all font-serif italic" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[8px] font-bold uppercase tracking-widest opacity-40">Tracking Signature</label>
                              <input type="text" placeholder="AWB Number" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white/5 border-b border-white/20 py-2 text-sm outline-none focus:border-[var(--indian-gold)] transition-all font-serif italic" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col">
                     <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl flex-1 mb-8 overflow-y-auto max-h-[300px] no-scrollbar">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-6 text-[var(--indian-gold)]">Ordered Pieces</h3>
                        <div className="space-y-6">
                           {selectedOrder.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4">
                                 <div>
                                    <p className="text-xs font-bold uppercase tracking-widest">{item.name}</p>
                                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Qty {item.quantity} • SZ {item.size}</p>
                                 </div>
                                 <p className="font-serif font-bold italic">₹{Number(item.price).toLocaleString()}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                     <button onClick={() => handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)} className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[12px] tracking-[0.4em] shadow-[0_15px_40px_rgba(128,0,0,0.3)] hover:scale-[1.02] transition-all">Registry Confirm Update</button>
                  </div>
               </div>
               
               <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[var(--indian-maroon)] hover:text-white transition-all">✕</button>
            </div>
         </div>
      )}
    </div>
  );
}
