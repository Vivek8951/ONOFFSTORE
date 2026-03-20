'use client';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useInventory, Product } from '../../hooks/useInventory';

export default function Shop() {
  const { inventory, isReady } = useInventory();

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center md:text-left border-b border-gray-200 pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight uppercase">THE COLLECTION</h1>
          <p className="text-gray-600 mt-4 text-sm font-medium tracking-wide max-w-2xl">
            Explore our meticulously curated array of streetwear essentials, engineered to balance extreme comfort with modern urban silhouettes.
          </p>
        </div>

        {/* Filters bar placeholder */}
        <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-widest text-text-light">
           <button className="flex items-center gap-2 hover:text-accent">
             Filters (0)
           </button>
           <span>{inventory.length} Products</span>
           <button className="hover:text-accent">
             Sort By
           </button>
        </div>

        {/* Product Grid */}
        {!isReady ? (
          <div className="min-h-[50vh] flex items-center justify-center font-bold tracking-widest text-xs uppercase animate-pulse">Loading Catalog...</div>
        ) : inventory.length === 0 ? (
           <div className="min-h-[40vh] flex items-center justify-center font-bold tracking-widest text-sm uppercase text-gray-400">Nothing in stock right now... Check Admin Panel.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {inventory.map((product: Product) => (
              <ProductCard key={product.id} product={{...product, image: product.image, hoverImage: product.hoverImage || product.image, colors: product.colors || [] }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
