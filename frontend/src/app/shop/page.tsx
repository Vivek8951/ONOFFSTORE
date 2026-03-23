'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();

const CATEGORIES = ['All', 'Apparel', 'Cargo', 'Accessories'];

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
        setFiltered(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let list = [...products];
    if (activeCategory !== 'All') {
      list = list.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchTerm) {
      list = list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()));
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
    <div className="min-h-screen bg-[var(--indian-cream)] text-gray-900 font-sans selection:bg-[var(--indian-gold)] selection:text-white">
      <Navbar />

      {/* Page Header */}
      <header className="pt-28 md:pt-36 pb-12 px-6 md:px-16 border-b border-white/20">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-serif font-semibold uppercase tracking-[0.4em] text-[var(--indian-maroon)] mb-3 opacity-60">Collection 2024</p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-7xl font-serif font-semibold uppercase italic tracking-tighter leading-none">
                Shop All
              </h1>
              <p className="text-sm text-gray-400 mt-3 font-medium">{filtered.length} items available</p>
            </div>

            {/* Actions: Search & Sort */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <input 
                  type="text" 
                  placeholder="Search pieces..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-100 px-5 py-3 rounded-xl text-xs font-serif italic outline-none focus:border-[var(--indian-gold)] transition-all pr-12"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[var(--indian-gold)] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="w-full sm:w-auto border border-gray-100 rounded-xl px-5 py-3 text-xs font-serif font-semibold uppercase tracking-widest outline-none focus:border-[var(--indian-maroon)] appearance-none cursor-pointer bg-white text-[var(--indian-maroon)] shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-serif font-semibold uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-[var(--indian-maroon)] text-[var(--indian-gold)]'
                    : 'bg-white border border-gray-200 text-[var(--indian-maroon)] hover:border-[var(--indian-gold)] hover:text-[#fff] hover:bg-[var(--indian-gold)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-5">
                <div className="aspect-[3/4] w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-50 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white/50 backdrop-blur-sm border border-white/20 rounded-[40px] shadow-sm">
            <div className="text-4xl mb-6">🔍</div>
            <p className="text-[var(--indian-maroon)] font-serif font-semibold italic text-xl mb-2">No pieces found</p>
            <p className="text-gray-400 text-xs font-sans uppercase tracking-widest mb-8">Try adjusting your filters or search term</p>
            <button 
              onClick={() => { setActiveCategory('All'); setSearchTerm(''); }} 
              className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] px-10 py-4 font-serif font-semibold uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--indian-gold)] hover:text-white transition-all rounded-full shadow-lg"
            >
              Reset Atelier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map(product => {
              const originalPrice = Math.round(Number(product.price) * 1.4);
              const discount = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);
              const isWishlisted = wishlist.includes(product._id);
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const outOfStock = product.stock === 0;
              return (
                <div key={product._id} className="group flex flex-col relative">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-4">
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {!outOfStock && <span className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] text-[9px] font-serif font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-[var(--indian-gold)]/30">-{discount}%</span>}
                      {isLowStock && <span className="bg-[var(--indian-gold)] text-[var(--indian-maroon)] text-[9px] font-serif font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-[var(--indian-maroon)]/30">Only {product.stock} left</span>}
                      {outOfStock && <span className="bg-gray-200 text-gray-500 text-[9px] font-serif font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">Sold Out</span>}
                    </div>

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-[var(--indian-cream)] rounded-full flex items-center justify-center shadow-md border border-[var(--indian-gold)]/20 transition-transform hover:scale-110"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? 'var(--indian-maroon)' : 'none'} stroke={isWishlisted ? 'var(--indian-maroon)' : 'var(--indian-gold)'} strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <Link href={`/product/${product._id}`}>
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=600'}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${outOfStock ? 'opacity-50' : ''}`}
                      />
                    </Link>

                    {/* Quick Add Overlay */}
                    {!outOfStock && (
                      <div className="absolute bottom-0 left-0 right-0 absolute bottom-0 left-0 right-0 bg-[var(--indian-maroon)]/90 backdrop-blur-sm text-[var(--indian-gold)] border-t border-[var(--indian-gold)]/20 text-center py-3 text-[10px] font-serif font-semibold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <Link href={`/product/${product._id}`}>Quick View</Link>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5">
                    <Link href={`/product/${product._id}`} className="text-lg font-serif italic text-[var(--indian-maroon)] leading-tight line-clamp-2 hover:text-[var(--indian-gold)] transition-colors">
                      {product.name}
                    </Link>

                    {/* Sizes row */}
                    <div className="flex gap-1 flex-wrap">
                      {product.sizes?.slice(0, 4).map((sz: string) => (
                        <span key={sz} className="text-[9px] font-serif font-semibold border border-[var(--indian-gold)]/30 bg-[var(--indian-cream)] px-1.5 py-0.5 rounded-sm text-[var(--indian-maroon)] uppercase tracking-wider">{sz}</span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-serif font-semibold text-[var(--indian-maroon)]">₹{Number(product.price).toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through font-serif italic">₹{originalPrice.toLocaleString()}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-[var(--indian-gold)] text-xs">★★★★★</div>
                      <span className="text-[10px] font-serif tracking-wider text-gray-400">{Math.floor(Math.random() * 900 + 100)} reviews</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Brand Strip */}
      <section className="border-t border-gray-100 py-20 px-6 md:px-16 bg-[var(--indian-cream)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { icon: '📦', title: 'Curated Delivery', sub: 'Complimentary on ₹999+' },
            { icon: '✨', title: 'Heritage Quality', sub: 'Authentic craftsmanship' },
            { icon: '🔒', title: 'Secure Gateway', sub: 'Razorpay protection' },
            { icon: '🕊️', title: 'Bespoke Support', sub: 'At your service 24/7' }
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <span className="text-3xl grayscale opacity-80">{item.icon}</span>
              <h3 className="text-sm font-serif font-semibold uppercase tracking-[0.2em] text-[var(--indian-maroon)]">{item.title}</h3>
              <p className="text-xs text-gray-500 font-serif italic">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
