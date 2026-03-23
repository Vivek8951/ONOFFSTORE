'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';

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
      const res = await fetch(`${getApiUrl()}/api/auth/send-otp`, {
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
      alert(`Authentication server is offline.\n\nTarget URL: ${getApiUrl()}\n\nReason: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/auth/verify-otp`, {
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
    <div className="min-h-screen bg-[var(--indian-cream)] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[var(--indian-gold)] selection:text-white">
      {/* Editorial Background */}
      <div className="absolute inset-0 opacity-20 sepia-[0.3]">
        <img 
          src="https://images.unsplash.com/photo-1583391733958-d25e07fac66a?w=1200&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Campaign"
        />
        <div className="absolute inset-0 bg-[var(--indian-cream)]/80 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-serif font-semibold italic tracking-tighter text-[var(--indian-maroon)] mb-2 uppercase">SMART<span className="text-[var(--indian-gold)]">ON</span></h1>
          <p className="text-[10px] font-serif font-semibold uppercase tracking-[1.5em] text-[var(--indian-maroon)]/60">Member Entrance</p>
        </div>

        <div className="bg-white/90 backdrop-blur-3xl border border-[var(--indian-gold)]/30 p-10 md:p-16 rounded-[40px] shadow-2xl">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-gold)] text-center block w-full">Identification</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="PHONE NUMBER" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-transparent border-b border-[var(--indian-maroon)]/20 p-6 font-serif font-semibold text-3xl text-center text-[var(--indian-maroon)] outline-none focus:border-[var(--indian-gold)] transition-colors placeholder:text-[var(--indian-maroon)]/30"
                    required 
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-sm font-serif font-semibold uppercase tracking-[0.3em] text-[12px] hover:bg-[var(--indian-gold)] hover:text-white active:scale-95 transition-all shadow-xl disabled:opacity-50 border border-[var(--indian-maroon)]"
              >
                {isLoading ? 'Requesting...' : 'Request Access'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-8">
              <div className="space-y-4 text-center">
                <label className="text-[10px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-gold)]">Verify Authenticity</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="∙ ∙ ∙ ∙ ∙ ∙"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--indian-maroon)]/20 p-6 font-mono font-semibold text-4xl text-center text-[var(--indian-maroon)] outline-none focus:border-[var(--indian-gold)] tracking-[0.5em] placeholder:text-[var(--indian-maroon)]/30 uppercase"
                  required
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || otp.length < 6}
                className="bg-[var(--indian-maroon)] text-[var(--indian-gold)] py-6 rounded-sm font-serif font-semibold uppercase tracking-[0.3em] text-[12px] hover:bg-[var(--indian-gold)] hover:text-white active:scale-95 transition-all shadow-xl disabled:opacity-50 border border-[var(--indian-maroon)]"
              >
                {isLoading ? 'Verifying...' : 'Validate Member'}
              </button>

              <button 
                type="button" 
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="text-[9px] font-serif font-semibold uppercase tracking-widest text-[var(--indian-maroon)]/60 hover:text-[var(--indian-gold)] transition-colors"
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
