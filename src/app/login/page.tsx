"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await axiosInstance.post('/login', formData);
      await login(res.data.access_token);
      
    } catch (err) {
      alert("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 selection:bg-indigo-100">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        
        {/* CATCHY FONT & CAPTION DESIGN */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 font-medium text-sm">Log in to your professional workspace.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2 text-left">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              required 
              placeholder="name@company.com"
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Password Field with Eye Icon & Forgot Link */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-bold text-zinc-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
              >
                Forgot?
              </Link>
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                className="w-full bg-zinc-50 border-none p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
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

          {/* INDIGO BUTTON DESIGN */}
          <button 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200 mt-4"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400 font-medium italic">
          New here? <Link href="/register" className="text-indigo-600 font-bold not-italic hover:underline ml-1">Create account</Link>
        </p>
      </div>
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