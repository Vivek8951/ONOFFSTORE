'use client';

import { Order } from '../hooks/useOrders';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-black text-white p-6 flex justify-between items-center shrink-0 border-b-2 border-[#f21c43]">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">SMART<span className="text-[#f21c43]">ON</span></h2>
            <p className="text-[7px] font-black tracking-[0.4em] text-gray-500 mt-1 uppercase">Official Invoice • By ONOFF Store</p>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Invoice Content */}
        <div id="printable-invoice" className="p-8 md:p-12 overflow-y-auto bg-[#fafafa]">
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Number</p>
              <h3 className="text-xl font-black mb-4">{order.id}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Date Issued</p>
              <p className="font-bold text-sm tracking-tight">{order.date}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-200">Payment Successful</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12 border-y border-gray-100 py-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Billed To</p>
              <p className="font-black text-lg uppercase tracking-tight mb-1">{order.user}</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{order.address}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Merchant</p>
              <p className="font-black text-lg uppercase tracking-tight mb-1">SMARTON BY ONOFF Fashion</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Central Logistics Hub<br/>BKC Corporate Park, Mumbai</p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Item Description</th>
                <th className="text-right py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Qty</th>
                <th className="text-right py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-6">
                  <p className="font-black uppercase tracking-tight text-sm mb-1">{order.item}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Size: {order.size}</p>
                </td>
                <td className="py-6 text-right font-bold text-sm">01</td>
                <td className="py-6 text-right font-black text-sm">{order.total}</td>
              </tr>
            </tbody>
          </table>

          <div className="max-w-[200px] ml-auto space-y-3">
             <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{order.total}</span>
             </div>
             <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
             </div>
             <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                <span className="font-black uppercase tracking-widest text-sm">Amount Paid</span>
                <span className="font-black text-lg text-[#f21c43]">{order.total}</span>
             </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-dashed border-gray-200 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">This is a digital generated receipt. No physical signature is required.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 border-2 border-black py-4 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors">Close</button>
          <button onClick={handlePrint} className="flex-1 bg-black text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Download / Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
