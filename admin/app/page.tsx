'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from './config/api';

// 🍱 THE "FUNCTIONAL TWIN" ADMIN PANEL
// This is 100% your original code, now with a Backend Sync Hub.

export interface Order {
  id: string;
  _id?: string;
  user: string;
  total: string;
  status: 'Pending' | 'Accepted' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  item: string;
  size: string;
  date: string;
  trackingId?: string;
  courier?: string;
  address?: string;
  customerDetails?: { name: string; email: string; phone: string; address: string; };
}

export default function AdminDashboard() {
  const API_URL = getApiUrl();
  
  // --- 📡 UNIFIED STATE HUB ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState([
    { code: 'WELCOME10', amount: '10', type: 'percentage', active: true },
    { code: 'FESTIVE20', amount: '20', type: 'percentage', active: false },
  ]);
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', image: '', sizes: [] as string[], category: 'APPAREL', description: '' });
  
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [newDiscount, setNewDiscount] = useState({ code: '', amount: '', type: 'percentage' });

  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState({ title: '', image: '', linkProductId: '' });
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState(['New Order signal detected. Accessing Mumbai Hub...']);

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // --- 🛰️ ARCHIVE FETCH LOGIC ---
  const fetchArchive = async () => {
    try {
      const oRes = await fetch(`${API_URL}/api/orders/admin/all`);
      const oData = await oRes.json();
      setOrders(oData.map((o: any) => ({
        id: `#${o._id.slice(-6).toUpperCase()}`,
        _id: o._id,
        user: o.customerDetails?.name || 'Member',
        total: `₹${o.totalAmount}`,
        status: o.orderStatus || 'Pending',
        item: o.items?.[0]?.name || 'Luxury Archive',
        size: o.items?.[0]?.size || 'N/A',
        date: new Date(o.createdAt).toLocaleString(),
        customerDetails: o.customerDetails,
        courier: o.shippingDetails?.courier || '',
        trackingId: o.shippingDetails?.trackingId || ''
      })));

      const pRes = await fetch(`${API_URL}/api/products`);
      const pData = await pRes.json();
      setInventory(pData.map((p: any) => ({
        id: p._id,
        name: p.name,
        price: p.price.toString(),
        stock: p.stock,
        image: p.image,
        sizes: p.sizes || ['S', 'M', 'L'],
        category: p.category,
        description: p.description
      })));

      const bRes = await fetch(`${API_URL}/api/banners/admin/all`);
      const bData = await bRes.json();
      setBanners(bData.map((b: any) => ({
        id: b._id,
        title: b.title,
        image: b.image,
        active: b.active,
        linkProductId: b.linkProductId
      })));
      setIsReady(true);
    } catch (err) { console.error("Sync Failure"); }
  };

  useEffect(() => {
    fetchArchive();
    const interval = setInterval(fetchArchive, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- 🛠️ INVENTORY & PRODUCT HANDLERS ---
  const handleEditProduct = (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      setNewProduct({
        name: item.name,
        price: item.price,
        stock: item.stock.toString(),
        image: item.image || '',
        sizes: item.sizes || [],
        category: item.category || 'APPAREL',
        description: item.description || ''
      });
      setEditingId(id);
      setIsAddingProduct(true);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Abort this product drop?')) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
      fetchArchive();
    } catch (err) { alert('Delete Failure'); }
  };

  const handleUpdateStock = async (id: string, amount: number) => {
    try {
      await fetch(`${API_URL}/api/products/${id}/stock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockToAdd: amount })
      });
      fetchArchive();
    } catch (err) { alert("Link Error"); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newProduct, 
          price: parseInt(newProduct.price), 
          stock: parseInt(newProduct.stock) 
        })
      });
      if (res.ok) {
        setIsAddingProduct(false);
        setEditingId(null);
        setNewProduct({ name: '', price: '', stock: '', image: '', sizes: [], category: 'APPAREL', description: '' });
        fetchArchive();
      }
    } catch (err) { alert("Persistence Failure"); }
  };

  const handleSizeToggle = (size: string) => {
    setNewProduct(prev => {
      const currentSizes = prev.sizes || [];
      if (currentSizes.includes(size)) return { ...prev, sizes: currentSizes.filter(s => s !== size) };
      else return { ...prev, sizes: [...currentSizes, size] };
    });
  };

  // --- ✉️ ORDER & INVOICE HANDLERS ---
  const handleSendInvoice = async (orderId: string, overrideEmail: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/resend-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, overrideEmail })
      });
      if (res.ok) {
        setNotifications([`Premium Bill sent to ${overrideEmail}`, ...notifications]);
      } else { alert('Mail Server Offline'); }
    } catch (err) { alert('Protocol Failure'); } finally { setIsRefreshing(false); }
  };

  const handleUpdateOrderStatus = async (id: string, update: any) => {
    try {
      await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      setEditingOrder(null);
      fetchArchive();
    } catch (err) { alert('Sync failure'); }
  };

  const handleToggleDiscount = (code: string) => {
    setDiscounts(discounts.map(d => d.code === code ? { ...d, active: !d.active } : d));
  };

  const handleDeleteDiscount = (code: string) => {
    setDiscounts(discounts.filter(d => d.code !== code));
  };
  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.amount) return;
    setDiscounts([...discounts, { ...newDiscount, active: true }]);
    setIsAddingDiscount(false);
    setNewDiscount({ code: '', amount: '', type: 'percentage' });
  };

  const handleEditBanner = (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      setNewBanner({ title: banner.title, image: banner.image, linkProductId: banner.linkProductId || '' });
      setEditingBannerId(id);
      setIsAddingBanner(true);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image) return;
    const method = editingBannerId ? 'PUT' : 'POST';
    const endpoint = editingBannerId ? `${API_URL}/api/banners/${editingBannerId}` : `${API_URL}/api/banners`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBanner, active: true })
      });
      if (res.ok) {
        setIsAddingBanner(false);
        setEditingBannerId(null);
        setNewBanner({ title: '', image: '', linkProductId: '' });
        fetchArchive();
      }
    } catch (err) { alert('Banner Sync Failure'); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Remove this promotional display?')) return;
    try {
      await fetch(`${API_URL}/api/banners/${id}`, { method: 'DELETE' });
      fetchArchive();
    } catch (err) { alert('Removal Failure'); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') setIsAuthenticated(true);
    else alert('Invalid Access Code');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <div className="bg-white p-12 w-full max-w-md border border-gray-100 shadow-2xl text-center">
           <h1 className="text-4xl font-black uppercase tracking-widest mb-2">SMARTON</h1>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 border-b pb-4">Secure Portal Access</p>
           <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <input type="password" placeholder="Pass: admin123" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full border-b-2 border-gray-100 py-4 text-center text-lg outline-none focus:border-black" required />
              <button type="submit" className="w-full bg-black text-white font-black uppercase tracking-[0.2em] py-5 mt-2 hover:bg-[#f21c43] transition-all">Enter Dashboard</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR: ORIGINAL REDESIGN STYLE */}
      <aside className="fixed md:sticky top-0 left-0 bottom-0 w-full md:w-72 bg-black border-r border-gray-900 p-8 flex flex-col gap-2 text-white shrink-0 z-[100]">
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter uppercase leading-none italic">SMART<span className="text-[#f21c43]">ON</span></h2>
          <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">ADMIN CONSOLE</span>
        </div>
        
        <nav className="flex flex-col gap-3">
          {[
            { id: 'inventory', label: 'Stock / Inventory', icon: '📦' },
            { id: 'orders', label: 'Live Orders', icon: '⚡' },
            { id: 'discounts', label: 'Promos & Codes', icon: '🎟️' },
            { id: 'banners', label: 'Marketing Banners', icon: '🖼️' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-widest p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#f21c43] text-white' : 'hover:bg-white/10 text-gray-400'}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest p-4 text-red-500 mt-auto hover:bg-red-500/10 rounded-xl transition-all">Logout</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black uppercase text-gray-400">Total Revenue</span>
              <p className="text-3xl font-black">₹{(orders.reduce((acc, o) => acc + parseInt(o.total.replace('₹','').replace(',','')), 0)).toLocaleString()}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black uppercase text-gray-400">Total Orders</span>
              <p className="text-3xl font-black">{orders.length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black uppercase text-[#f21c43]">Pending Actions</span>
              <p className="text-3xl font-black text-[#f21c43]">{orders.filter(o => o.status === 'Pending').length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black uppercase text-gray-400">Active SKUs</span>
              <p className="text-3xl font-black">{inventory.length} Items</p>
           </div>
        </div>

        {activeTab === 'inventory' && (
          <section className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-black uppercase tracking-tight italic">Manage Inventory</h1>
              <button onClick={() => setIsAddingProduct(!isAddingProduct)} className="bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#f21c43] transition-all">
                {isAddingProduct ? 'Cancel' : '+ Add Product Drop'}
              </button>
            </div>

            {isAddingProduct && (
              <form onSubmit={handleSaveProduct} className="mb-12 bg-white p-10 border border-gray-100 shadow-2xl rounded-[30px] grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-6">
                   <h3 className="font-black text-xl uppercase italic pb-4 border-b border-gray-50">Create New Piece</h3>
                   <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: (e.target.value as any)})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" required />
                    <input type="text" placeholder="Price (₹)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: (e.target.value as any)})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" required />
                    <input type="number" placeholder="Inventory Count" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: (e.target.value as any)})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" required />
                    <select value={(newProduct as any).category || 'Fusion'} onChange={(e) => setNewProduct({...newProduct, category: (e.target.value as any)} as any)} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black uppercase">
                       <option value="Ethnic">Ethnic</option>
                       <option value="Fusion">Fusion</option>
                       <option value="Accessories">Accessories</option>
                    </select>
                 </div>
                 <div className="flex flex-col gap-6">
                    <textarea placeholder="Product Description" value={(newProduct as any).description || ''} onChange={(e) => setNewProduct({...newProduct, description: (e.target.value as any)} as any)} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black min-h-[100px]" required />
                    <p className="text-[10px] font-black uppercase text-gray-400">Archive Sizes</p>
                   <div className="flex flex-wrap gap-2">
                     {AVAILABLE_SIZES.map(sz => (
                        <button key={sz} type="button" onClick={() => handleSizeToggle(sz)} className={`w-10 h-10 flex items-center justify-center border text-[10px] font-black rounded transition-all ${newProduct.sizes.includes(sz)?'bg-black text-white':'text-gray-300'}`}>{sz}</button>
                     ))}
                   </div>
                   {/* 📸 IMAGE UPLOAD HUB */}
                   <div className="flex flex-col gap-2 mt-4">
                      <label className="text-[10px] font-black uppercase text-gray-400">Drop Visual (File or URL)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewProduct({...newProduct, image: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        className="text-[10px] font-black uppercase" 
                      />
                      <input type="text" placeholder="OR Paste Image URL" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" />
                   </div>
                   <button type="submit" className="bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-auto">Publish to Archive</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {inventory.map(item => (
                  <div key={item.id} className="bg-white p-8 border border-gray-100 rounded-[40px] shadow-sm flex flex-col gap-6 group hover:shadow-xl transition-all relative">
                     <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEditProduct(item.id)} className="bg-black text-white p-3 rounded-full hover:bg-[#f21c43] transition-all">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteProduct(item.id)} className="bg-red-50 text-[#f21c43] p-3 rounded-full hover:bg-[#f21c43] hover:text-white transition-all">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                     </div>
                     <div className="flex gap-6 items-start">
                        <div className="w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                           <h3 className="font-black text-xl uppercase italic leading-tight">{item.name}</h3>
                           <p className="text-gray-400 font-bold">₹{item.price}</p>
                           <div className="flex gap-1 mt-3">
                              {item.sizes?.map((sz: string) => <span key={sz} className="text-[8px] font-black bg-gray-50 border px-1.5 py-0.5 rounded text-gray-300 uppercase">{sz}</span>)}
                           </div>
                        </div>
                     </div>
                     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Stock:</span>
                        <div className="flex items-center gap-6 bg-white border border-gray-100 rounded-full px-4 py-1 font-black">
                           <button onClick={() => handleUpdateStock(item.id, -1)} className="text-gray-300 hover:text-black">-</button>
                           <span className="text-sm font-black">{item.stock}</span>
                           <button onClick={() => handleUpdateStock(item.id, 1)} className="text-gray-300 hover:text-black">+</button>
                        </div>
                     </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black uppercase tracking-tight">Live Orders</h1>
                <button 
                  onClick={() => { fetchArchive(); }}
                  className={`p-2 hover:bg-gray-100 rounded-full transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </div>
              <div className="bg-white px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest text-[#f21c43]">● Real-time Sync Active</div>
            </div>

            {/* Order Processing Modal */}
            {editingOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                  <div className="bg-black text-white p-6 flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-widest">Process Order {editingOrder.id}</h3>
                    <button onClick={() => setEditingOrder(null)} className="text-white hover:text-gray-400 text-2xl">✕</button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Customer Details</p>
                      <h4 className="font-bold text-lg mb-2">{editingOrder.user}</h4>
                      <p className="text-sm text-gray-500 mb-2">{editingOrder.customerDetails?.address || editingOrder.address}</p>
                      <p className="text-sm text-gray-500 mb-2">{editingOrder.customerDetails?.email}</p>
                      <p className="text-xs font-serif text-gray-400">Placed on: {editingOrder.date}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-4 tracking-widest">Action Required</p>

                      {editingOrder.status === 'Pending' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(editingOrder._id!, { status: 'Accepted' })}
                          className="w-full bg-green-600 text-white py-4 font-black uppercase tracking-widest hover:bg-green-700 transition-colors rounded"
                        >
                          Accept Order
                        </button>
                      )}

                      {(editingOrder.status === 'Accepted' || editingOrder.status === 'Processing') && (
                        <div className="flex flex-col gap-4">
                          <input 
                            type="text" 
                            placeholder="Courier Name (e.g. Delhivery)" 
                            className="border p-4 text-sm font-bold uppercase outline-none focus:border-black rounded"
                            value={editingOrder.courier || ''}
                            onChange={(e) => setEditingOrder({ ...editingOrder, courier: e.target.value })}
                          />
                          <input 
                            type="text" 
                            placeholder="Tracking ID" 
                            className="border p-4 text-sm font-bold uppercase outline-none focus:border-black rounded"
                            value={editingOrder.trackingId || ''}
                            onChange={(e) => setEditingOrder({ ...editingOrder, trackingId: e.target.value })}
                          />
                          <button 
                            onClick={() => {
                              if (!editingOrder.courier || !editingOrder.trackingId) {
                                alert("Please enter Courier and Tracking ID"); return;
                              }
                              handleUpdateOrderStatus(editingOrder._id!, { 
                                status: 'Shipped', 
                                courier: editingOrder.courier, 
                                trackingId: editingOrder.trackingId 
                              });
                            }}
                            className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-[#f21c43] transition-colors rounded"
                          >
                            Dispatch & Save Info
                          </button>
                        </div>
                      )}

                      {editingOrder.status === 'Shipped' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(editingOrder._id!, { status: 'Delivered' })}
                          className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-[#f21c43] transition-colors rounded"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {editingOrder.status === 'Delivered' && (
                        <div className="text-center py-4">
                          <span className="text-green-600 font-black uppercase tracking-widest text-sm">✓ Order Fulfilled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-xl">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-black text-white text-[11px] uppercase tracking-widest font-bold">
                    <th className="p-5 font-semibold">Order ID</th>
                    <th className="p-5 font-semibold">Customer</th>
                    <th className="p-5 font-semibold">Item & Size</th>
                    <th className="p-5 font-semibold">Total</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-5 font-black text-sm">{order.id}</td>
                      <td className="p-5">
                        <span className="block font-semibold text-sm">{order.user}</span>
                        <span className="text-[10px] text-gray-400 font-serif">{order.date}</span>
                      </td>
                      <td className="p-5 text-sm font-medium text-gray-700">
                        {order.item} <span className="inline-block ml-2 text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold uppercase">{order.size}</span>
                      </td>
                      <td className="p-5 font-bold font-serif">{order.total}</td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Delivered' ? 'bg-black text-white' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingOrder(order)}
                              className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#f21c43] transition-colors rounded"
                            >
                              Process
                            </button>
                            <button 
                              onClick={() => {
                                const input = document.getElementById(`email-${order.id}`) as HTMLInputElement;
                                handleSendInvoice(order._id || order.id, input?.value || order.customerDetails?.email || '');
                              }}
                              disabled={isRefreshing}
                              className={`bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#f21c43] transition-all rounded flex items-center gap-1 ${isRefreshing ? 'opacity-50' : ''}`}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                              {isRefreshing ? 'Sending...' : 'Send Bill'}
                            </button>
                          </div>
                          <input 
                            id={`email-${order.id}`}
                            type="email" 
                            placeholder="Destination Email"
                            defaultValue={order.customerDetails?.email || ''}
                            className="text-[9px] border border-gray-100 p-1 w-full rounded focus:border-black outline-none text-center font-medium"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-dashed border-gray-300">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg>
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders received yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'discounts' && (
          <section className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-black uppercase tracking-tight italic">Promo Codes</h1>
              <button onClick={() => setIsAddingDiscount(!isAddingDiscount)} className="bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#f21c43] transition-all">
                {isAddingDiscount ? 'Cancel' : '+ Create Code'}
              </button>
            </div>

            {isAddingDiscount && (
              <form onSubmit={handleAddDiscount} className="mb-12 bg-white p-10 border border-gray-100 shadow-2xl rounded-[30px] flex flex-col gap-6 max-w-md">
                 <input type="text" placeholder="Coupon Code (e.g. SNITCH50)" value={newDiscount.code} onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" required />
                 <div className="flex gap-4">
                    <input type="number" placeholder="Value" value={newDiscount.amount} onChange={(e) => setNewDiscount({...newDiscount, amount: e.target.value})} className="flex-1 border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" required />
                    <select value={newDiscount.type} onChange={(e) => setNewDiscount({...newDiscount, type: e.target.value})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black uppercase">
                       <option value="percentage">% OFF</option>
                       <option value="fixed">INR OFF</option>
                    </select>
                 </div>
                 <button type="submit" className="bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4">Save Discount</button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {discounts.map((promo) => (
                <div key={promo.code} className="bg-white border-2 border-dashed border-gray-200 rounded-[30px] p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:border-black transition-colors">
                  <div className={`absolute top-0 w-full h-1.5 ${promo.active ? 'bg-green-500' : 'bg-[#f21c43]'}`}></div>
                  <h3 className="text-3xl font-black tracking-widest my-4 uppercase">{promo.code}</h3>
                  <span className="text-xl font-bold text-gray-400 mb-8">{promo.type === 'percentage' ? `${promo.amount}%` : `₹${promo.amount}`} OFF</span>
                  
                  <div className="flex gap-3 w-full">
                    <button onClick={() => handleToggleDiscount(promo.code)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${promo.active ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                      {promo.active ? 'Active' : 'Paused'}
                    </button>
                    <button onClick={() => handleDeleteDiscount(promo.code)} className="px-5 py-3 bg-red-50 text-[#f21c43] text-[10px] font-black rounded-xl hover:bg-[#f21c43] hover:text-white transition-all">DEL</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'banners' && (
          <section className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-black uppercase tracking-tight italic">Marketing Banners</h1>
              <button onClick={() => setIsAddingBanner(!isAddingBanner)} className="bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#f21c43] transition-all">
                {isAddingBanner ? 'Cancel' : '+ Upload Banner'}
              </button>
            </div>

            {isAddingBanner && (
              <form onSubmit={handleAddBanner} className="mb-12 bg-white p-10 border border-gray-100 shadow-2xl rounded-[30px] flex flex-col gap-6 max-w-lg">
                 <input type="text" placeholder="Banner Title" value={newBanner.title} onChange={(e) => setNewBanner({...newBanner, title: e.target.value})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" required />
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Banner Drop Visual</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewBanner({...newBanner, image: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="text-[10px] font-black uppercase" 
                    />
                    <input type="text" placeholder="OR Paste URL" value={newBanner.image} onChange={(e) => setNewBanner({...newBanner, image: e.target.value})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Link Product (Optional)</label>
                    <select value={newBanner.linkProductId} onChange={(e) => setNewBanner({...newBanner, linkProductId: e.target.value})} className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black uppercase">
                       <option value="">None</option>
                       {inventory.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                 </div>
                 <button type="submit" className="bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4">Publish Banner</button>
              </form>
            )}

            <div className="grid grid-cols-1 gap-10">
              {banners.map(banner => (
                 <div key={banner.id} className="relative w-full h-[400px] rounded-[50px] overflow-hidden shadow-xl group">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                     <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-12 text-center">
                        <h2 className="text-white text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 drop-shadow-2xl">{banner.title}</h2>
                        <div className="flex gap-4">
                           <button onClick={() => handleEditBanner(banner.id)} className="bg-white text-black px-12 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-full">Edit Drop</button>
                           <button onClick={() => handleDeleteBanner(banner.id)} className="bg-[#f21c43] text-white px-12 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#f21c43] transition-all rounded-full">Remove Drop</button>
                        </div>
                     </div>
                 </div>
              ))}
              {banners.length === 0 && (
                <div className="p-20 border-2 border-dashed border-gray-200 rounded-[50px] text-center">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active banners detected.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {editingOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-8 animate-fade-in">
             <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl">
                <div className="bg-[#f21c43] p-10 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-3xl font-black uppercase italic leading-none">Order Hub</h3>
                      <p className="text-[10px] font-bold tracking-[.4em] uppercase opacity-60 mt-2">SECURE_NODE: {editingOrder.id}</p>
                   </div>
                   <button onClick={() => setEditingOrder(null)} className="text-white text-3xl font-light hover:scale-125 transition-transform">✕</button>
                </div>
                <div className="p-10 flex flex-col gap-10">
                   <div className="flex flex-col gap-4">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Update Shipment Status</span>
                      <div className="grid grid-cols-5 gap-3">
                         {['Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
                            <button 
                              key={st} 
                              onClick={() => setEditingOrder({...editingOrder!, status: st as any})} 
                              className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editingOrder.status === st ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                            >
                              {st}
                            </button>
                         ))}
                      </div>
                   </div>

                   {(editingOrder.status === 'Shipped' || editingOrder.status === 'Processing') && (
                      <div className="flex flex-col gap-4 animate-fade-in-up">
                         <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">Logistics Intelligence</span>
                         <input 
                           type="text" 
                           placeholder="Courier Partner (e.g. Delhivery)" 
                           value={editingOrder.courier || ''} 
                           onChange={(e) => setEditingOrder({...editingOrder, courier: e.target.value})} 
                           className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" 
                         />
                         <input 
                           type="text" 
                           placeholder="Tracking ID / AWB" 
                           value={editingOrder.trackingId || ''} 
                           onChange={(e) => setEditingOrder({...editingOrder, trackingId: e.target.value})} 
                           className="border-b-2 border-gray-100 py-3 text-sm font-bold outline-none focus:border-black" 
                         />
                      </div>
                   )}

                   <div className="flex gap-4">
                      <button 
                        onClick={() => setEditingOrder(null)} 
                        className="flex-1 py-5 border border-gray-100 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                      >
                        Abort
                      </button>
                      <button 
                        onClick={async () => {
                          const res = orders.map(o => o.id === editingOrder.id ? { ...o, status: editingOrder.status, courier: editingOrder.courier, trackingId: editingOrder.trackingId } : o);
                          setOrders(res);
                          await fetch(`${API_URL}/api/orders/${editingOrder._id}/status`, { 
                            method: 'PUT', 
                            headers: {'Content-Type':'application/json'}, 
                            body: JSON.stringify({
                              status: editingOrder.status, 
                              courier: editingOrder.courier, 
                              trackingId: editingOrder.trackingId
                            }) 
                          });
                          setEditingOrder(null);
                        }} 
                        className="flex-1 bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#f21c43] transition-all shadow-xl"
                      >
                        Commit Changes
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out both; }
      `}</style>
    </div>
  );
}
