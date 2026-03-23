'use client';

import { useState, useEffect } from 'react';
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
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: 0,
    image: '',
    sizes: ['M'] as string[],
    category: 'Fusion',
    description: ''
  });

  const [newBanner, setNewBanner] = useState({ title: '', image: '', linkProductId: '', active: true });
  const [newDiscount, setNewDiscount] = useState({ code: '', amount: '', type: 'percentage', active: true });

  const fetchArchive = async () => {
    try {
      const pRes = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
      const pData = await pRes.json();
      setInventory(pData.map((p: any) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        image: p.image,
        sizes: p.sizes || ['S', 'M', 'L'],
        category: p.category,
        description: p.description
      })));

      const oRes = await fetch(`${API_URL}/api/orders/admin/all`, { cache: 'no-store' });
      const oData = await oRes.json();
      setOrders(oData.map((o: any) => ({
        id: `#${o._id.slice(-6).toUpperCase()}`,
        _id: o._id,
        user: o.customerDetails?.name || 'Member',
        total: `₹${o.totalAmount}`,
        status: o.orderStatus || 'Pending',
        item: o.items?.[0]?.name || 'Luxury Archive',
        date: new Date(o.createdAt).toLocaleString(),
        customerDetails: o.customerDetails
      })));

      const bRes = await fetch(`${API_URL}/api/banners/admin/all`, { cache: 'no-store' });
      const bData = await bRes.json();
      setBanners(bData);

      // We'll mock discounts for now as there isn't a solid backend endpoint for them yet in the viewed code
      setDiscounts([
        { code: 'OFFER10', amount: '10', type: 'percentage', active: true },
        { code: 'VIP20', amount: '20', type: 'fixed', active: true }
      ]);
    } catch (err: any) {
      console.error('Atelier Sync Failed:', err.message);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchArchive();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'onoffadmin') setIsAuthenticated(true);
    else alert('Invalid Access Code');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseInt(newProduct.price as any),
          stock: parseInt(newProduct.stock as any)
        })
      });
      if (res.ok) {
        setIsAddingProduct(false);
        fetchArchive();
        setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });
      }
    } catch (err) { alert('Failed to Publish Piece'); }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        setIsAddingBanner(false);
        fetchArchive();
        setNewBanner({ title: '', image: '', linkProductId: '', active: true });
      }
    } catch (err) { alert('Failed to Publish Banner'); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Abort this banner?')) return;
    try {
      await fetch(`${API_URL}/api/banners/${id}`, { method: 'DELETE' });
      fetchArchive();
    } catch (err) { alert('Delete Failure'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--indian-midnight)] flex items-center justify-center p-6 selection:bg-[var(--indian-gold)]">
        <div className="w-full max-w-md animate-fade-in-up">
           <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold italic tracking-[0.4em] text-[var(--indian-gold)] mb-4 gold-glow">ONOFF</h1>
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Vault Access Required</p>
           </div>
           
           <form onSubmit={handleLogin} className="glass-midnight p-10 rounded-[40px] border border-white/10 shadow-2xl">
              <input 
                 type="password" 
                 placeholder="Security Code" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-white/5 border-b-2 border-white/10 py-4 px-6 text-white text-center outline-none focus:border-[var(--indian-gold)] transition-all mb-8 tracking-[1em]"
                 autoFocus
              />
              <button 
                 type="submit" 
                 className="w-full bg-[var(--indian-gold)] text-[var(--indian-midnight)] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
              >
                 unlock vault
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans pb-32 md:pb-0">
      <Navbar />

      <main className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Admin Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 animate-fade-in-up">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4">Elite Control Center</p>
              <h1 className="text-5xl md:text-7xl font-serif font-bold italic tracking-tighter">ATELIER<span className="text-[var(--indian-maroon)] gold-glow"> HUB</span></h1>
           </div>
           
           <div className="flex flex-wrap gap-4">
              {['inventory', 'orders', 'banners', 'discounts'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400'}`}
                 >
                    {tab}
                 </button>
              ))}
           </div>
        </div>

        {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-serif font-bold uppercase italic">Manage Archive</h2>
                 <button 
                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                    className="bg-[var(--indian-midnight)] text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:scale-105 transition-all shadow-xl"
                 >
                    {isAddingProduct ? 'Cancel Drop' : '+ New Commission Piece'}
                 </button>
              </div>

              {isAddingProduct && (
                 <form onSubmit={handleSaveProduct} className="glass-card p-12 rounded-[50px] mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-2 border-[var(--indian-gold)]/20 shadow-2xl animate-fade-in-up">
                    <div className="space-y-8">
                       <input type="text" placeholder="Piece Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="text" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       
                       <div className="pt-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Atelier Sizes</p>
                          <div className="flex gap-2">
                             {AVAILABLE_SIZES.map(sz => (
                                <button key={sz} type="button" onClick={() => {
                                   const newSizes = newProduct.sizes.includes(sz) ? newProduct.sizes.filter(s => s !== sz) : [...newProduct.sizes, sz];
                                   setNewProduct({...newProduct, sizes: newSizes});
                                }} className={`w-10 h-10 rounded-full text-[10px] font-bold transition-all border ${newProduct.sizes.includes(sz)?'bg-[var(--indian-maroon)] text-white border-transparent':'bg-white text-gray-300 border-gray-100'}`}>{sz}</button>
                             ))}
                          </div>
                       </div>

                       <div className="pt-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Archive Category</p>
                          <div className="flex gap-4">
                             {['Apparel', 'Cargo', 'Accessories', 'Fusion'].map(c => (
                                <button key={c} type="button" onClick={() => setNewProduct({...newProduct, category: c})} className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase transition-all ${newProduct.category === c ? 'bg-[var(--indian-gold)] text-white' : 'bg-gray-100 text-gray-400'}`}>{c}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-8">
                       <textarea placeholder="The Story behind this piece..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[30px] h-40 outline-none border border-transparent focus:border-[var(--indian-gold)]/30 transition-all font-serif italic" />
                       <input type="text" placeholder="Image URL (or upload below)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-sm font-bold italic outline-none focus:border-[var(--indian-gold)] transition-all" />
                       <button type="submit" className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:text-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)]">Publish to Archive</button>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 {inventory.map(item => (
                    <div key={item.id} className="glass-card rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all border border-gray-100/50">
                       <div className="aspect-square bg-gray-50 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                          <div className="absolute bottom-6 left-6 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-[var(--indian-maroon)]">
                             <p className="text-[8px] font-bold uppercase tracking-widest mb-1 opacity-60">Inventory</p>
                             <p className="text-xl font-serif font-bold italic tracking-tighter">{item.stock}</p>
                          </div>
                       </div>
                       <div className="p-8">
                          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--indian-gold)] mb-2 italic">{item.category}</p>
                          <h3 className="text-xl font-serif font-bold uppercase tracking-tight mb-2">{item.name}</h3>
                          <p className="text-2xl font-serif font-bold text-[var(--indian-maroon)]">₹{Number(item.price).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-fade-in-up">
              <h2 className="text-3xl font-serif font-bold uppercase italic mb-12">Commissions Feed</h2>
              <div className="space-y-6">
                 {orders.map(order => (
                    <div key={order.id} className="glass-card p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                       <div className="flex items-center gap-8 flex-1">
                          <div className="w-16 h-16 glass-midnight rounded-full flex items-center justify-center text-[var(--indian-gold)] font-bold tracking-tighter shadow-xl">
                             {order.id.slice(1,3)}
                          </div>
                          <div>
                             <h4 className="text-xl font-serif font-bold uppercase tracking-tight">{order.user}</h4>
                             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-1">{order.id} • {order.date}</p>
                          </div>
                       </div>
                       
                       <div className="flex-1 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--indian-gold)] mb-1">Status</p>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.4em] px-6 py-2 rounded-full ring-1 ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600 ring-amber-200' : 'bg-green-50 text-green-600 ring-green-200'}`}>
                             {order.status}
                          </span>
                       </div>

                       <div className="flex-1 text-right">
                          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-1">Total Commission</p>
                          <p className="text-2xl font-serif font-bold italic text-[var(--indian-maroon)]">{order.total}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'banners' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-serif font-bold uppercase italic">Hero Displays</h2>
                 <button 
                    onClick={() => setIsAddingBanner(!isAddingBanner)}
                    className="bg-[var(--indian-midnight)] text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:scale-105 transition-all shadow-xl"
                 >
                    {isAddingBanner ? 'Cancel' : '+ New Banner Drop'}
                 </button>
              </div>

              {isAddingBanner && (
                 <form onSubmit={handleSaveBanner} className="glass-card p-12 rounded-[50px] mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-2 border-[var(--indian-gold)]/20 shadow-2xl animate-fade-in-up">
                    <div className="space-y-8">
                       <input type="text" placeholder="Banner Title" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="text" placeholder="Banner Visual URL" value={newBanner.image} onChange={e => setNewBanner({...newBanner, image: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-sm font-bold italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <select value={newBanner.linkProductId} onChange={e => setNewBanner({...newBanner, linkProductId: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-sm font-bold italic outline-none focus:border-[var(--indian-gold)]">
                          <option value="">Link to Product (None)</option>
                          {inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>
                    <div className="flex flex-col justify-end">
                       <button type="submit" className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-xl">Activate Display</button>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 gap-12">
                 {banners.map(banner => (
                    <div key={banner._id} className="glass-card rounded-[50px] overflow-hidden relative h-[400px] border border-gray-100">
                       <img src={banner.image} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-12 text-white">
                          <h3 className="text-4xl md:text-6xl font-serif font-bold italic tracking-tighter mb-8">{banner.title}</h3>
                          <div className="flex gap-4">
                             <button onClick={() => handleDeleteBanner(banner._id)} className="px-8 py-3 bg-red-600/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">Delete Drop</button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'discounts' && (
           <div className="animate-fade-in-up">
              <h2 className="text-3xl font-serif font-bold uppercase italic mb-12">Privilege Codes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {discounts.map(d => (
                    <div key={d.code} className="glass-card p-10 rounded-[40px] border border-gray-100 text-center relative overflow-hidden group">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[var(--indian-gold)]"></div>
                       <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4 italic">Active Privilege</p>
                       <h3 className="text-4xl font-serif font-bold tracking-widest text-[var(--indian-maroon)] mb-2">{d.code}</h3>
                       <p className="text-sm font-bold text-gray-400 mb-8">{d.type === 'percentage' ? `${d.amount}% OFF` : `₹${d.amount} OFF`}</p>
                       <button className="text-[9px] font-bold uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-all">Deactivate Code</button>
                    </div>
                 ))}
              </div>
           </div>
        )}

      </main>

      {/* ADMIN BOTTOM COMMAND BAR (MOBILE) */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 glass-midnight rounded-full border border-white/10 p-4 flex justify-around items-center shadow-2xl z-[200]">
         {['inventory', 'orders', 'banners', 'discounts'].map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)} 
               className={`flex flex-col items-center gap-1 p-3 rounded-full transition-all ${activeTab === tab ? 'bg-[var(--indian-gold)] text-[var(--indian-midnight)] scale-110 shadow-lg' : 'text-white/40'}`}
            >
               <span className="text-[7px] font-bold uppercase tracking-widest">{tab.slice(0,4)}</span>
            </button>
         ))}
      </nav>
    </div>
  );
}
