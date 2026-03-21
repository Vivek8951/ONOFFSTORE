'use client';
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';

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

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/orders/admin/all`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrdersState(data.map((o: any) => ({
          ...o,
          id: o._id || o.id, // Support MongoDB ID
          user: o.customerDetails?.name || 'Unknown Member',
          total: `₹${o.totalAmount || 0}`,
          status: o.paymentDetails?.status || 'Pending',
          item: o.items?.[0]?.name || 'N/A',
          size: o.items?.[0]?.size || 'N/A',
          date: new Date(o.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        })));
        setIsReady(true);
      }
    } catch (err) {
      console.error('Order Node Offline');
      const saved = localStorage.getItem('onoff_orders_v1');
      if (saved) setOrdersState(JSON.parse(saved));
      setIsReady(true);
    }
  };

  useEffect(() => {
    fetchOrders();
    const handleLocalSync = () => fetchOrders();
    window.addEventListener('onoff-orders-update', handleLocalSync);
    
    const interval = setInterval(fetchOrders, 10000); // Poll for changes

    return () => {
      window.removeEventListener('onoff-orders-update', handleLocalSync);
      clearInterval(interval);
    };
  }, []);

  const setOrders = (newOrders: Order[]) => {
    setOrdersState(newOrders);
    localStorage.setItem('onoff_orders_v1', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('onoff-orders-update'));
  };

  const addOrder = (order: Order) => {
    setOrdersState(prev => [order, ...prev]);
    window.dispatchEvent(new Event('onoff-orders-update'));
  };

  return { orders, setOrders, addOrder, isReady, refresh: fetchOrders };
}
