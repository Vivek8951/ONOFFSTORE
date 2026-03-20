'use client';
import ProductCard from './ProductCard';
import { useInventory } from '../hooks/useInventory';

export default function ProductGrid() {
  const { inventory, isReady } = useInventory();
  // We'll show the top 4 on the homepage
  const homepageProducts = inventory.slice(0, 4);

  return (
    <section className="py-24 px-6 md:px-12 bg-white text-text-light">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2 block font-semibold">T r e n d i n g</span>
            <h2 className="text-3xl md:text-5xl font-light text-black leading-tight">
              Curated Essentials
            </h2>
          </div>
          <a href="/shop" className="text-xs border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors font-medium uppercase tracking-[0.2em]">
            View Collection
          </a>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {!isReady ? (
             <div className="col-span-full h-32 flex items-center justify-center font-bold tracking-widest text-xs uppercase animate-pulse">Loading Drops...</div>
          ) : homepageProducts.length === 0 ? (
             <div className="col-span-full h-32 flex items-center justify-center font-bold tracking-widest text-sm uppercase text-gray-500">Wait for the next drop... Currently Sold Out.</div>
          ) : (
            homepageProducts.map((product) => (
              <ProductCard key={product.id} product={{...product, image: product.image, hoverImage: product.hoverImage || product.image, colors: product.colors || [] }} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
