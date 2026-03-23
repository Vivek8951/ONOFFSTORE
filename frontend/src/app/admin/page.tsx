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
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: 0,
    image: '',
    sizes: ['M'],
    category: 'Fusion',
    description: ''
  });

  const fetchArchive = async () => {
    try {
      const pRes = await fetch(`${API_URL}/api/products`);
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

      const oRes = await fetch(`${API_URL}/api/orders/admin/all`);
      const oData = await oRes.json();
      setOrders(oData.map((o: any) => ({
        id: `#${o._id.slice(-6).toUpperCase()}`,
        _id: o._id,
        user: o.customerDetails?.name || 'Member',
        total: `₹${o.totalAmount}`,
        status: o.orderStatus || 'Pending',
        item: o.items?.[0]?.name || 'Luxury Archive',
        date: new Date(o.createdAt).toLocaleString(),
        customerDetails: o.customerDetails,
        isArchived: o.isArchived || false
      })));
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
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        setIsAddingProduct(false);
        fetchArchive();
        setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });
      }
    } catch (err) { alert('Failed to Publish Piece'); }
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
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans">
      <Navbar />

      <main className="pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Admin Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 animate-fade-in-up">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4">Elite Control Center</p>
              <h1 className="text-5xl md:text-7xl font-serif font-bold italic tracking-tighter">ATELIER<span className="text-[var(--indian-maroon)] gold-glow"> HUB</span></h1>
           </div>
           
           <div className="flex gap-4">
              <button 
                 onClick={() => setActiveTab('inventory')}
                 className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === 'inventory' ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400'}`}
              >
                 Vault
              </button>
              <button 
                 onClick={() => setActiveTab('orders')}
                 className={`px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === 'orders' ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400'}`}
              >
                 Orders
              </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
           {[
             { label: 'Revenue', value: `₹${orders.reduce((acc, o) => acc + parseInt(o.total.replace('₹','').replace(',','')), 0).toLocaleString()}` },
             { label: 'Orders', value: orders.length },
             { label: 'Pieces', value: inventory.length },
             { label: 'Members', value: orders.length + 42 }
           ].map((stat, i) => (
              <div key={i} className="glass-card p-10 rounded-[40px] border border-gray-100 animate-fade-in-up" style={{ animationDelay: `${i*0.1}s` }}>
                 <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">{stat.label}</p>
                 <p className="text-4xl font-serif font-bold italic tracking-tight">{stat.value}</p>
              </div>
           ))}
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
                          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                             <button className="bg-white/80 backdrop-blur-md p-3 rounded-full text-[var(--indian-maroon)] hover:bg-[var(--indian-gold)] transition-all shadow-lg text-sm">✎</button>
                             <button className="bg-white/80 backdrop-blur-md p-3 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg text-sm">✕</button>
                          </div>
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
                       
                       <button className="bg-[var(--indian-midnight)] text-white p-5 rounded-full hover:bg-[var(--indian-gold)] transition-all">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* ADMIN BOTTOM COMMAND BAR (MOBILE) */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 glass-midnight rounded-full border border-white/10 p-4 flex justify-around items-center shadow-2xl z-[200]">
         <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 p-3 rounded-full transition-all ${activeTab === 'inventory' ? 'bg-[var(--indian-gold)] text-[var(--indian-midnight)] scale-110 shadow-lg' : 'text-white/40'}`}>
            <span className="text-xl leading-none">📦</span>
            <span className="text-[7px] font-bold uppercase tracking-widest">Vault</span>
         </button>
         <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1 p-3 rounded-full transition-all ${activeTab === 'orders' ? 'bg-[var(--indian-gold)] text-[var(--indian-midnight)] scale-110 shadow-lg' : 'text-white/40'}`}>
            <span className="text-xl leading-none">⚡</span>
            <span className="text-[7px] font-bold uppercase tracking-widest">Orders</span>
         </button>
      </nav>
    </div>
  );
}
