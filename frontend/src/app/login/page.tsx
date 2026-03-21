'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate OTP Send
    setTimeout(() => {
      setStep('otp');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate Verification
    setTimeout(() => {
      localStorage.setItem('onoff_user_token', 'demo_token_123');
      router.push('/');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-40">
      <div className="w-full max-w-md">
        <div className="text-center mb-12 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="SMARTON BY ONOFF" 
            className="h-32 md:h-48 w-auto object-contain hover:grayscale transition-all duration-700" 
          />
          <p className="text-[12px] font-black uppercase tracking-[0.8em] text-gray-200 mt-6 leading-none">PREMIUM FASHION HUB</p>
        </div>

        <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[15px_15px_0px_0px_rgba(0,0,0,0.05)] rounded-2xl">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-6 animate-fade-in-up">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mobile Number</label>
                <div className="flex gap-4">
                  <span className="flex items-center justify-center bg-gray-50 border-2 border-black px-4 font-bold rounded-xl">+91</span>
                  <input 
                    type="tel" 
                    placeholder="99999 99999" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 border-2 border-black p-4 font-black text-xl rounded-xl outline-none focus:bg-gray-50 transition-colors"
                    required 
                    maxLength={10}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Get OTP Code'}
              </button>
              
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
                By continuing, you agree to ONOFF's Terms of Service and Privacy Policy.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 animate-fade-in-up">
              <div className="space-y-2 text-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enter 6-Digit Code</label>
                <div className="flex justify-between gap-2 mt-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input 
                      key={i}
                      type="text" 
                      maxLength={1}
                      className="w-12 h-16 border-2 border-black text-center font-black text-2xl rounded-xl outline-none focus:bg-gray-50"
                      onChange={(e) => {
                         if (e.target.value && i < 6) {
                            // Simple auto-focus shift logic would go here in real app
                         }
                         setOtp(prev => prev + e.target.value);
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#f21c43] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Login Now'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
           <div className="flex items-center gap-4 w-full text-gray-300">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Or Continue With</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
           </div>
           
           <div className="flex gap-4">
              <button className="border-2 border-gray-100 p-4 rounded-full hover:border-black transition-all hover:scale-110">
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              </button>
              <button className="border-2 border-gray-100 p-4 rounded-full hover:border-black transition-all hover:scale-110">
                 <img src="https://www.svgrepo.com/show/448234/facebook.svg" className="w-6 h-6" alt="FB" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
