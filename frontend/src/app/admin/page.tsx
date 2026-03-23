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
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
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
        email: o.customerDetails?.email,
        phone: o.customerDetails?.phone,
        address: o.customerDetails?.address,
        total: `₹${o.totalAmount}`,
        status: o.orderStatus || 'Pending',
        item: o.items?.[0]?.name || 'Luxury Archive',
        items: o.items || [],
        date: new Date(o.createdAt).toLocaleString(),
        courier: o.shippingDetails?.courier || '',
        trackingId: o.shippingDetails?.trackingId || '',
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
    if (password === 'onoffadmin') setIsAuthenticated(true);
    else alert('Invalid Access Code');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditingProduct ? `${API_URL}/api/products/${isEditingProduct}` : `${API_URL}/api/products`;
    const method = isEditingProduct ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseInt(newProduct.price as any),
          stock: parseInt(newProduct.stock as any)
        })
      });
      if (res.ok) {
        setIsAddingProduct(false);
        setIsEditingProduct(null);
        fetchArchive();
        setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' });
      }
    } catch (err) { alert('Failed to Publish Piece'); }
  };

  const handleEditProduct = (p: any) => {
     setNewProduct({
        name: p.name,
        price: p.price.toString(),
        stock: p.stock,
        image: p.image,
        sizes: p.sizes,
        category: p.category,
        description: p.description
     });
     setIsEditingProduct(p.id);
     setIsAddingProduct(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, courier: string, trackingId: string) => {
     try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status, courier, trackingId })
        });
        if (res.ok) {
           setSelectedOrder(null);
           fetchArchive();
           alert(`Order updated to: ${status}`);
        }
     } catch (err) { alert('Status Update Failed'); }
  };

  const handleResendInvoice = async (orderId: string, email: string) => {
     try {
        const res = await fetch(`${API_URL}/api/orders/resend-invoice`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ orderId, overrideEmail: email })
        });
        if (res.ok) alert('Atelier Hub: Digital Invoice dispatched!');
     } catch (err) { alert('Dispatch Failure'); }
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
              <h1 className="text-5xl md:text-8xl font-serif font-bold italic tracking-tighter">ATELIER<span className="text-[var(--indian-maroon)] gold-glow"> HUB</span></h1>
           </div>
           
           <div className="flex flex-wrap gap-4">
              {['inventory', 'orders', 'banners'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)] shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}
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
                    onClick={() => { setIsAddingProduct(!isAddingProduct); setIsEditingProduct(null); setNewProduct({ name: '', price: '', stock: 0, image: '', sizes: ['M'], category: 'Fusion', description: '' }); }}
                    className="bg-[var(--indian-midnight)] text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:scale-105 transition-all shadow-xl"
                 >
                    {isAddingProduct ? 'Cancel' : '+ New Piece'}
                 </button>
              </div>

              {isAddingProduct && (
                 <form onSubmit={handleSaveProduct} className="glass-card p-12 rounded-[50px] mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 border-2 border-[var(--indian-gold)]/20 shadow-2xl animate-fade-in-up">
                    <div className="space-y-8">
                       <input type="text" placeholder="Piece Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="text" placeholder="Price (₹)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       <input type="number" placeholder="Stock Level" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-transparent border-b-2 border-gray-100 py-4 text-xl font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all" required />
                       
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
                    </div>
                    
                    <div className="flex flex-col gap-8">
                       <textarea placeholder="The Story behind this piece..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-50 p-8 rounded-[30px] h-40 outline-none border border-transparent focus:border-[var(--indian-gold)]/30 transition-all font-serif italic" />
                       
                       <div className="space-y-4">
                          <input type="text" placeholder="Image URL (Manual)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-white border border-gray-100 py-4 px-6 rounded-2xl text-xs font-bold outline-none focus:border-[var(--indian-gold)] transition-all" />
                          <div className="relative group">
                             <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Upload Image" />
                             <div className="w-full bg-[var(--indian-gold)]/10 border-2 border-dashed border-[var(--indian-gold)]/30 py-4 text-center rounded-2xl text-[9px] font-bold uppercase tracking-widest text-[var(--indian-gold)] group-hover:bg-[var(--indian-gold)]/20 transition-all">
                                ☁️ Upload Visual File
                             </div>
                          </div>
                          {newProduct.image && (
                             <img src={newProduct.image} className="w-20 h-20 object-cover rounded-xl mt-4 border border-[var(--indian-gold)]/20 shadow-lg" alt="Preview" />
                          )}
                       </div>

                       <button type="submit" className="w-full bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-full font-bold uppercase text-[11px] tracking-[0.4em] hover:bg-[var(--indian-gold)] hover:text-white transition-all shadow-xl">
                          {isEditingProduct ? 'Update Piece' : 'Publish Piece'}
                       </button>
                    </div>
                 </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 {inventory.map(item => (
                    <div key={item.id} className="glass-card rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all border border-gray-100/50 relative">
                       <div className="aspect-square bg-gray-50 relative overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                             <button onClick={() => handleEditProduct(item)} className="bg-white/80 backdrop-blur-md p-4 rounded-full text-[var(--indian-maroon)] hover:bg-[var(--indian-gold)] transition-all shadow-xl">✎</button>
                          </div>
                          <div className="absolute bottom-6 left-6 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-[var(--indian-maroon)]">
                             <p className="text-[8px] font-bold uppercase tracking-widest mb-1 opacity-60">Level</p>
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
                    <div key={order._id} className="glass-card p-10 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-xl transition-all pointer-events-auto">
                       <div className="flex items-center gap-8 flex-1">
                          <div className="w-16 h-16 glass-midnight rounded-full flex items-center justify-center text-[var(--indian-gold)] font-bold tracking-tighter shadow-xl">
                             #{order._id.slice(-4).toUpperCase()}
                          </div>
                          <div>
                             <h4 className="text-xl font-serif font-bold uppercase tracking-tight">{order.user}</h4>
                             <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-1">{order.date}</p>
                          </div>
                       </div>
                       
                       <div className="flex-1 text-center">
                          <span className={`text-[9px] font-bold uppercase tracking-[0.4em] px-6 py-2 rounded-full border ${order.status === 'Accepted' || order.status === 'Processing' ? 'bg-[var(--indian-gold)]/10 text-[var(--indian-maroon)] border-[var(--indian-gold)]/30' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                             {order.status}
                          </span>
                       </div>

                       <div className="flex-1 text-right flex items-center justify-end gap-6">
                          <p className="text-2xl font-serif font-bold italic text-[var(--indian-maroon)]">{order.total}</p>
                          <button onClick={() => setSelectedOrder(order)} className="bg-[var(--indian-midnight)] text-white p-4 rounded-full hover:bg-[var(--indian-gold)] transition-all">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
           <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12">
              <div className="absolute inset-0 bg-[#0a0a0b]/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
              <div className="relative w-full max-w-4xl max-h-full overflow-y-auto no-scrollbar bg-[var(--indian-cream)] rounded-[50px] shadow-2xl border-2 border-[var(--indian-gold)]/30 animate-fade-in-up">
                 <div className="p-12 md:p-20">
                    <div className="flex flex-col md:flex-row justify-between gap-12 mb-16 pb-12 border-b border-gray-100">
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--indian-gold)] mb-4 italic">Order Record</p>
                          <h2 className="text-5xl font-serif font-bold italic tracking-tighter uppercase">{selectedOrder.user}</h2>
                          <p className="text-sm font-serif italic text-gray-400 mt-2">{selectedOrder.email} • {selectedOrder.phone}</p>
                       </div>
                       <button onClick={() => handleResendInvoice(selectedOrder._id, selectedOrder.email)} className="h-fit bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-xl">
                          Resend Digital Bill 📧
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                       <div className="space-y-12">
                          <div>
                             <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Archive Dispatch Information</h4>
                             <p className="text-lg font-serif italic leading-relaxed text-gray-600">{selectedOrder.address}</p>
                          </div>
                          
                          <div>
                             <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Piece Breakdown</h4>
                             <div className="space-y-6">
                                {selectedOrder.items.map((item: any, i: number) => (
                                   <div key={i} className="flex gap-6 items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                      <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 grow-0 shrink-0">
                                         <img src={item.image || 'https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=100'} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-serif font-bold italic tracking-tight">{item.name}</p>
                                         <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--indian-gold)] mt-1">Size: {item.size || 'N/A'} × {item.quantity || 1}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>

                       <div className="glass-card p-10 rounded-[40px] border border-[var(--indian-gold)]/20 shadow-xl h-fit sticky top-0">
                          <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-10 pb-4 border-b border-[var(--indian-maroon)]/10 text-center">Digital Registry Status</h4>
                          
                          <div className="space-y-8">
                             <div>
                                <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Update Status Protocol</label>
                                <div className="flex flex-wrap gap-2">
                                   {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                                      <button key={st} onClick={() => setSelectedOrder({...selectedOrder, status: st})} className={`px-4 py-2 rounded-full text-[8px] font-bold uppercase transition-all ${selectedOrder.status === st ? 'bg-[var(--indian-maroon)] text-white' : 'bg-gray-100 text-gray-400'}`}>{st}</button>
                                   ))}
                                </div>
                             </div>

                             <div className="space-y-4">
                                <div>
                                   <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Courier Feed</label>
                                   <input type="text" value={selectedOrder.courier} onChange={e => setSelectedOrder({...selectedOrder, courier: e.target.value})} className="w-full bg-white border border-gray-100 py-3 px-5 rounded-xl text-xs font-bold outline-none focus:border-[var(--indian-gold)]" placeholder="e.g. Delhivery, BlueDart" />
                                </div>
                                <div>
                                   <label className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Registry Tracking ID</label>
                                   <input type="text" value={selectedOrder.trackingId} onChange={e => setSelectedOrder({...selectedOrder, trackingId: e.target.value})} className="w-full bg-white border border-gray-100 py-3 px-5 rounded-xl text-xs font-bold outline-none focus:border-[var(--indian-gold)]" placeholder="Tracking Number" />
                                </div>
                             </div>

                             <button 
                                onClick={() => handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status, selectedOrder.courier, selectedOrder.trackingId)}
                                className="w-full bg-[var(--indian-midnight)] text-[var(--indian-gold)] py-5 rounded-full font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-transparent hover:border-[var(--indian-gold)]/30"
                             >
                                Confirm Registry Update
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>

      {/* ADMIN BOTTOM COMMAND BAR (MOBILE) */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 glass-midnight rounded-full border border-white/10 p-4 flex justify-around items-center shadow-2xl z-[200]">
         {['inventory', 'orders', 'banners'].map(tab => (
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
