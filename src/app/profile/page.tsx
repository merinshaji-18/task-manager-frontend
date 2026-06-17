"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setFullName(user.full_name || '');
        setBio(user.bio || '');
      }
    }
  }, [user, authLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update the database
      await axiosInstance.put('/users/profile', { full_name: fullName, bio });
      
      // 2. Refresh the global user state (so the Avatar updates)
      await refreshUser(); 
      
      // 3. Show Success message
      toast.success("Identity Updated", { 
        description: "Your workspace profile is now current. Redirecting..." 
      });

      // 4. REDIRECT TO TASKS
      // We use a small timeout so the user sees the success toast
      setTimeout(() => {
        router.push('/tasks');
      }, 1500);

    } catch (error) {
      toast.error("Update Failed", { description: "Please check your network connection." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-bold text-zinc-200 animate-pulse uppercase tracking-widest text-xs">
      Syncing Profile...
    </div>
  );

  const userInitial = fullName ? fullName.charAt(0) : user?.email?.charAt(0);

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 selection:bg-indigo-100 font-sans">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 p-12 rounded-[3rem] shadow-xl shadow-zinc-200/40">
        
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="h-24 w-24 bg-indigo-600 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-2xl mb-4 border-4 border-white uppercase transition-all hover:scale-105">
            {userInitial}
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tighter italic">Professional Identity</h1>
          <p className="text-zinc-400 font-medium text-[10px] uppercase tracking-[0.3em] mt-2">Freelancer Node Verified</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Account Email</label>
              <input type="text" disabled value={user?.email || ''} className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-medium text-zinc-400 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe" 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all shadow-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Professional Bio / Position</label>
            <textarea 
              rows={3}
              placeholder="Describe your role or expertise..." 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all shadow-sm"
              value={bio}
              onChange={(e) => setBio(e.target.value)} 
            />
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button 
              disabled={saving}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200"
            >
              {saving ? "Syncing Workspace..." : "Update & Return to Control Center"}
            </button>
            <Link href="/tasks" className="text-center text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors italic">
              Discard changes
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}