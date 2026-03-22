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
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setFiltered(list);
  }, [products, activeCategory, sort]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar />

      {/* Page Header */}
      <header className="pt-36 pb-12 px-6 md:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f21c43] mb-3">Collection 2024</p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                Shop All
                <span className="text-[#f21c43]">.</span>
              </h1>
              <p className="text-sm text-gray-400 mt-3 font-medium">{filtered.length} items available</p>
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black appearance-none cursor-pointer bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-6">No items in this category yet</p>
            <button onClick={() => setActiveCategory('All')} className="bg-black text-white px-8 py-3 font-black uppercase tracking-widest text-xs rounded-full hover:bg-[#f21c43] transition-all">
              View All
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
                      {!outOfStock && <span className="bg-[#f21c43] text-white text-[9px] font-black px-2.5 py-1 rounded-full">-{discount}%</span>}
                      {isLowStock && <span className="bg-black text-white text-[9px] font-black px-2.5 py-1 rounded-full">Only {product.stock} left</span>}
                      {outOfStock && <span className="bg-gray-400 text-white text-[9px] font-black px-2.5 py-1 rounded-full">Sold Out</span>}
                    </div>

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={isWishlisted ? '#f21c43' : 'none'} stroke={isWishlisted ? '#f21c43' : '#999'} strokeWidth="2.5">
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
                      <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-white text-center py-3 text-[10px] font-black uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Link href={`/product/${product._id}`}>Quick View</Link>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5">
                    <Link href={`/product/${product._id}`} className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 hover:text-[#f21c43] transition-colors">
                      {product.name}
                    </Link>

                    {/* Sizes row */}
                    <div className="flex gap-1 flex-wrap">
                      {product.sizes?.slice(0, 4).map((sz: string) => (
                        <span key={sz} className="text-[9px] font-bold border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 uppercase">{sz}</span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-black text-black">₹{Number(product.price).toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-[#ffb347] text-xs">★★★★★</div>
                      <span className="text-[10px] text-gray-400">{Math.floor(Math.random() * 900 + 100)} reviews</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Brand Strip */}
      <section className="border-t border-gray-100 py-20 px-6 md:px-16 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹999' },
            { icon: '↩️', title: 'Easy Returns', sub: '7-day return policy' },
            { icon: '🔒', title: 'Secure Payments', sub: 'Powered by Razorpay' },
            { icon: '⚡', title: 'Fast Dispatch', sub: 'Ships within 24 hours' },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="text-sm font-black uppercase tracking-wide">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
