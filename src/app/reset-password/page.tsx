"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

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
      toast.success("Security Updated", { description: "Your workspace is now secure. Please log in." });
      router.push('/login');
    } catch {
      toast.error("Update Failed", { description: "Invalid code or security error." });
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter">Secure Your Space</h1>
        <p className="text-zinc-500 mt-2 font-medium text-sm leading-relaxed">Set a password you'll actually remember.</p>
      </div>
      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">6-Digit Code</label>
          <input type="text" required placeholder="000000" className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" onChange={(e) => setOtp(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">New Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="w-full p-4 bg-zinc-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all" onChange={(e) => setNewPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
               {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          {loading ? "Syncing..." : "Update Security"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 selection:bg-indigo-100">
      <Suspense fallback={<div className="animate-pulse font-bold text-zinc-300">Workspace Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

function EyeIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>; }
function EyeOffIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L2 12s3-7 10-7a9.4 9.4 0 0 1 5.43 1.76M22 12s-3 7-10 7a9.4 9.4 0 0 1-4.07-.94M2 2l20 20" /><path d="M12 12A3 3 0 0 0 12 12" /></svg>; }