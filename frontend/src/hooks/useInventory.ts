'use client';
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  image: string;
  hoverImage?: string;
  sizes: string[];
  colors?: string[];
  isNew?: boolean;
}

const INITIAL_INVENTORY: Product[] = [
  {
    id: 'prod_1',
    name: 'Oversized Drop Shoulder Tee',
    price: '999',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop',
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000', '#F5F5DC'],
    isNew: true
  },
  {
    id: 'prod_2',
    name: 'Parachute Cargo Pants',
    price: '1999',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1624378439575-d1ead6eb00f1?w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop',
    sizes: ['S', 'M', 'L'],
    colors: ['#3A3B3C', '#556B2F'],
    isNew: false
  },
  {
    id: 'prod_3',
    name: 'Textured Knit Shirt',
    price: '1499',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#FDF5E6', '#000000'],
    isNew: true
  },
  {
    id: 'prod_4',
    name: 'Corduroy Overshirt',
    price: '1899',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800&auto=format&fit=crop',
    sizes: ['M', 'L', 'XL'],
    colors: ['#8B4513', '#2F4F4F'],
    isNew: false
  }
];

export function useInventory() {
  const [inventory, setInventoryState] = useState<Product[]>([]);
  const [isReady, setIsReady] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/products`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInventoryState(data.map((p: any) => ({
          ...p,
          id: p._id || p.id, // Support MongoDB ID
          price: p.price.toString()
        })));
        setIsReady(true);
      }
    } catch (err) {
      console.error('Inventory Node Offline');
      // Fallback to local storage if server is down
      const saved = localStorage.getItem('onoff_inventory_v1');
      if (saved) setInventoryState(JSON.parse(saved));
      setIsReady(true);
    }
  };

  useEffect(() => {
    fetchInventory();
    
    // Listen for manual triggers from other components
    const handleLocalSync = () => fetchInventory();
    window.addEventListener('onoff-inventory-update', handleLocalSync);
    
    const interval = setInterval(fetchInventory, 10000); // Poll for changes

    return () => {
      window.removeEventListener('onoff-inventory-update', handleLocalSync);
      clearInterval(interval);
    };
  }, []);

  const setInventory = (newInventory: Product[]) => {
    setInventoryState(newInventory);
    localStorage.setItem('onoff_inventory_v1', JSON.stringify(newInventory));
    window.dispatchEvent(new Event('onoff-inventory-update'));
  };

  return { inventory, setInventory, isReady, refresh: fetchInventory };
}
