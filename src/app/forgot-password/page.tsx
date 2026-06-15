"use client";
import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/forgot-password', { email });
      toast.success("Code Dispatched", { description: "Identity check code sent to your email." });
      router.push(`/reset-password?email=${email}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error("Access Denied", { description: "Email not found in elite database." });
      } else {
        toast.error("System Error", { description: "Please try again later." });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 text-center">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter">Lost Access?</h1>
          <p className="text-zinc-500 mt-2 font-medium text-sm leading-relaxed">Get back into your workspace in seconds.</p>
        </div>
        
        <form onSubmit={handleRequest} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Account Email</label>
            <input type="email" required placeholder="name@company.com" className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-800 transition-all" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200">
            {loading ? "Verifying..." : "Send Reset Code"}
          </button>
        </form>
        <Link href="/login" className="mt-8 inline-block text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors italic">Return to login</Link>
      </div>
    </div>
  );
}