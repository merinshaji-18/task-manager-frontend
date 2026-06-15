"use client";

import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); // Initialized as empty string
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/register/request', { email, password });
      toast.success("Security Code Sent", { 
        description: "A verification code has been dispatched to your inbox." 
      });
      setStep(2);
    } catch (err: any) {
      toast.error("Registration Blocked", { 
        description: err.response?.data?.detail || "This email is already in use." 
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify and Create Account
  const handleVerifyAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/register/verify', { email, otp });
      toast.success("Identity Verified", { 
        description: "Your workspace is ready. Redirecting to login..." 
      });
      router.push('/login');
    } catch (err: any) {
      toast.error("Verification Failed", { 
        description: "The code is invalid or has expired." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter">
            {step === 1 ? "New Workspace" : "Confirm Identity"}
          </h1>
          <p className="text-zinc-500 mt-2 font-medium text-sm px-4 leading-relaxed">
            {step === 1 
              ? "Join the elite circle of productivity." 
              : "Verify your email to activate your account."}
          </p>
        </div>

        {step === 1 ? (
          /* STEP 1: INFORMATION FORM */
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="name@company.com" 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="Min. 6 characters" 
                  className="w-full bg-zinc-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all" 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200 mt-4"
            >
              {loading ? "Syncing..." : "Get Verification Code"}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION FORM */
          <form onSubmit={handleVerifyAndCreate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">6-Digit Code</label>
              <input 
                type="text" 
                required 
                placeholder="000000" 
                // CRITICAL FIXES BELOW:
                autoComplete="one-time-code" 
                value={otp} 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-center text-2xl tracking-[0.5em] text-zinc-800" 
                onChange={(e) => setOtp(e.target.value)} 
              />
            </div>
            
            <button 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200"
            >
              {loading ? "Verifying..." : "Create Account"}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setStep(1); setOtp(''); }} 
              className="w-full text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-600 transition-colors"
            >
              Go Back
            </button>
          </form>
        )}
        
        <p className="mt-8 text-sm text-zinc-400 font-medium text-center italic">
          Member already? <Link href="/login" className="text-indigo-600 font-bold not-italic hover:underline ml-1">Log in</Link>
        </p>
      </div>
    </div>
  );
}

// --- REUSABLE ICON DEFINITIONS ---

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88L2 12s3-7 10-7a9.4 9.4 0 0 1 5.43 1.76M22 12s-3 7-10 7a9.4 9.4 0 0 1-4.07-.94M2 2l20 20" />
      <path d="M12 12A3 3 0 0 0 12 12" />
    </svg>
  );
}