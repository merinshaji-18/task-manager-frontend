"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // 1. IMPORT AUTH HOOK
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminPortal() {
  const { user, loading: authLoading, logout } = useAuth(); // 2. GET LOGOUT FROM CONTEXT
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          axiosInstance.get('/admin/analytics'),
          axiosInstance.get('/admin/users/all')
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        toast.error("Access Denied", { description: "You are not authorized for this node." });
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user) {
        if (!user.is_admin) {
            router.push('/tasks');
        } else {
            fetchAdminData();
        }
    }
  }, [user, authLoading, router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-indigo-500 animate-pulse uppercase tracking-[0.5em]">Authorizing Admin...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Admin Header */}
        <header className="mb-16 flex justify-between items-start border-b border-zinc-800 pb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic text-indigo-500 uppercase">Command Deck</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em] mt-2 italic">Global Workspace Oversight</p>
          </div>
          
          {/* LOGOUT BUTTON - NOW DEFINED */}
          <button 
            onClick={logout} 
            className="bg-zinc-800 hover:bg-rose-900/40 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic border border-zinc-700 hover:border-rose-500/50 shadow-lg active:scale-95"
          >
            Terminate Session
          </button>
        </header>

        {/* Global Analytics (Excluding Admin) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 italic">Citizen Nodes (Users)</p>
            <h2 className="text-6xl font-black tracking-tighter text-white italic">{stats?.total_users}</h2>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 italic">Global Objectives</p>
            <h2 className="text-6xl font-black tracking-tighter text-white italic">{stats?.total_tasks}</h2>
          </div>
          <div className="bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2 italic">Asset Volume</p>
            <h2 className="text-6xl font-black tracking-tighter text-white italic">{stats?.total_assets}</h2>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Identity</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Data Load</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-8">
                    <p className="font-black text-zinc-200 text-sm tracking-tight">{u.name || 'Anonymous User'}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 lowercase tracking-wider">{u.email}</p>
                  </td>
                  <td className="p-8 text-center font-mono text-indigo-400 font-bold text-lg">
                    {u.task_count.toString().padStart(3, '0')}
                  </td>
                  <td className="p-8 text-right">
                    <span className="text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Standard Node
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}