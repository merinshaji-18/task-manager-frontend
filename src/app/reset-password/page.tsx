"use client";

import { useState, Suspense } from 'react'; // Added Suspense
import { useSearchParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

// 1. Move the form logic into a separate component
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/reset-password', { email, otp, new_password: newPassword });
      alert("Security updated! Your workspace is now secure.");
      router.push('/login');
    } catch {
      alert("Verification failed. Please check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tighter">Secure Your Space</h1>
        <p className="text-zinc-500 mt-2 font-medium text-sm px-4">Set a password you'll actually remember.</p>
      </div>
      
      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">6-Digit Code</label>
          <input 
            type="text" 
            required 
            placeholder="000000" 
            className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" 
            onChange={(e) => setOtp(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">New Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="••••••••" 
              className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all" 
              onChange={(e) => setNewPassword(e.target.value)} 
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
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200"
        >
          {loading ? "Verifying..." : "Update Security"}
        </button>
      </form>
    </div>
  );
}

// 2. Main Page component wraps the form in Suspense
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 selection:bg-indigo-100">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium text-sm tracking-widest uppercase">Initialising...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

// --- ICON DEFINITIONS ---

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