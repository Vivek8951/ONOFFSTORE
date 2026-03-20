'use client';

import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [notifications, setNotifications] = useState(['New Order #1004 placed by Rahul (₹1,999)']);
  
  // -- STATE: ORDERS --
  const [orders, setOrders] = useState([
    { id: '#1004', user: 'Rahul', total: '₹1,999', status: 'Pending', item: 'Parachute Cargo Pants', size: 'M' },
    { id: '#1003', user: 'Priya', total: '₹4,500', status: 'Shipped', item: 'Oversized Drop Shoulder Tee', size: 'L' },
  ]);

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
        image: itemToEdit.image,
        sizes: itemToEdit.sizes || []
      });
      setEditingId(id);
      setIsAddingProduct(true);
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row pt-20 font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black border-r border-gray-800 p-6 flex flex-col gap-4 text-white">
        <h2 className="text-3xl font-black tracking-widest text-white mb-6 uppercase">ONOFF</h2>
        <button onClick={() => setActiveTab('inventory')} className={`text-left text-sm font-bold uppercase tracking-widest p-3 transition-colors ${activeTab === 'inventory' ? 'bg-white text-black' : 'hover:bg-gray-800'}`}>
          Stock / Inventory
        </button>
        <button onClick={() => setActiveTab('orders')} className={`text-left text-sm font-bold uppercase tracking-widest p-3 transition-colors ${activeTab === 'orders' ? 'bg-white text-black' : 'hover:bg-gray-800'}`}>
          Live Orders
        </button>
        <button onClick={() => setActiveTab('discounts')} className={`text-left text-sm font-bold uppercase tracking-widest p-3 transition-colors ${activeTab === 'discounts' ? 'bg-white text-black' : 'hover:bg-gray-800'}`}>
          Discounts & Promos
        </button>
        <button className="text-left text-sm font-bold uppercase tracking-widest p-3 text-red-500 mt-auto hover:bg-gray-800 transition-colors">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {/* Notifications Bar */}
        {notifications.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 shadow-sm flex justify-between items-center">
            <span className="font-bold text-sm tracking-wide">⚡ ALERT: {notifications[0]}</span>
            <button onClick={() => setNotifications([])} className="text-xs uppercase tracking-widest font-black hover:text-black">Dismiss</button>
          </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-4xl font-black uppercase tracking-tight">Manage Inventory</h1>
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
                          const imageUrl = URL.createObjectURL(file);
                          setNewProduct({...newProduct, image: imageUrl});
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
                    <button onClick={() => handleEditProduct(item.id)} className="px-6 bg-gray-100 text-gray-700 rounded-md py-3 text-xs uppercase font-medium tracking-widest hover:bg-gray-200 transition-colors">Edit</button>
                    <button onClick={() => handleDeleteProduct(item.id)} className="px-6 border border-gray-200 rounded-md text-red-500 py-3 text-xs uppercase font-medium tracking-widest hover:bg-red-50 hover:border-red-100 transition-colors">Delete</button>
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
            <h1 className="text-4xl font-black uppercase tracking-tight mb-8">Live Orders</h1>
            <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm rounded-xl">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-black text-white text-[11px] uppercase tracking-widest font-bold">
                    <th className="p-5 font-semibold">Order ID</th>
                    <th className="p-5 font-semibold">Customer</th>
                    <th className="p-5 font-semibold">Item & Size</th>
                    <th className="p-5 font-semibold">Total</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-5 font-black text-sm">{order.id}</td>
                      <td className="p-5 font-semibold text-sm">{order.user}</td>
                      <td className="p-5 text-sm font-medium text-gray-700">
                        {order.item} <span className="inline-block ml-2 text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold uppercase">{order.size}</span>
                      </td>
                      <td className="p-5 font-bold font-serif">{order.total}</td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <select 
                          className="border border-gray-200 text-xs font-semibold uppercase p-2 outline-none cursor-pointer rounded bg-white hover:border-gray-400 focus:border-black"
                          value={order.status}
                          onChange={(e) => {
                            setOrders(orders.map(o => o.id === order.id ? { ...o, status: e.target.value } : o));
                          }}
                        >
                           <option value="Pending">Pending</option>
                           <option value="Processing">Processing</option>
                           <option value="Shipped">Shipped</option>
                           <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </main>
    </div>
  );
}
