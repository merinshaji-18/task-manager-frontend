"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  // 1. Hide Navbar if user is not logged in or on Auth pages
  const hideNav = !user || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';
  
  if (hideNav || loading) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/tasks" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <span className="text-lg font-black tracking-tighter italic text-[#3e4362]">MISSION CONTROL</span>
        </Link>
        
        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 border-r border-slate-200 pr-8 mr-2">
            <Link 
              href="/tasks" 
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === '/tasks' ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}
            >
              Stream
            </Link>

            {user?.is_admin && (
              <Link 
                href="/admin" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${pathname === '/admin' ? 'text-rose-500' : 'text-rose-400 hover:text-rose-600 animate-pulse'}`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* USER ACTIONS */}
          <div className="flex items-center gap-4">
            <button 
                onClick={logout}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
            >
                Logout
            </button>
            
            <Link href="/profile" className="group relative">
                <div className="h-10 w-10 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm group-hover:border-indigo-500 transition-all">
                    {user?.profile_pic ? (
                        <img src={user.profile_pic} alt="User" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-sm font-black text-indigo-600 uppercase">
                          {user?.full_name ? user.full_name[0] : user?.email[0]}
                        </span>
                    )}
                </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}