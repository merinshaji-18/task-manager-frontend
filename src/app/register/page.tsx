"use client";

import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Added 'async' here to fix the "await not allowed" error
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/register', { email, password });
      alert("Account created! Please log in.");
      router.push('/login');
    } catch (err: any) {
      // Corrected the catch syntax and added specific messages
      if (err.response?.status === 422) {
        alert("Validation Error: Password must be at least 6 characters long.");
      } else if (err.response?.status === 400) {
        alert("This email is already registered.");
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Create Account</h1>
        <p className="text-zinc-500 font-medium mb-8">Join the workspace to start tracking.</p>
        
        <form onSubmit={handleRegister} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Email</label>
            <input 
              type="email" required placeholder="name@company.com" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Password (Min 6 chars)</label>
            <input 
              type="password" required placeholder="••••••••" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95 disabled:bg-zinc-300"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-8 text-sm text-zinc-400 font-medium">
          Already a member? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}