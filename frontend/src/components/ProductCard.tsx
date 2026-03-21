import Link from 'next/link';
import { Product } from '../hooks/useInventory';

interface ProductProps {
  product: Product;
}

export default function ProductCard({ product }: ProductProps) {
  // Mock SHEIN properties based on price
  const basePrice = parseInt(product.price.replace(/,/g, ''));
  const originalPrice = Math.floor(basePrice * 1.5).toLocaleString(); // Inflate to show crossed out
  const discountPercent = Math.floor(((basePrice * 1.5 - basePrice) / (basePrice * 1.5)) * 100);
  const reviewCount = Math.floor(Math.random() * 9000 + 100);

  return (
    <div className="group flex flex-col relative w-full bg-white transition-all cursor-pointer rounded overflow-hidden shadow-sm hover:shadow-lg">
      
      {/* Product Image Wrapper */}
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] w-full bg-gray-100 block">
        {/* SHEIN badges: Red sale box, Top Rated, etc. */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <span className="bg-[#f21c43] text-white text-[10px] font-black px-2 py-0.5 rounded-sm">
            -{discountPercent}%
          </span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-sm">
              Almost Sold Out
            </span>
          )}
        </div>
        
        {/* Wishlist Heart Icon (Top Right) */}
        <button className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-[#f21c43] hover:fill-[#f21c43] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>

        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-top group-hover:opacity-0 transition-opacity"
        />
        <img 
          src={product.hoverImage || product.image} 
          alt={`${product.name} hover view`} 
          className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </Link>

      {/* Product Details - SHEIN Style */}
      <div className="p-3 bg-white w-full">
        {/* Title (Truncated, sans-serif) */}
        <Link href={`/product/${product.id}`} className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight hover:underline">
          {product.name}
        </Link>
        
        {/* Pricing Strategy: Strikethrough & Big Red */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-black text-[#f21c43]">₹{product.price}</span>
          <span className="text-xs text-gray-400 line-through font-medium">₹{originalPrice}</span>
        </div>

        {/* Rating & Sales count */}
        <div className="mt-1 flex items-center gap-1">
          <div className="flex text-[#ffb347] text-[10px]">
            ★★★★★
          </div>
          <span className="text-[10px] text-gray-500">({reviewCount}+ sold)</span>
        </div>

        {/* Quick Add Button / Sizes placeholder */}
        <div className="mt-3 flex items-center justify-between opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1 overflow-x-hidden">
            {product.sizes && product.sizes.slice(0,3).map((size, idx) => (
              <span key={idx} className="border border-gray-300 text-[9px] font-bold text-gray-600 px-1.5 py-0.5 rounded-sm">
                {size}
              </span>
            ))}
          </div>
          <button className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-wide hover:bg-gray-800">
            Quick Add
          </button>
        </div>
      </div>
      
    </div>
  );
}
