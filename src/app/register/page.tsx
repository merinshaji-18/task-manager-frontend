"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/register', { email, password });
      alert("Account created! Please log in.");
      router.push('/login');
    } catch (err) {
      alert("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Join Workspace</h1>
          <p className="text-zinc-500 mt-2 font-medium">Create an account to start tracking.</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <input 
            type="email" required placeholder="Email Address" 
            className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" required placeholder="Create Password" 
            className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-95">
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-zinc-400 font-medium">
          Already a member? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}