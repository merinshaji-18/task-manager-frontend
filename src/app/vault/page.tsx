"use client";

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientVault() {
  const { user, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [viewingFile, setViewingFile] = useState<{url: string, name: string} | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user) fetchVault();
  }, [user, authLoading, router]);

  const fetchVault = async () => {
    try {
      const res = await axiosInstance.get('/tasks/vault/all');
      setFiles(res.data);
    } catch (error) {
      console.error("Vault access error", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FAST FIX: GOOGLE PDF VIEWER WRAPPER ---
  const getDisplayUrl = (url: string) => {
    if (url.toLowerCase().endsWith('.pdf')) {
      // This forces the PDF to render in the browser via Google's engine
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const groupedFiles = files.reduce((acc: any, file: any) => {
    const client = file.client || 'General';
    if (!acc[client]) acc[client] = [];
    acc[client].push(file);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-200 animate-pulse uppercase tracking-[0.4em] text-xs">Syncing Vault...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-12 font-sans selection:bg-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16 flex justify-between items-end bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-sm">
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic text-indigo-600">Client Vault</h1>
            <p className="text-[#717694] text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-60">Asset Repository</p>
          </div>
          <Link href="/tasks" className="text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-all italic underline decoration-2 underline-offset-8">Return to Flow</Link>
        </header>

        {files.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/40">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Vault Empty</p>
          </div>
        ) : (
          <div className="grid gap-14">
            {Object.keys(groupedFiles).map(client => (
              <section key={client}>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 ml-4">@{client}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {groupedFiles[client].map((file: any) => (
                    <div 
                        key={file.id} 
                        onClick={() => setViewingFile({url: file.file_url, name: file.file_name})}
                        className="bg-white border border-slate-200 p-7 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group flex items-center gap-5"
                    >
                        <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                            <h3 className="font-black text-[#3e4362] truncate text-sm tracking-tight">{file.file_name}</h3>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1 italic">Task Context: {file.task_title}</p>
                        </div>
                        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* --- ASSET VIEWER MODAL --- */}
      {viewingFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-xl" onClick={() => setViewingFile(null)}></div>
          
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-white/10">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
               <div>
                 <h2 className="font-black text-[#3e4362] uppercase text-xs tracking-widest truncate max-w-md">{viewingFile.name}</h2>
                 <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">Encrypted Asset Stream</p>
               </div>
               <button onClick={() => setViewingFile(null)} className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm font-bold">✕</button>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-zinc-200/50 overflow-hidden flex items-center justify-center relative">
              {viewingFile.url.toLowerCase().endsWith('.pdf') ? (
                <iframe 
                    // WE USE THE GOOGLE WRAPPER URL HERE
                    src={getDisplayUrl(viewingFile.url)} 
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                />
              ) : (
                <img src={viewingFile.url} alt="Asset" className="max-w-full max-h-full object-contain p-4" />
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-white text-center border-t border-zinc-100 flex justify-center gap-6">
                <a 
                    href={viewingFile.url} 
                    download={viewingFile.name}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:underline tracking-widest"
                >
                    Direct Download 💾
                </a>
                <a 
                    href={viewingFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] font-black uppercase text-indigo-400 hover:underline tracking-widest"
                >
                    Original Cloud Source ↗
                </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}