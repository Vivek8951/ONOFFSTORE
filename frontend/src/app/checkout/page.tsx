'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useOrders, Order } from '../../hooks/useOrders';
import InvoiceModal from '../../components/InvoiceModal';

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('John Doe');
  
  const { addOrder } = useOrders();

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Create new order object
    const newOrderId = `ONOFF-${Math.floor(Math.random() * 9000) + 1000}`;
    const newOrder: Order = {
      id: newOrderId,
      user: name,
      total: '₹16,998',
      status: 'Pending',
      item: 'Oversized Parachute Pants + Essential Utility Jacket',
      size: 'M / L',
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      address: '123 Fashion Street, Mumbai, 400001',
      customerDetails: {
        name: name,
        email: email,
        phone: '9999999999',
        address: '123 Fashion Street, Mumbai, 400001'
      }
    };

    // Simulate Razorpay/Dummy Payment Gateway delay
    setTimeout(() => {
      addOrder(newOrder);
      setLastOrder(newOrder);
      setPlacedOrderId(newOrderId);
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col pt-32">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-10 flex flex-col lg:flex-row gap-12">
        {paymentSuccess ? (
          <div className="w-full bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Payment Successful!</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Thank you for your purchase. A confirmation email has been sent to your registered ID. This was a dummy payment interface.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowInvoice(true)}
                className="bg-white text-black border-2 border-black px-10 py-4 font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                View Digital Bill
              </button>
              <a href="/track" className="bg-black text-white px-10 py-4 font-black uppercase tracking-widest text-sm hover:bg-[#f21c43] transition-all flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10H3"></path><path d="M21 6H3"></path><path d="M21 14H3"></path><path d="M21 18H3"></path></svg>
                Track Your Shipment
              </a>
            </div>

            {showInvoice && (
              <InvoiceModal order={lastOrder} onClose={() => setShowInvoice(false)} />
            )}
          </div>
        ) : (
          <>
            {/* Left side - Form */}
            <div className="flex-1">
              <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Checkout</h1>
              
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-bold uppercase mb-4 border-b pb-2">1. Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" className="border p-4 rounded bg-gray-50 focus:outline-none focus:border-black font-medium" value={name} onChange={(e) => setName(e.target.value)} required />
                  <input type="email" placeholder="Email Address (For Bill & Tracking)" className="border p-4 rounded bg-gray-50 focus:outline-none focus:border-black font-medium" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <input type="text" placeholder="Shipping Address" className="border p-4 rounded bg-gray-50 focus:outline-none focus:border-black md:col-span-2 font-medium" defaultValue="123 Fashion Street, Mumbai, 400001" required />
                  <input type="text" placeholder="Phone Number" className="border p-4 rounded bg-gray-50 focus:outline-none focus:border-black font-medium" defaultValue="91+ 8234-5678" required />
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-0 right-0 bg-[#f21c43] text-white text-xs font-bold px-3 py-1 uppercase rounded-tr-xl rounded-bl-xl">Testing Mode</div>
                <h2 className="text-lg font-bold uppercase mb-4 border-b pb-2">2. Payment Method</h2>
                
                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 p-4 border rounded font-bold uppercase ${paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
                  >
                    Credit / Debit Card
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 p-4 border rounded font-bold uppercase ${paymentMethod === 'upi' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}
                  >
                    UPI / QR
                  </button>
                </div>

                <form onSubmit={handlePayment}>
                  {paymentMethod === 'card' ? (
                    <div className="flex flex-col gap-4 animate-fade-in-up">
                      <input type="text" placeholder="Card Number (Dummy)" defaultValue="4111 1111 1111 1111" className="border p-3 rounded bg-gray-50 focus:outline-none focus:border-black" required />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" defaultValue="12/25" className="border p-3 rounded bg-gray-50 focus:outline-none focus:border-black" required />
                        <input type="text" placeholder="CVV" defaultValue="123" className="border p-3 rounded bg-gray-50 focus:outline-none focus:border-black" required />
                      </div>
                      <input type="text" placeholder="Name on Card" defaultValue="JOHN DOE" className="border p-3 rounded bg-gray-50 focus:outline-none focus:border-black" required />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 animate-fade-in-up items-center py-6">
                      <div className="w-40 h-40 bg-gray-200 flex items-center justify-center font-bold text-gray-500 rounded-lg border-2 border-dashed border-gray-400">
                        DUMMY QR
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Scan QR or enter UPI ID below</p>
                      <input type="text" placeholder="yourname@upi" defaultValue="dummy@razorpay" className="border p-3 rounded w-full bg-gray-50 focus:outline-none focus:border-black text-center" />
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full mt-8 bg-black text-white font-black text-lg py-4 uppercase tracking-wider hover:bg-[#f21c43] transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {isProcessing ? (
                      <span className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-white rounded-full"></span>
                    ) : (
                      'Pay Securely ₹16,998'
                    )}
                  </button>
                  <p className="text-xs text-gray-400 mt-4 text-center">Your payment info is safely encrypted. (Dummy Gateway - Future Razorpay Integration)</p>
                </form>
              </div>
            </div>

            {/* Right side - Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-36">
                <h2 className="text-xl font-black uppercase mb-6 border-b pb-4">Order Summary</h2>
                
                <div className="flex flex-col gap-6 mb-6">
                  {/* Item 1 */}
                  <div className="flex gap-4">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop" className="w-20 h-24 object-cover rounded" alt="Item" />
                    <div>
                      <h3 className="font-bold text-sm uppercase">Oversized Parachute Pants</h3>
                      <p className="text-xs text-gray-500 mb-1">Color: Olive, Size: M</p>
                      <p className="font-bold">₹8,499</p>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="flex gap-4">
                    <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&auto=format&fit=crop" className="w-20 h-24 object-cover rounded" alt="Item" />
                    <div>
                      <h3 className="font-bold text-sm uppercase">Essential Utility Jacket</h3>
                      <p className="text-xs text-gray-500 mb-1">Color: Black, Size: L</p>
                      <p className="font-bold">₹8,499</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">₹16,998</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                </div>
                
                <div className="border-t mt-4 pt-4 flex justify-between items-center text-lg">
                  <span className="font-black uppercase">Total</span>
                  <span className="font-black text-[#f21c43]">₹16,998</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
