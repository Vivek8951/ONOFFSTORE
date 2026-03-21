'use client';

import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useOrders, Order } from '../../hooks/useOrders';
import { useBanners, Banner } from '../../hooks/useBanners';

export default function AdminDashboard() {
  const { orders, setOrders, isReady: ordersReady } = useOrders();
  const { banners, setBanners, isReady: bannersReady } = useBanners();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ADMIN AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const [activeTab, setActiveTab] = useState('inventory');
  const [notifications, setNotifications] = useState(['New Order #1004 placed by Rahul (₹1,999)']);
  
  // -- STATE: ORDERS --
  // Removed static orders array as we are using useOrders hook now.

  // -- STATE: INVENTORY (Now Globally Synced to localStorage) --
  const { inventory, setInventory, isReady } = useInventory();

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', image: '', sizes: [] as string[] });

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // -- STATE: DISCOUNTS --
  const [discounts, setDiscounts] = useState([
    { code: 'WELCOME10', discount: '10%', active: true },
    { code: 'FESTIVE20', discount: '20%', active: false },
  ]);

  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [newDiscount, setNewDiscount] = useState({ code: '', discount: '' });

  // -- STATE: BANNERS --
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', image: '', linkProductId: '' });

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image) return;
    setBanners([...banners, { id: `b_${Date.now()}`, ...newBanner, active: true }]);
    setNewBanner({ title: '', image: '', linkProductId: '' });
    setIsAddingBanner(false);
  };
  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  // --- HANDLERS: INVENTORY ---
  const handleDeleteProduct = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleEditProduct = (id: string) => {
    const itemToEdit = inventory.find(item => item.id === id);
    if (itemToEdit) {
      setNewProduct({
        name: itemToEdit.name,
        price: itemToEdit.price,
        stock: itemToEdit.stock.toString(),
        image: itemToEdit.image || '',
        sizes: itemToEdit.sizes || []
      });
      setEditingId(id);
      setIsAddingProduct(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateStock = (id: string, amount: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        return { ...item, stock: item.stock + amount >= 0 ? item.stock + amount : 0 };
      }
      return item;
    }));
  };

  const handleSizeToggle = (size: string) => {
    setNewProduct(prev => {
      const currentSizes = prev.sizes || [];
      if (currentSizes.includes(size)) {
        return { ...prev, sizes: currentSizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...currentSizes, size] };
      }
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    
    if (editingId) {
      // Update existing
      setInventory(inventory.map(item => 
        item.id === editingId 
          ? { 
              ...item, 
              name: newProduct.name, 
              price: newProduct.price, 
              stock: parseInt(newProduct.stock) || 0,
              image: newProduct.image,
              sizes: newProduct.sizes
            } 
          : item
      ));
    } else {
      // Create new
      setInventory([
        ...inventory, 
        { 
          id: `prod_${Date.now()}`, 
          name: newProduct.name, 
          price: newProduct.price, 
          stock: parseInt(newProduct.stock) || 0,
          image: newProduct.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
          sizes: newProduct.sizes
        }
      ]);
    }
    
    setIsAddingProduct(false);
    setEditingId(null);
    setNewProduct({ name: '', price: '', stock: '', image: '', sizes: [] });
  };

  // --- HANDLERS: DISCOUNTS ---
  const handleToggleDiscount = (code: string) => {
    setDiscounts(discounts.map(d => d.code === code ? { ...d, active: !d.active } : d));
  };
  const handleDeleteDiscount = (code: string) => {
    setDiscounts(discounts.filter(d => d.code !== code));
  };
  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.discount) return;
    setDiscounts([...discounts, { code: newDiscount.code.toUpperCase(), discount: newDiscount.discount, active: true }]);
    setIsAddingDiscount(false);
    setNewDiscount({ code: '', discount: '' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') { // Simple mock auth
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center font-sans p-6 pt-32">
        <div className="bg-white p-12 w-full max-w-md border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-center animate-fade-in-up">
           <h1 className="text-4xl font-black uppercase tracking-widest mb-2 font-cinzel">ONOFF</h1>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-8 border-b pb-4">Secure Admin Portal Access</p>
           
           <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <input 
                type="password" 
                placeholder="Enter Admin Password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full border-b-2 border-gray-200 py-4 text-center text-lg outline-none focus:border-black tracking-widest placeholder:text-sm placeholder:tracking-normal transition-colors"
                required
              />
              <button type="submit" className="w-full bg-black text-white font-black uppercase tracking-[0.2em] py-5 mt-2 hover:bg-[#f21c43] transition-colors duration-300">
                Access Dashboard
              </button>
              <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded text-center">
                 <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Demo Auth
                 </p>
                 <p className="text-[10px] text-gray-400 mt-1 uppercase font-mono">Pass: admin123</p>
              </div>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-[110] border-b border-gray-900">
        <div className="flex flex-col">
          <h2 className="text-xl font-black tracking-tighter uppercase leading-none">SMART<span className="italic">ON</span></h2>
          <span className="text-[6px] font-black uppercase tracking-widest text-gray-500">Admin Control</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Sidebar - SMARTON Redesign (Mobile Drawer Responsive) */}
      <aside className={`
        fixed md:sticky top-14 md:top-0 left-0 bottom-0 z-[100] md:z-0
        w-full md:w-72 bg-black border-r border-gray-900 p-8 flex flex-col gap-2 text-white shrink-0
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-12 hidden md:block">
          <img 
            src="/logo.png" 
            alt="SMARTON" 
            className="h-10 w-auto invert brightness-0 saturate-0" 
          />
          <p className="text-[7px] font-black tracking-[0.5em] text-gray-500 uppercase mt-2 opacity-50">ADMIN CONSOLE</p>
        </div>
        
        <nav className="flex flex-col gap-3">
          {[
            { id: 'inventory', label: 'Stock / Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'orders', label: 'Live Orders', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'discounts', label: 'Promos & Codes', icon: 'M7 7h.01M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z' },
            { id: 'banners', label: 'Marketing Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} 
              className={`flex items-center gap-4 text-[11px] font-black uppercase tracking-widest p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#f21c43] text-white shadow-[0_0_20px_rgba(242,28,67,0.3)]' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={tab.icon}></path></svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={() => { setIsAuthenticated(false); setAdminPassword(''); }} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest p-4 text-red-500 mt-auto hover:bg-red-500/10 rounded-xl transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          System Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 animate-fade-in-up">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Revenue</span>
              <p className="text-3xl font-black tracking-tighter">₹24,82,900</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Orders</span>
              <p className="text-3xl font-black tracking-tighter">{orders.length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending Actions</span>
              <p className="text-3xl font-black tracking-tighter text-[#f21c43]">{orders.filter(o => o.status === 'Pending').length}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Skus</span>
              <p className="text-3xl font-black tracking-tighter">142 Items</p>
           </div>
        </div>

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black uppercase tracking-tight">Manage Inventory</h1>
                <button 
                  onClick={() => {
                    setIsRefreshing(true);
                    setTimeout(() => setIsRefreshing(false), 1000);
                  }}
                  className={`p-2 hover:bg-gray-100 rounded-full transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </div>
              <button 
                onClick={() => {
                  if (isAddingProduct && !editingId) {
                    setIsAddingProduct(false);
                  } else {
                    setEditingId(null);
                    setNewProduct({ name: '', price: '', stock: '', image: '', sizes: [] });
                    setIsAddingProduct(true);
                  }
                }}
                className="bg-black text-white px-6 py-3 text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                {isAddingProduct && !editingId ? 'Cancel' : '+ Add Product Drop'}
              </button>
            </div>

            {/* Add/Edit Product Form */}
            {isAddingProduct && (
              <form onSubmit={handleSaveProduct} className="mb-8 bg-white p-8 border border-gray-100 shadow-xl rounded-xl flex flex-col gap-6 max-w-3xl">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-xl tracking-wide">{editingId ? 'Edit Existing Product' : 'Create New Product Record'}</h3>
                  {editingId && (
                    <button type="button" onClick={() => { setIsAddingProduct(false); setEditingId(null); }} className="text-sm font-bold text-gray-400 hover:text-black uppercase">Cancel Edit</button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" placeholder="Product Name (e.g. Linen Blouse)" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="border border-gray-200 p-4 text-sm font-medium outline-none focus:border-gray-500 rounded-md transition-colors" required />
                  <input type="text" placeholder="Price (₹)" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="border border-gray-200 p-4 text-sm font-medium outline-none focus:border-gray-500 rounded-md transition-colors" required />
                  <input type="number" placeholder="Total Inventory Quantity" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="border border-gray-200 p-4 text-sm font-medium outline-none focus:border-gray-500 rounded-md transition-colors" required />
                  
                  {/* Image Upload */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Product Image</label>
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
                      className="border border-gray-200 p-3 text-sm font-medium outline-none focus:border-gray-500 rounded-md transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                    />
                  </div>
                </div>

                {/* Available Sizes Map */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Available Sizes</label>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_SIZES.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`w-12 h-12 flex items-center justify-center border font-bold text-sm rounded transition-all duration-200 ${
                          newProduct.sizes.includes(size) 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {newProduct.image && (
                  <div className="w-24 h-32 overflow-hidden rounded-md border border-gray-200">
                     <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <button type="submit" className="bg-gray-900 text-white rounded-md py-4 font-semibold tracking-widest mt-2 hover:bg-black transition-all">
                  {editingId ? 'Save Changes' : 'Publish Product'}
                </button>
              </form>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              {inventory.map((item) => (
                <div key={item.id} className="bg-white p-6 border border-gray-100 rounded-xl flex flex-col gap-5 shadow-sm relative group hover:shadow-lg transition-all duration-300">
                  {item.stock < 5 && <div className="absolute top-4 right-4 bg-red-50 text-red-600 text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">Low Stock</div>}
                  
                  <div className="flex gap-6 items-start">
                    <div className="w-24 h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100 relative group-hover:border-black transition-colors">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <h3 className="font-semibold text-lg max-w-[200px] leading-tight">{item.name}</h3>
                      <p className="text-gray-500 font-medium font-serif">₹{item.price}</p>
                      <div className="flex gap-1 mt-2">
                        {item.sizes?.map(size => (
                          <span key={size} className="text-[10px] font-bold border px-1.5 py-0.5 rounded text-gray-600 bg-gray-50 uppercase">{size}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-lg mt-2">
                    <span className="font-medium text-sm text-gray-500">Available Stock:</span>
                    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                      <button onClick={() => handleUpdateStock(item.id, -1)} className="text-xl font-light w-8 hover:text-red-500 transition-colors">−</button>
                      <span className="font-semibold text-sm w-8 text-center">{item.stock}</span>
                      <button onClick={() => handleUpdateStock(item.id, 1)} className="text-xl font-light w-8 hover:text-green-500 transition-colors">+</button>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-gray-100 pt-5">
                    <button onClick={() => handleEditProduct(item.id)} className="flex-1 bg-gray-100 text-gray-700 rounded-md py-3 text-xs uppercase font-medium tracking-widest hover:bg-gray-200 hover:text-black transition-colors">Edit Item</button>
                    <button onClick={() => handleDeleteProduct(item.id)} className="px-6 border border-gray-200 rounded-md text-red-500 py-3 text-xs uppercase font-medium tracking-widest hover:bg-red-50 hover:border-red-100 transition-colors">Del</button>
                  </div>
                </div>
              ))}
              
              {inventory.length === 0 && <p className="text-gray-500 font-bold uppercase tracking-wide col-span-2 p-8 text-center border-2 border-dashed rounded-xl">No inventory found. Add products above.</p>}
            </div>
          </section>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-black uppercase tracking-tight">Live Orders</h1>
                <button 
                  onClick={() => {
                    setIsRefreshing(true);
                    setTimeout(() => setIsRefreshing(false), 1000);
                  }}
                  className={`p-2 hover:bg-gray-100 rounded-full transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
              </div>
              <div className="bg-white px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-widest text-[#f21c43]"> Real-time Sync Active</div>
            </div>

            {/* Detailed Order Modal / Panel for Processing */}
            {editingOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                    <div className="bg-black text-white p-6 flex justify-between items-center">
                       <h3 className="text-xl font-black uppercase tracking-widest">Process Order {editingOrder.id}</h3>
                       <button onClick={() => setEditingOrder(null)} className="text-white hover:text-gray-400">✕</button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Customer Details</p>
                          <h4 className="font-bold text-lg mb-2">{editingOrder.user}</h4>
                          <p className="text-sm text-gray-500 mb-4">{editingOrder.address}</p>
                          <p className="text-xs font-serif text-gray-400">Placed on: {editingOrder.date}</p>
                       </div>
                       <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold uppercase text-gray-400 mb-4 tracking-widest">Action Required</p>
                          
                          {editingOrder.status === 'Pending' && (
                             <button 
                               onClick={() => {
                                 const updated = orders.map(o => o.id === editingOrder.id ? { ...o, status: 'Accepted' as Order['status'] } : o);
                                 setOrders(updated);
                                 setEditingOrder(null);
                               }}
                               className="w-full bg-[#16a34a] text-white py-4 font-black uppercase tracking-widest hover:scale-105 transition-transform"
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
                                   const updated = orders.map(o => o.id === editingOrder.id ? { 
                                     ...o, 
                                     status: 'Shipped' as Order['status'], 
                                     courier: editingOrder.courier, 
                                     trackingId: editingOrder.trackingId 
                                   } : o);
                                   setOrders(updated);
                                   setEditingOrder(null);
                                 }}
                                 className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-[#f21c43] transition-colors"
                               >
                                 Dispatch & Save Info
                               </button>
                             </div>
                          )}

                          {editingOrder.status === 'Shipped' && (
                             <button 
                               onClick={() => {
                                 const updated = orders.map(o => o.id === editingOrder.id ? { ...o, status: 'Delivered' as Order['status'] } : o);
                                 setOrders(updated);
                                 setEditingOrder(null);
                               }}
                               className="w-full bg-black text-white py-4 font-black uppercase tracking-widest"
                             >
                               Mark as Delivered
                             </button>
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
                      <td className="p-5 flex flex-col pt-5">
                         <span className="font-semibold text-sm">{order.user}</span>
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
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-black text-white'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5">
                       <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => setEditingOrder(order)}
                            className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#f21c43] transition-colors rounded"
                          >
                            Process
                          </button>
                          <button 
                            onClick={() => {
                              setIsRefreshing(true);
                              setTimeout(() => {
                                setIsRefreshing(false);
                                setNotifications([`Invoice Sent to ${order.user}'s Email Successfully!`, ...notifications]);
                              }, 800);
                            }}
                            className="bg-white border border-gray-200 text-gray-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all rounded flex items-center gap-1"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2-2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            Email Bill
                          </button>
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

        {/* --- DISCOUNTS TAB --- */}
        {activeTab === 'discounts' && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-4xl font-black uppercase tracking-tight">Promo Codes</h1>
              <button 
                onClick={() => setIsAddingDiscount(!isAddingDiscount)}
                className="bg-black text-white px-6 py-3 text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-colors rounded"
              >
                {isAddingDiscount ? 'Cancel' : '+ Create Code'}
              </button>
            </div>

            {isAddingDiscount && (
              <form onSubmit={handleAddDiscount} className="mb-8 bg-white p-6 border border-gray-100 shadow-xl rounded-xl flex flex-col gap-4 max-w-md">
                <input type="text" placeholder="Coupon Code (e.g. SNITCH50)" value={newDiscount.code} onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className="border border-gray-200 p-4 font-bold uppercase outline-none focus:border-black rounded transition-colors" required />
                <input type="text" placeholder="Discount Amount (e.g. 20% or ₹500)" value={newDiscount.discount} onChange={(e) => setNewDiscount({...newDiscount, discount: e.target.value})} className="border border-gray-200 p-4 font-medium outline-none focus:border-black rounded transition-colors" required />
                <button type="submit" className="bg-gray-900 text-white rounded py-4 font-semibold tracking-widest mt-2 hover:bg-black transition-all uppercase">Save Discount</button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {discounts.map((promo) => (
                <div key={promo.code} className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:border-gray-400 transition-colors">
                  <div className={`absolute top-0 w-full h-1.5 ${promo.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <h3 className="text-3xl font-black tracking-widest my-4 uppercase">{promo.code}</h3>
                  <span className="text-xl font-medium text-gray-500 mb-8">{promo.discount} OFF</span>
                  
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => handleToggleDiscount(promo.code)}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border rounded transition-all ${promo.active ? 'bg-black text-white border-black hover:bg-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:text-black hover:border-black'}`}
                    >
                      {promo.active ? 'Active' : 'Paused'}
                    </button>
                    <button onClick={() => handleDeleteDiscount(promo.code)} className="px-5 py-3 border border-red-100 rounded text-red-500 text-[10px] font-bold hover:bg-red-50 tracking-wider">
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </section>
        )}
        {/* --- FESTIVE BANNERS TAB --- */}
        {activeTab === 'banners' && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-4xl font-black uppercase tracking-tight">Festive Banners</h1>
              <button 
                onClick={() => setIsAddingBanner(!isAddingBanner)}
                className="bg-black text-white px-6 py-3 text-sm font-black uppercase tracking-widest hover:bg-gray-800 transition-colors rounded"
              >
                {isAddingBanner ? 'Cancel' : '+ Upload Banner'}
              </button>
            </div>

            {isAddingBanner && (
              <form onSubmit={handleAddBanner} className="mb-8 bg-white p-8 border border-gray-100 shadow-xl rounded-xl flex flex-col gap-6 max-w-lg transition-all animate-fade-in-up">
                 <h3 className="font-semibold text-xl tracking-wide border-b border-gray-100 pb-3">New Homepage Banner</h3>
                 <input 
                   type="text" 
                   placeholder="Banner Title (e.g. Diwali Mega Sale)" 
                   value={newBanner.title} 
                   onChange={(e) => setNewBanner({...newBanner, title: e.target.value})} 
                   className="border border-gray-200 p-4 font-bold outline-none focus:border-black rounded transition-colors" 
                   required 
                 />
                 
                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Banner Image Upload</label>
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
                      className="border border-gray-200 p-3 text-sm font-medium outline-none focus:border-black rounded-md transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f21c43] file:text-white hover:file:bg-black" 
                      required={!newBanner.image}
                    />
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Link to Product (Optional)</label>
                    <select 
                      value={newBanner.linkProductId}
                      onChange={(e) => setNewBanner({...newBanner, linkProductId: e.target.value})}
                      className="border border-gray-200 p-4 text-sm font-bold uppercase outline-none focus:border-black rounded transition-colors"
                    >
                       <option value="">No Product Linked</option>
                       {inventory.map(item => (
                          <option key={item.id} value={item.id}>{item.name} - ₹{item.price}</option>
                       ))}
                    </select>
                 </div>

                 {newBanner.image && (
                   <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={newBanner.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                         <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-3 py-1 rounded">Image Preview</span>
                      </div>
                   </div>
                 )}
                 
                 <button type="submit" className="bg-[#f21c43] text-white rounded py-4 font-black tracking-widest mt-2 hover:bg-black transition-all uppercase shadow-lg">Publish Banner</button>
              </form>
            )}

            <div className="grid grid-cols-1 gap-8">
              {banners.map(banner => (
                 <div key={banner.id} className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-md group">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                       <h2 className="text-white text-3xl md:text-6xl font-black italic uppercase tracking-tighter drop-shadow-lg mb-4">{banner.title}</h2>
                       {banner.linkProductId && (
                         <div className="mb-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] uppercase font-black px-4 py-1.5 rounded-full">
                           Linked: {inventory.find(i => i.id === banner.linkProductId)?.name || 'Product Not Found'}
                         </div>
                       )}
                       <button onClick={() => handleDeleteBanner(banner.id)} className="bg-white text-[#f21c43] px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#f21c43] hover:text-white transition-colors duration-300 rounded shadow-2xl origin-bottom hover:scale-105">
                          Remove Banner
                       </button>
                    </div>
                 </div>
              ))}
              {banners.length === 0 && <p className="text-gray-500 font-bold uppercase tracking-wide p-8 text-center border-2 border-dashed rounded-xl">No active banners. Add one above.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
