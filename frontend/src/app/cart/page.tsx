import Link from 'next/link';

export default function Cart() {
  const cartItem = {
    name: 'Embroidered Silk Kurta Set',
    price: '12,999',
    size: 'M',
    color: '#000000',
    qty: 1,
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac66a?w=400&auto=format&fit=crop',
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Cart Items (Left) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-gray-200 pb-4">
            <h1 className="text-4xl font-serif font-bold text-text-light tracking-wide">BAG (1)</h1>
          </div>

          {/* Single Item Row */}
          <div className="flex gap-6 py-6 border-b border-gray-100">
            <img src={cartItem.image} alt="Cart item" className="w-32 h-44 object-cover border border-gray-200" />
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-light">{cartItem.name}</h3>
                  <p className="text-sm text-text-muted">Size: {cartItem.size} | Color: Black</p>
                </div>
                <span className="font-semibold text-lg text-text-light">₹{cartItem.price}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 border border-gray-300 w-max px-4 py-2">
                  <button className="text-xl font-light hover:text-accent">−</button>
                  <span className="text-sm font-semibold">{cartItem.qty}</span>
                  <button className="text-xl font-light hover:text-accent">+</button>
                </div>
                <button className="text-sm font-bold text-red-600 uppercase tracking-wider hover:underline">Remove</button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary (Right) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-32 lg:h-max">
          <h2 className="text-xl font-bold uppercase tracking-widest text-text-light border-b border-gray-200 pb-4">Order Summary</h2>
          
          <div className="flex flex-col gap-4 text-sm mt-4 text-text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹12,999</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST Included)</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-gray-200 my-2"></div>

          <div className="flex justify-between items-center text-lg font-bold text-text-light">
             <span>Total</span>
             <span>₹12,999</span>
          </div>

          <Link href="/checkout" className="w-full bg-black text-white py-5 text-center text-sm uppercase tracking-[0.2em] font-bold hover:bg-accent transition-colors duration-300 mt-4 shadow-xl">
            PROCEED TO CHECKOUT
          </Link>
          
          {/* Trust badges */}
          <div className="flex justify-center items-center gap-4 mt-4 opacity-50 grayscale">
            <span className="text-xs font-bold uppercase tracking-widest text-center flex gap-2">Secure Checkout • SSL Encrypted</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
