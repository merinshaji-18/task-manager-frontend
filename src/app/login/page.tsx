"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios'; // Use your configured instance
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // FastAPI Login requires Form Data
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // We use axiosInstance which already uses NEXT_PUBLIC_API_URL from your .env
      const res = await axiosInstance.post('/login', formData);
      
      // Use the login function from AuthContext
      await login(res.data.access_token);
      
    } catch (err) {
      console.error(err);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 font-medium">Log in to your professional workspace.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              required 
              placeholder="name@company.com" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-zinc-800 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Password
            </label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium text-zinc-800 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-indigo-200 mt-4">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400 font-medium">
          New here? <Link href="/register" className="text-zinc-900 font-bold hover:underline ml-1">Create account</Link>
        </p>
      </div>
    </div>
  );
}