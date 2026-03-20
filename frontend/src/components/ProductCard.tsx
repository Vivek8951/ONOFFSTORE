import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  price: string;
  image: string;
  hoverImage: string;
  colors: string[];
  isNew?: boolean;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  return (
    <div className="group relative w-full overflow-hidden flex flex-col gap-4 bg-primary-light">
      <Link href={`/product/${product.id}`} className="block relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
        {/* Main Image */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
        />
        {/* Hover Image */}
        <img 
          src={product.hoverImage} 
          alt={`${product.name} Alt View`} 
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
        />

        {/* Labels/Badges */}
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-white text-text-light px-2 py-1 text-[10px] font-bold tracking-wider uppercase z-10">
            NEW
          </span>
        )}

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          <button className="w-full bg-white/90 backdrop-blur-md text-text-light py-3 text-sm font-semibold hover:bg-black hover:text-white transition-colors border border-gray-200">
            QUICK ADD
          </button>
        </div>
      </Link>
      
      {/* Product Details */}
      <div className="flex flex-col gap-1 px-2 pb-4">
        <h3 className="text-sm font-medium text-text-light group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <span className="text-sm font-light text-text-muted">₹{product.price}</span>
        
        {/* Color Swatches */}
        <div className="flex gap-2 mt-2">
          {product.colors.map((color, i) => (
            <div key={i} className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
