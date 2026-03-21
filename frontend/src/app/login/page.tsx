'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return alert('Enter a valid 10-digit number');
    
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep('otp');
        alert(`[DEMO] OTP Sent! Testing mode: Use ${data.mockOTP}`);
      }
    } catch (err: any) {
      const targetUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      alert(`Authentication server is offline.\n\nTarget URL: ${targetUrl}\n\nReason: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, code: otp })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('onoff_user_token', data.token);
        localStorage.setItem('onoff_user_profile', JSON.stringify(data.user));
        // REDIRECT TO SHOP AFTER LOGIN
        router.push('/shop');
      } else {
        alert(data.message || 'Access Denied');
      }
    } catch (err) {
      alert('Error connecting to authentication gate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Editorial Background */}
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Campaign"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-2 uppercase">SMART<span className="text-[#f21c43]">ON</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[1.5em] text-gray-500">Member Entrance</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-16 rounded-[40px] shadow-2xl">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#f21c43] text-center block w-full">Identification</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="PHONE NUMBER" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/20 p-6 font-black text-3xl text-center text-white outline-none focus:border-[#f21c43] transition-colors placeholder:text-white/10"
                    required 
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-white text-black py-6 rounded-full font-black uppercase tracking-[0.3em] text-lg hover:bg-[#f21c43] hover:text-white active:scale-95 transition-all shadow-2xl disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Request Access'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-8">
              <div className="space-y-4 text-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Verify Authenticity</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="∙ ∙ ∙ ∙ ∙ ∙"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 p-6 font-black text-4xl text-center text-white outline-none focus:border-[#f21c43] tracking-[0.5em] placeholder:text-white/10 uppercase"
                  required
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || otp.length < 6}
                className="bg-[#f21c43] text-white py-6 rounded-full font-black uppercase tracking-[0.3em] text-lg hover:bg-white hover:text-black active:scale-95 transition-all shadow-2xl disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Validate Member'}
              </button>

              <button 
                type="button" 
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Correction Required? Back
              </button>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
