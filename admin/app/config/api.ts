export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // For mobile/external access to dev server
    if (host !== 'localhost' && host !== '127.0.0.1') {
       return 'http://' + host + ':5000'; 
    }
  }
  return 'http://localhost:5000';
};
