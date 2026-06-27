"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Added for Auth Protection
import axiosInstance from '@/lib/axios';
import Link from 'next/link';

export default function TaskInsightPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get auth state
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState<{url: string, name: string} | null>(null);

  useEffect(() => {
    // 1. If Auth is finished loading and there is no user, send to login
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // 2. Only fetch if we have a user and an ID
    if (user && id) {
      fetchDetails();
    }
  }, [id, user, authLoading, router]);

  const fetchDetails = async () => {
    try {
      const res = await axiosInstance.get(`/tasks/${id}`);
      setTask(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayUrl = (url: string) => {
    if (url.toLowerCase().endsWith('.pdf')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${d}-${m}-${y} • ${hours}:${minutes} ${ampm}`;
  };

  // 3. FIX: Early return if data isn't ready. This prevents the "Cannot read category of null" error.
  if (authLoading || loading || !task) return (
    <div className="min-h-screen flex items-center justify-center font-black text-zinc-200 animate-pulse uppercase tracking-[0.4em]">
      Decrypting Node...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-8 px-6 font-sans selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto">
        
        {/* COMPACT TOP NAV */}
        <div className="mb-6 flex justify-between items-center px-2 text-left">
          <Link href="/tasks" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-all italic underline underline-offset-8 decoration-2">← Back to Stream</Link>
          
        </div>

        {/* HEADER & METRICS */}
        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/10 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-left">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest italic">@{task.category}</span>
            <h1 className="text-5xl font-black text-[#3e4362] tracking-tighter italic mt-2 uppercase leading-none">{task.title}</h1>
          </div>

          <div className="flex gap-6 bg-[#f8f9fc] p-5 rounded-3xl border border-slate-100">
             <div className="text-center px-2">
                <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-1 italic">Priority</p>
                <p className="font-black text-xs uppercase text-indigo-600 tracking-tighter italic">{task.priority}</p>
             </div>
             <div className="w-[1px] bg-slate-200 h-8"></div>
             <div className="text-center px-2">
                <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-1 italic">Status</p>
                <p className="font-black text-xs uppercase text-[#3e4362] tracking-tighter italic">{task.status}</p>
             </div>
             {task.due_date && (
                <>
                <div className="w-[1px] bg-slate-200 h-8"></div>
                <div className="text-center px-2">
                    <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1 italic">Deadline</p>
                    <p className="font-black text-[10px] text-rose-500 tracking-tighter italic whitespace-nowrap">{formatDateTime(task.due_date)}</p>
                </div>
                </>
             )}
          </div>
        </div>

        {/* ALIGNED GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] flex-1 text-left shadow-sm">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-6 italic border-b border-zinc-50 pb-2">Tactical Brief</h2>
               <p className="text-zinc-600 text-lg leading-relaxed font-semibold italic">"{task.description || "No tactical parameters defined for this node."}"</p>
            </div>

            <Link href={`/tasks/edit/${task.id}`} className="bg-indigo-600 text-white py-5 rounded-[2rem] text-center font-black uppercase text-[11px] tracking-[0.3em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                Modify Node Parameters
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm text-left">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-6 italic border-b border-zinc-50 pb-2 text-indigo-500">Cloud Assets</h2>
               <div className="space-y-2">
                 {!task.attachments || task.attachments.length === 0 ? (
                    <p className="text-zinc-300 text-[9px] uppercase font-black text-center py-2">No Vaulted Files</p>
                 ) : task.attachments.map((file: any) => (
                   <div key={file.id} onClick={() => setViewingFile({url: file.file_url, name: file.file_name})} className="bg-zinc-50 p-3 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                        <span className="text-sm">📎</span>
                        <p className="text-[10px] font-black text-zinc-500 truncate uppercase flex-1 px-3">{file.file_name}</p>
                        <span className="text-[9px] font-black uppercase text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm text-left flex-1">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-6 italic border-b border-zinc-50 pb-2">Checkpoints</h2>
               <div className="space-y-3">
                 {!task.sub_tasks || task.sub_tasks.length === 0 ? (
                    <p className="text-zinc-300 text-[9px] uppercase font-black text-center py-2">Sequence Empty</p>
                 ) : task.sub_tasks.map((st: any) => (
                   <div key={st.id} className="flex items-center gap-4">
                     <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all ${st.is_completed ? 'bg-zinc-900 border-zinc-900 shadow-lg' : 'border-slate-100'}`}>
                        {st.is_completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="6"><polyline points="20 6 9 17 4 12"/></svg>}
                     </div>
                     <span className={`font-black text-[10px] uppercase tracking-tight ${st.is_completed ? 'text-zinc-300 line-through italic' : 'text-[#3e4362]'}`}>{st.title}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEWER MODAL */}
      {viewingFile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-[#09090b]/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setViewingFile(null)}></div>
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10 animate-in zoom-in-95 duration-300 text-left">
            <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
               <h2 className="font-black text-[#3e4362] uppercase text-[10px] tracking-[0.3em] truncate max-w-md italic">{viewingFile.name}</h2>
               <button onClick={() => setViewingFile(null)} className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 hover:text-rose-500 transition-all">✕</button>
            </div>
            <div className="flex-1 bg-zinc-200/50 overflow-hidden flex items-center justify-center relative">
              {viewingFile.url.toLowerCase().endsWith('.pdf') ? (
                <iframe src={getDisplayUrl(viewingFile.url)} className="w-full h-full border-none" title="PDF" />
              ) : (
                <img src={viewingFile.url} alt="Asset" className="max-w-full max-h-full object-contain p-4 shadow-2xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}