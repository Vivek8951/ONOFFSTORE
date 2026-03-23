'use client';

import { useState, useEffect } from 'react';
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
  const [isAddingBanner, setIsAddingBanner] = useState(false);
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
    if (password === 'admin123') setIsAuthenticated(true);
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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 selection:bg-[#d4af37]">
        <style dangerouslySetInnerHTML={{ __html: `
          .gold-glow { text-shadow: 0 0 20px rgba(212,175,55,0.4); }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
        <div className="w-full max-w-md animate-fade-in-up">
           <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold italic tracking-[0.4em] text-[#d4af37] mb-4 gold-glow uppercase">ONOFF</h1>
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Vault Access Required</p>
           </div>
           
           <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
              <input 
                 type="password" 
                 placeholder="Security Code" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-white/5 border-b-2 border-white/10 py-4 px-6 text-white text-center outline-none focus:border-[#d4af37] transition-all mb-8 tracking-[1em]"
                 autoFocus
              />
              <button 
                 type="submit" 
                 className="w-full bg-[#d4af37] text-[#0a0a0b] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
              >
                 unlock vault
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0a0a0b] font-sans pb-32 md:pb-0">
      <style dangerouslySetInnerHTML={{ __html: `
        .gold-glow { text-shadow: 0 0 15px rgba(212,175,55,0.3); }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />

      {/* ADMIN HEADER */}
      <header className="pt-20 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37] mb-4 italic">Command Center</p>
            <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter leading-none">THE <span className="text-[#800000] gold-glow">HUB</span></h1>
         </div>
         <div className="hidden md:flex gap-4">
            {['inventory', 'orders', 'banners'].map(tab => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[#800000] text-[#d4af37] shadow-xl' : 'bg-white text-gray-400 border'}`}
               >
                  {tab}
               </button>
            ))}
         </div>
      </header>

      <main className="px-6 md:px-12 max-w-7xl mx-auto py-20">
        {activeTab === 'inventory' && (
           <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-serif font-bold uppercase italic">Manage Archive</h2>
                 <button onClick={() => setIsAddingProduct(!isAddingProduct)} className="bg-[#0a0a0b] text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#d4af37] transition-all shadow-xl">
                   {isAddingProduct ? 'Cancel' : '+ New commission'}
                 </button>
              </div>

              {isAddingProduct && (
                 <form onSubmit={handleSaveProduct} className="bg-white p-12 rounded-[50px] border-2 border-[#d4af37]/20 shadow-2xl mb-20 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <input type="text" placeholder="Piece Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[#d4af37] transition-all" required />
                       <input type="text" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[#d4af37] transition-all" required />
                       <input type="number" placeholder="Stock Level" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[#d4af37] transition-all" required />
                       <div className="pt-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Available Sizes</p>
                          <div className="flex gap-2">
                             {AVAILABLE_SIZES.map(sz => (
                                <button key={sz} type="button" onClick={() => {
                                   const newSizes = newProduct.sizes.includes(sz) ? newProduct.sizes.filter(s => s !== sz) : [...newProduct.sizes, sz];
                                   setNewProduct({...newProduct, sizes: newSizes});
                                }} className={`w-10 h-10 rounded-full text-[10px] font-bold transition-all border ${newProduct.sizes.includes(sz)?'bg-[#800000] text-[#d4af37] border-transparent':'bg-white text-gray-300 border-gray-100'}`}>{sz}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="flex flex-col gap-8">
                       <textarea placeholder="The design story..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[30px] h-40 outline-none focus:border-[#d4af37]/30 transition-all font-serif italic" />
                       <input type="text" placeholder="Main Visual URL" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-3 text-xs font-bold italic outline-none focus:border-[#d4af37]" />
                       <button type="submit" className="w-full bg-[#800000] text-[#d4af37] py-6 rounded-full font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-[#d4af37] hover:text-white transition-all shadow-xl">Publish to Archive</button>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 {inventory.map(item => (
                    <div key={item.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all">
                       <div className="aspect-square relative overflow-hidden bg-gray-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                       </div>
                       <div className="p-8">
                          <h3 className="text-xl font-serif font-bold uppercase tracking-tight mb-2">{item.name}</h3>
                          <div className="flex justify-between items-center">
                             <p className="text-2xl font-serif font-bold text-[#800000]">₹{Number(item.price).toLocaleString()}</p>
                             <div className="bg-gray-100 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-400">STOCK: {item.stock}</div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-fade-in-up">
              <h2 className="text-3xl font-serif font-bold uppercase italic mb-12">Open Commissions</h2>
              <div className="space-y-6">
                 {orders.map(order => (
                    <div key={order.id} className="bg-white p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all">
                       <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold uppercase tracking-tight">{order.user}</h4>
                          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mt-1">{order.id} • {order.date}</p>
                       </div>
                       <div className="flex-1 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] px-8 py-3 rounded-full border ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                             {order.status}
                          </span>
                       </div>
                       <div className="flex-1 text-right">
                          <p className="text-2xl font-serif font-bold italic text-[#800000]">{order.total}</p>
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
                 <button onClick={() => setIsAddingBanner(!isAddingBanner)} className="bg-[#0a0a0b] text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#d4af37] transition-all shadow-xl">
                   {isAddingBanner ? 'Cancel' : '+ New Display Drop'}
                 </button>
              </div>

              {isAddingBanner && (
                 <form onSubmit={handleSaveBanner} className="bg-white p-12 rounded-[50px] border-2 border-[#d4af37]/20 shadow-2xl mb-20 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <input type="text" placeholder="Banner Title" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[#d4af37] transition-all" required />
                       <input type="text" placeholder="Main Visual URL" value={newBanner.image} onChange={e => setNewBanner({...newBanner, image: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-sm font-bold italic outline-none focus:border-[#d4af37]" required />
                    </div>
                    <div className="flex flex-col justify-end">
                       <button type="submit" className="w-full bg-[#800000] text-[#d4af37] py-6 rounded-full font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-[#d4af37] hover:text-white transition-all shadow-xl">Activate Display</button>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 gap-12">
                 {banners.map(banner => (
                    <div key={banner._id} className="bg-white rounded-[50px] overflow-hidden relative h-[400px] border border-gray-100">
                       <img src={banner.image} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-12 text-white">
                          <h3 className="text-4xl md:text-6xl font-serif font-bold italic tracking-tighter mb-8">{banner.title}</h3>
                          <div className="flex gap-4">
                             <button onClick={() => handleDeleteBanner(banner._id)} className="px-10 py-4 bg-red-600/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all">Abort Display</button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}
      </main>

      {/* ELITE BOTTOM COMMAND BAR (MOBILE) */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 bg-[#0a0a0b]/90 backdrop-blur-3xl rounded-full border border-white/10 p-4 flex justify-around items-center shadow-2xl z-[200]">
         {['inventory', 'orders', 'banners'].map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)} 
               className={`flex flex-col items-center gap-1 p-3 rounded-full transition-all ${activeTab === tab ? 'bg-[#d4af37] text-[#0a0a0b] scale-110 shadow-lg' : 'text-white/40'}`}
            >
               <span className="text-[7px] font-bold uppercase tracking-widest">{tab.slice(0,4)}</span>
            </button>
         ))}
      </nav>
    </div>
  );
}
