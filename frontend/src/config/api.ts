export const getApiUrl = () => {
  // 1. Cloud Authority (Vercel Secrets)
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // 2. Global Secure Bridge (Phone to Laptop Everywhere)
    if (host !== 'localhost' && host !== '127.0.0.1') {
       return 'https://onoffstore.onrender.com'; // YOUR SECURE GLOBAL LINK
    }
  }

  // 3. Dev Machine Fallback
  return 'http://localhost:5000';
};
