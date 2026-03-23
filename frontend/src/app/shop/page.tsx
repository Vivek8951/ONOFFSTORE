'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { supabase } from '../../config/supabase';

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
      // 🚀 SUPABASE HIGH-SPEED SYNC: Bypassing Render Hub for Instant Load
      const [prodRes, banRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('banners').select('*').eq('active', true)
      ]);
      
      if (prodRes.data) setProducts(prodRes.data);
      if (banRes.data) setBanners(banRes.data);
      
    } catch (e) {
      console.error('[ATELIER SUPABASE SYNC ERROR]', e);
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
    setFiltered(list);
  }, [products, activeCategory, sort, searchTerm]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans selection:bg-[var(--indian-gold)] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Realtime Sync Indicator: Elite Supabase Edition */}
      {isSyncing && (
        <div className="fixed top-24 right-6 z-[200] flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-green-500/30 shadow-xl animate-fade-in-up">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
           <span className="text-[9px] font-bold uppercase tracking-widest text-green-700">Supabase Channel Active</span>
        </div>
      )}

      {/* Hero Banners */}
      {banners.length > 0 && (
        <section className="relative h-[50vh] md:h-[80vh] w-full overflow-hidden mt-20">
          {banners.map((banner, idx) => (
            <div key={banner.id} className="absolute inset-0 transition-opacity duration-1000">
               <img src={banner.image} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-8 md:px-20 text-white pt-20 md:pt-40">
                  <h2 className="text-4xl md:text-8xl font-serif font-bold italic tracking-tighter mb-6 uppercase">{banner.title}</h2>
                  <Link href={banner.link_product_id ? `/product/${banner.link_product_id}` : '/shop'} className="bg-[var(--indian-gold)] text-[var(--indian-midnight)] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all w-fit shadow-2xl">Discover Drop</Link>
               </div>
            </div>
          ))}
        </section>
      )}

      {/* Elite Shop Header */}
      <section className={`${banners.length > 0 ? 'pt-16' : 'pt-40 md:pt-52'} pb-16 px-6 md:px-8 max-w-7xl mx-auto text-center animate-fade-in-up`}>
        <h2 className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.8em] text-[var(--indian-maroon)] mb-6 opacity-60">Supabase Real-Time Archive</h2>
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
            <h2 className="text-3xl font-serif font-bold mb-6 text-[var(--indian-midnight)] uppercase">Vault Empty</h2>
            <p className="text-xs text-gray-400 mb-12 max-w-sm mx-auto italic font-medium font-sans uppercase tracking-[0.2em]">The Supabase dispatch hub currently has no pieces matching your search.</p>
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
              <div key={product.id} className="group animate-fade-in-up">
                <div className="relative aspect-[4/5] mb-8 rounded-[40px] md:rounded-[50px] overflow-hidden bg-gray-50 shadow-2xl ring-1 ring-gray-100">
                  <Link href={`/product/${product.id}`} className="block h-full">
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
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 md:w-14 md:h-14 glass-midnight rounded-full flex items-center justify-center translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 shadow-lg"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "#d4af37" : "none"} stroke={wishlist.includes(product.id) ? "#d4af37" : "white"} strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>

                  <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-black/60 backdrop-blur-md text-[var(--indian-gold)] px-4 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] border border-[var(--indian-gold)]/20">
                    S: {product.stock}
                  </div>
                </div>

                <div className="flex justify-between items-start px-2">
                  <div className="flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-[var(--indian-gold)] mb-2 italic">{product.category}</p>
                    <h3 className="text-xl md:text-2xl font-serif font-bold tracking-tight uppercase group-hover:text-[var(--indian-gold)] transition-colors duration-500">{product.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg md:text-xl font-serif font-bold text-[var(--indian-maroon)] italic">₹{Number(product.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
