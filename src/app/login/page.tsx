"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // FastAPI Login requires Form Data
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await axios.post('http://127.0.0.1:8000/login', formData);
      
      // Save the key to your computer's memory
      localStorage.setItem('token', res.data.access_token);
      
      // Send user to their workspace
      router.push('/tasks');
    } catch (err) {
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
          <input 
            type="email" required placeholder="Email Address" 
            className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" required placeholder="Password" 
            className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95 shadow-indigo-200">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400 font-medium">
          New here? <Link href="/register" className="text-zinc-900 font-bold hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}