'use client';
import { useState, useEffect } from 'react';

export interface Order {
  id: string;
  _id?: string; // MongoDB real ID
  user: string;
  total: string;
  status: 'Pending' | 'Accepted' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  item: string;
  size: string;
  date: string;
  trackingId?: string;
  courier?: string;
  address?: string;
  customerDetails?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

const INITIAL_ORDERS: Order[] = [
  { 
    id: '#1004', 
    user: 'Rahul Sharma', 
    total: '₹1,999', 
    status: 'Pending', 
    item: 'Parachute Cargo Pants', 
    size: 'M',
    date: 'Oct 21, 2024, 10:23 AM',
    address: 'H-456, Green Park, South Delhi - 110016'
  },
  { 
    id: '#1003', 
    user: 'Priya Verma', 
    total: '₹4,500', 
    status: 'Shipped', 
    item: 'Oversized Drop Shoulder Tee', 
    size: 'L',
    date: 'Oct 20, 2024, 02:15 PM',
    trackingId: 'ONOFF-TRACK-89234',
    courier: 'BlueDart Premium',
    address: 'Flat 202, Sea View Apts, Bandra West, Mumbai - 400050'
  },
];

export function useOrders() {
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Initial Load from LocalStorage
    const saved = localStorage.getItem('onoff_orders_v1');
    if (saved) {
      setOrdersState(JSON.parse(saved));
    } else {
      setOrdersState(INITIAL_ORDERS);
      localStorage.setItem('onoff_orders_v1', JSON.stringify(INITIAL_ORDERS));
    }
    setIsReady(true);

    // 2. Listen to changes across multiple tabs/pages (realtime sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'onoff_orders_v1' && e.newValue) {
        setOrdersState(JSON.parse(e.newValue));
      }
    };
    
    // Custom internal event to sync across same window
    const handleLocalSync = () => {
       const fresh = localStorage.getItem('onoff_orders_v1');
       if (fresh) setOrdersState(JSON.parse(fresh));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('onoff-orders-update', handleLocalSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onoff-orders-update', handleLocalSync);
    };
  }, []);

  const setOrders = (newOrders: Order[]) => {
    setOrdersState(newOrders);
    localStorage.setItem('onoff_orders_v1', JSON.stringify(newOrders));
    // Dispatch event so other components on same page re-render instantly without refresh
    window.dispatchEvent(new Event('onoff-orders-update'));
  };

  const addOrder = (order: Order) => {
    const current = localStorage.getItem('onoff_orders_v1');
    const orders = current ? JSON.parse(current) : [];
    const updated = [order, ...orders];
    setOrders(updated);
  };

  return { orders, setOrders, addOrder, isReady };
}
