'use client';
import { useState, useEffect } from 'react';

export interface Banner {
  id: string;
  title: string;
  image: string;
  active?: boolean;
  linkProductId?: string;
}

const INITIAL_BANNERS: Banner[] = [
  { id: 'b1', title: 'Season Finale: Up to 80% Off', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=2000', active: true },
  { id: 'b2', title: 'The STREETWEAR Drop', image: 'https://images.unsplash.com/photo-1558769132-cb1fac0840c2?w=2000', active: true }
];

export function useBanners() {
  const [banners, setBannersState] = useState<Banner[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Initial Load from LocalStorage
    const saved = localStorage.getItem('onoff_banners_v1');
    if (saved) {
      setBannersState(JSON.parse(saved));
    } else {
      setBannersState(INITIAL_BANNERS);
      localStorage.setItem('onoff_banners_v1', JSON.stringify(INITIAL_BANNERS));
    }
    setIsReady(true);

    // 2. Listen to changes across multiple tabs/pages (realtime sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'onoff_banners_v1' && e.newValue) {
        setBannersState(JSON.parse(e.newValue));
      }
    };
    
    // Custom internal event to sync across same window
    const handleLocalSync = () => {
       const fresh = localStorage.getItem('onoff_banners_v1');
       if (fresh) setBannersState(JSON.parse(fresh));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('onoff-banners-update', handleLocalSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onoff-banners-update', handleLocalSync);
    };
  }, []);

  const setBanners = (newBanners: Banner[]) => {
    setBannersState(newBanners);
    localStorage.setItem('onoff_banners_v1', JSON.stringify(newBanners));
    window.dispatchEvent(new Event('onoff-banners-update'));
  };

  return { banners, setBanners, isReady };
}
