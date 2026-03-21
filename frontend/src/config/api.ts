/**
 * 🍱 SMARTON UNIVERSAL API CONFIG
 * 
 * If you are on Vercel or a Real Device:
 * 1. Set NEXT_PUBLIC_API_URL in Vercel/Env to your public backend link.
 * 2. If no env is found, it defaults to localhost for your computer development.
 */

export const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  // Smart detection for Browser vs Server
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If we are NOT on a local machine, we should not be seeing localhost:5000
    if (host !== 'localhost' && host !== '127.0.0.1') {
       console.warn("[SMARTON] Cloud access detected. Ensure NEXT_PUBLIC_API_URL is set in Vercel!");
    }
  }

  return 'http://localhost:5000';
};
