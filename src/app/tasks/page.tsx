"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/taskService';
import { Task } from '@/types/task';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';


function TaskListContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      toast.success("SYSTEM SECURED", {
        description: "Google Calendar connection established.",
        style: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }
      });
      window.history.replaceState({}, '', '/tasks');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (user.is_admin) router.push('/admin');
      else loadTasks();
    }
  }, [user, authLoading, router]);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) { console.error(error); } 
    finally { setTasksLoading(false); }
  };

  const handleConnectGoogle = async () => {
    const id = toast.loading("Requesting Google Authorization...");
    try {
      const response = await axiosInstance.get("/tasks/google/connect");
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Bridge Connection Failed", { id });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try { 
        await taskService.toggleTaskStatus(id, newStatus); 
        toast.info(`Status Updated: ${newStatus.toUpperCase()}`);
    } catch { loadTasks(); }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (task.category?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesTab = activeFilter === 'all' || (activeFilter === 'urgent' && task.priority === 'urgent') || (activeFilter === 'pending' && task.status === 'pending') || (activeFilter === 'completed' && task.status === 'completed');
    return matchesSearch && matchesTab;
  });

  // --- SMART SORTING LOGIC ---
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const now = new Date().getTime();

    // 1. Always put Completed at the bottom
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;

    // 2. Sorting for Pending Tasks
    if (a.status === 'pending') {
      const timeA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const timeB = b.due_date ? new Date(b.due_date).getTime() : Infinity;

      const isOverdueA = timeA < now;
      const isOverdueB = timeB < now;

      // Rule: Upcoming (not overdue) comes BEFORE Overdue
      if (isOverdueA !== isOverdueB) {
        return isOverdueA ? 1 : -1; 
      }

      // If both are upcoming (or both are overdue), soonest deadline first
      if (timeA !== timeB) return timeA - timeB;
    }

    // 3. Fallback: Sort by Priority
    const weights: any = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (weights[a.priority] ?? 2) - (weights[b.priority] ?? 2);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} • ${hours}:${minutes}`;
  };

  if (authLoading || (user && tasksLoading)) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-zinc-200 animate-pulse uppercase tracking-[0.4em]">Node Syncing...</div>;

  // Check for critical tasks (due in less than 24 hours)
  const criticalTask = tasks.find(t => {
      if (!t.due_date || t.status === 'completed') return false;
      const diff = new Date(t.due_date).getTime() - new Date().getTime();
      return diff > 0 && diff < 86400000; // 24 hours
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative font-sans selection:bg-indigo-100 pb-20">
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6">
        
        {/* HEADER */}
        <header className="mb-10 bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-500/5 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-5xl font-black tracking-tighter italic text-[#3e4362]">Mission Control</h1>
              <p className="text-[#717694] text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-60 italic underline decoration-indigo-200 underline-offset-4">{user?.email}</p>
            </div>

            <div className="mt-6 md:mt-0">
              {(user as any)?.google_access_token ? (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                  <span className="text-lg animate-pulse">📅</span> Calendar Synced
                </div>
              ) : (
                <button 
                  onClick={handleConnectGoogle}
                  className="flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-400 text-[#3e4362] px-6 py-3 rounded-2xl shadow-sm transition-all active:scale-95 group"
                >
                  <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sync Google Calendar</span>
                </button>
              )}
            </div>
        </header>

        {/* CRITICAL WINDOW ALERT */}
        {criticalTask && (
            <div className="mb-10 bg-indigo-600 p-1 rounded-[2.5rem] shadow-2xl shadow-indigo-200 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.3rem] flex justify-between items-center border border-white/20">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100 italic mb-1">Critical Window Detected</p>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Next objective due within 24 hours</h2>
                    </div>
                    <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center animate-bounce shadow-inner">
                        <span className="text-2xl">⚠️</span>
                    </div>
                </div>
            </div>
        )}

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10 text-left">
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Total</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{tasks.length}</h2></div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm border-b-rose-500 border-b-4"><p className="text-[10px] font-black uppercase tracking-widest text-rose-400 italic">Urgent</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{tasks.filter(t=>t.status==='pending'&&t.priority==='urgent').length}</h2></div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm border-b-emerald-500 border-b-4"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Efficiency</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='completed').length / tasks.length)*100) : 0}%</h2></div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm text-left"><p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">Clients</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{new Set(tasks.map(t=>t.category?.toLowerCase())).size}</h2></div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <input type="text" placeholder="Filter objective stream..." className="w-full md:w-96 bg-white border border-slate-200 px-6 py-4 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          
          <div className="flex items-center gap-4">
              <div className="flex bg-slate-200/50 p-2 rounded-2xl gap-1">
                {['all', 'urgent', 'pending', 'completed'].map((tab) => (
                <button key={tab} onClick={() => setActiveFilter(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
                ))}
              </div>
              <Link href="/tasks/create" className="bg-indigo-600 text-white px-7 py-3 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 active:scale-95 transition-all text-xs tracking-widest uppercase">
                + Task
              </Link>
          </div>
        </div>

        {/* TASK CARDS */}
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const subtasks = task.sub_tasks || [];
            const completedSubs = subtasks.filter((s) => s.is_completed).length;
            const progress = subtasks.length > 0 ? Math.round((completedSubs / subtasks.length) * 100) : 0;
            
            // Check if this specific task is overdue
            const isOverdue = task.due_date && new Date(task.due_date).getTime() < new Date().getTime() && task.status === 'pending';

            return (
              <div key={task.id} className="group relative">
                <Link href={`/tasks/${task.id.toString()}`} className="block">
                  <div className={`bg-white border p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl ${isOverdue ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'} ${task.status === 'completed' ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-start gap-6 text-left">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus(task.id, task.status); }} className={`mt-2 h-10 w-10 rounded-2xl flex items-center justify-center border-2 transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-200 text-transparent hover:border-indigo-600'}`}>
                        {task.status === 'completed' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-1">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isOverdue ? 'bg-rose-600 text-white border-rose-600' : task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' : task.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400'}`}> 
                            {isOverdue ? 'EXPIRED' : task.priority} 
                           </span>
                           <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight italic">@{task.category}</span>
                         </div>
                         <h3 className={`text-2xl font-bold tracking-tight text-[#3e4362]`}>{task.title}</h3>
                         <div className="mt-4 flex items-center justify-between gap-6 max-w-sm">
                            {subtasks.length > 0 && (
                                <div className="flex-1">
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
                                </div>
                            )}
                            {task.attachments?.length > 0 && (
                                <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                                    <span className="text-[10px] font-black text-indigo-600">📎 {task.attachments.length} ASSETS</span>
                                </div>
                            )}
                         </div>
                         {task.due_date && (
                            <p className={`text-[10px] font-black mt-3 uppercase tracking-widest ${isOverdue ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>
                                {isOverdue ? "🚨 OVERDUE: " : "Target: "} {formatDate(task.due_date)}
                            </p>
                         )}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="absolute right-8 top-8 flex items-center gap-2">
                  <Link href={`/tasks/edit/${task.id}`} className="p-3 text-slate-300 hover:text-indigo-600 transition-all z-20"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></Link>
                  <button onClick={(e) => { e.preventDefault(); setTaskToDelete(task.id); setIsModalOpen(true); }} className="p-3 text-slate-300 hover:text-rose-600 transition-all z-20"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => { if(taskToDelete){ taskService.deleteTask(taskToDelete); setTasks(tasks.filter(t=>t.id !== taskToDelete)); setIsModalOpen(false); toast.error("Node Terminated"); }}} title="Confirm Action" message="Permanently delete objective?" />
    </div>
  );
}
export default function TaskListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <TaskListContent />
    </Suspense>
  );
}