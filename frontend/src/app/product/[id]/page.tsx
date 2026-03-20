'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useInventory } from '../../../hooks/useInventory';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  const { inventory, isReady } = useInventory();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-40 flex items-center justify-center font-bold tracking-widest text-xs uppercase animate-pulse">Loading Product...</div>
      </div>
    );
  }

  const product = inventory.find(p => p.id === params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-bold tracking-widest text-xs uppercase text-red-500">
        <Navbar />
        Product Drop Removed or Sold Out.
        <button onClick={() => router.push('/shop')} className="mt-6 border-b py-1 hover:text-black">Return Home</button>
      </div>
    );
  }

  const altImages = [product.image, product.hoverImage || product.image];
  const colors = product.colors || ['#000000', '#F5F5DC'];
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L'];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size first');
      return;
    }
    router.push('/cart');
  };

  return (
    <div className="bg-white min-h-screen pt-24 text-gray-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-16">
        
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-[3/4] w-full bg-gray-50 overflow-hidden group">
            <img 
              src={altImages[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             {altImages.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`aspect-[3/4] bg-gray-50 overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`${product.name} alternate view ${idx+1}`} className="w-full h-full object-cover object-center" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col gap-8 lg:sticky lg:top-32 lg:h-max">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-black uppercase mb-4 tracking-tighter leading-tight">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-800">₹{product.price}</p>
          </div>

          <div className="h-[1px] w-full bg-gray-200"></div>

          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed uppercase tracking-wide">
            Defined by uncompromising style and meticulous material engineering. A premium piece for the modern wardrobe.
          </p>

          {/* Color Selection */}
          <div className="flex flex-col gap-3 mt-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Select Color</span>
            <div className="flex gap-4">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-black scale-110 shadow-md' : 'border-gray-200 opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Select Size</span>
              <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-black tracking-widest underline underline-offset-4 transition-colors">Size Guide</button>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 border text-xs font-bold uppercase transition-all duration-300 ${
                    selectedSize === size 
                      ? 'bg-black text-white border-black shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black hover:shadow-sm'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            
            {product.stock > 0 && product.stock <= 5 && (
               <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-2 animate-pulse">Low Stock: Only {product.stock} pieces left.</span>
            )}
            {product.stock === 0 && (
               <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-2">Sold Out.</span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col gap-4 mt-8">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-5 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                product.stock === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : (selectedSize ? 'Add to Bag' : 'Select a Size')}
            </button>
            
            <div className="flex flex-col gap-3 mt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Product Details</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 font-medium uppercase tracking-wide">
                  <li>Premium Quality Construction</li>
                  <li>Imported / Ethically Sourced</li>
                  <li>Dry clean only / Machine wash cold, lay flat</li>
              </ul>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
