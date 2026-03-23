'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();
const CATEGORIES = ['All', 'Apparel', 'Cargo', 'Accessories'];

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsSyncing(true);
    
    try {
      const [prodRes, banRes] = await Promise.all([
        fetch(`${API_URL}/api/products`, { cache: 'no-store' }),
        fetch(`${API_URL}/api/banners/admin/all`, { cache: 'no-store' })
      ]);
      
      const pData = await prodRes.json();
      const bData = await banRes.json();
      
      setProducts(pData);
      setBanners(bData.filter((b: any) => b.active));
    } catch (e) {
      console.error('[ATELIER SYNC ERROR]', e);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Realtime Sync on Load & Focus
  useEffect(() => {
    fetchData();
    window.addEventListener('focus', () => fetchData(true));
    return () => window.removeEventListener('focus', () => fetchData(true));
  }, [fetchData]);

  useEffect(() => {
    let list = [...products];
    if (activeCategory !== 'All') {
      list = list.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchTerm) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setFiltered(list);
  }, [products, activeCategory, sort, searchTerm]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans selection:bg-[var(--indian-gold)] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Realtime Sync Indicator */}
      {isSyncing && (
        <div className="fixed top-24 right-6 z-[200] flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-[var(--indian-gold)]/30 shadow-xl animate-fade-in-up">
           <span className="w-2 h-2 bg-[var(--indian-gold)] rounded-full animate-ping"></span>
           <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--indian-maroon)]">Syncing Atelier Feed...</span>
        </div>
      )}

      {/* Hero Banners */}
      {banners.length > 0 && (
        <section className="relative h-[50vh] md:h-[80vh] w-full overflow-hidden mt-20">
          {banners.map((banner, idx) => (
            <div key={banner._id} className="absolute inset-0 transition-opacity duration-1000">
               <img src={banner.image} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-8 md:px-20 text-white pt-20 md:pt-40">
                  <h2 className="text-4xl md:text-8xl font-serif font-bold italic tracking-tighter mb-6">{banner.title}</h2>
                  <Link href={banner.linkProductId ? `/product/${banner.linkProductId}` : '/shop'} className="bg-[var(--indian-gold)] text-[var(--indian-midnight)] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all w-fit shadow-2xl">Discover Drop</Link>
               </div>
            </div>
          ))}
        </section>
      )}

      {/* Elite Shop Header */}
      <section className={`${banners.length > 0 ? 'pt-16' : 'pt-40 md:pt-52'} pb-16 px-6 md:px-8 max-w-7xl mx-auto text-center animate-fade-in-up`}>
        <h2 className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.8em] text-[var(--indian-maroon)] mb-6 opacity-60">The 2024 Collection Archive</h2>
        <h1 className="text-5xl md:text-9xl font-serif font-bold italic tracking-tighter mb-12 md:mb-16 leading-none">
          THE <span className="text-[var(--indian-gold)] gold-glow uppercase">ATELIER</span>
        </h1>
        
        {/* Luxury Search Dock */}
        <div className="relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--indian-gold)] to-[var(--indian-maroon)] rounded-full blur opacity-10 group-focus-within:opacity-30 transition-all duration-700"></div>
          <input 
            type="text" 
            placeholder="Search the archive..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full bg-white/40 backdrop-blur-3xl border border-white/40 py-6 md:py-8 px-10 rounded-full text-lg font-serif italic tracking-wide outline-none focus:border-[var(--indian-gold)]/40 transition-all shadow-2xl"
          />
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[var(--indian-gold)] gold-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </section>

      {/* Boutique Filters */}
      <nav className="max-w-7xl mx-auto px-6 md:px-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-10 border-b border-gray-100 pb-12 animate-fade-in-up">
        <div className="flex items-center gap-10 md:gap-12 overflow-x-auto no-scrollbar w-full md:w-auto pb-6 md:pb-0">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative py-3 group whitespace-nowrap ${activeCategory === cat ? 'text-[var(--indian-maroon)]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {cat}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--indian-gold)] transition-all duration-500 ${activeCategory === cat ? 'w-full gold-glow' : 'w-0 group-hover:w-1/2'}`}></div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-center">
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Archive Order</span>
           <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-[0.3em] outline-none cursor-pointer text-[var(--indian-maroon)] hover:text-[var(--indian-gold)] appearance-none border-b border-gray-200 pb-1"
           >
              <option value="newest">Latest Drop</option>
              <option value="price-asc">Price Asc</option>
              <option value="price-desc">Price Desc</option>
           </select>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-40">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[40px] shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 md:py-40 text-center animate-fade-in-up px-6">
            <h2 className="text-3xl font-serif font-bold mb-6 text-[var(--indian-midnight)]">Vault Empty</h2>
            <p className="text-xs text-gray-400 mb-12 max-w-sm mx-auto italic font-medium font-sans uppercase tracking-[0.2em]">The Atelier dispatch hub currently has no pieces matching your search.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
              className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-[var(--indian-maroon)] transition-all shadow-xl"
            >
              Reset Atelier Hub
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
            {filtered.map((product) => (
              <div key={product._id} className="group animate-fade-in-up">
                <div className="relative aspect-[4/5] mb-8 rounded-[40px] md:rounded-[50px] overflow-hidden bg-gray-50 shadow-2xl ring-1 ring-gray-100">
                  <Link href={`/product/${product._id}`} className="block h-full">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=800'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 px-10 pb-10 flex items-end">
                       <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em]">View Archive Details</span>
                    </div>
                  </Link>

                  <button 
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 md:w-14 md:h-14 glass-midnight rounded-full flex items-center justify-center translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 shadow-lg"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.includes(product._id) ? "#d4af37" : "none"} stroke={wishlist.includes(product._id) ? "#d4af37" : "white"} strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>

                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] border border-[var(--indian-gold)]/30 animate-pulse">
                      Limited Feed ({product.stock})
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start px-2">
                  <div className="flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-[var(--indian-gold)] mb-2 italic">{product.category}</p>
                    <h3 className="text-xl md:text-2xl font-serif font-bold tracking-tight uppercase group-hover:text-[var(--indian-gold)] transition-colors duration-500">{product.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg md:text-xl font-serif font-bold text-[var(--indian-maroon)]">₹{Number(product.price).toLocaleString()}</p>
                    <div className="h-[2px] w-0 bg-[var(--indian-gold)] group-hover:w-1/2 transition-all duration-700 ml-auto mt-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Boutique Values */}
      <section className="bg-[var(--indian-midnight)] py-20 md:py-32 px-6 md:px-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
          {[
            { icon: '📦', title: 'Global Feed', sub: 'Elite shipping on all commissions' },
            { icon: '✨', title: 'Luxury Craft', sub: 'Meticulous heritage tailoring' },
            { icon: '🔒', title: 'Secure Vault', sub: 'Encrypted payment security' },
            { icon: '🕊️', title: 'Atelier Care', sub: 'Available perpetually for you' }
          ].map(item => (
            <div key={item.title} className="text-center group">
              <span className="text-3xl md:text-4xl block mb-6 transition-transform duration-500 group-hover:scale-125">{item.icon}</span>
              <h4 className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] mb-3 text-[var(--indian-gold)]">{item.title}</h4>
              <p className="text-[10px] text-white/40 italic font-medium">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
