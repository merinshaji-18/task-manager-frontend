"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI States
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  // Function to send OTP via Brevo (Backend call)
  const handleSendOtp = async () => {
    if (!email) return alert("Please enter your email first");
    setLoading(true);
    try {
      await axiosInstance.post('/send-otp', { email });
      setIsOtpSent(true);
      alert("OTP sent to your email. Valid for 5 minutes.");
    } catch (err) {
      alert("User not found or failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      
      if (loginMode === 'password') {
        formData.append('password', password);
      } else {
        formData.append('otp', otp);
      }

      const res = await axiosInstance.post('/login', formData);
      await login(res.data.access_token);
      
    } catch (err) {
      console.error(err);
      alert(loginMode === 'password' ? "Invalid credentials" : "OTP expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-500 mt-2 font-medium">Access your professional workspace.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field (Always visible) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Email Address</label>
            <input 
              type="email" required placeholder="name@company.com" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-800 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* Conditional Field: Password or OTP */}
          {loginMode === 'password' ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Password</label>
                <button 
                  type="button" 
                  onClick={() => setLoginMode('otp')}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                >
                  Use OTP Instead
                </button>
              </div>
              <input 
                type="password" required placeholder="••••••••" 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-800 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">One-Time Password</label>
                <button 
                  type="button" 
                  onClick={() => setLoginMode('password')}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                >
                  Use Password
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" required placeholder="6-digit code" 
                  className="flex-1 bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-zinc-800 transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="bg-zinc-900 text-white px-4 rounded-2xl text-xs font-bold hover:bg-zinc-800 disabled:bg-zinc-300 transition-all"
                >
                  {isOtpSent ? "Resend" : "Send"}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-indigo-200 mt-4 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400 font-medium">
          New here? <Link href="/register" className="text-zinc-900 font-bold hover:underline ml-1">Create account</Link>
        </p>
      </div>
    </div>
  );
}