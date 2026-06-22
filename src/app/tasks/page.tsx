"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/taskService';
import { Task } from '@/types/task';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function TaskListPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

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

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try { await taskService.toggleTaskStatus(id, newStatus); } catch { loadTasks(); }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (task.category?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesTab = activeFilter === 'all' || (activeFilter === 'urgent' && task.priority === 'urgent') || (activeFilter === 'pending' && task.status === 'pending') || (activeFilter === 'completed' && task.status === 'completed');
    return matchesSearch && matchesTab;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
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

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative font-sans selection:bg-indigo-100 pb-20">
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6"> {/* Fixed big gap */}
        
        {/* CLEAN HEADER - REDUNDANT BUTTONS REMOVED */}
        <header className="mb-10 bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-500/5">
            <h1 className="text-5xl font-black tracking-tighter italic text-[#3e4362]">Mission Control</h1>
            <p className="text-[#717694] text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-60 italic underline decoration-indigo-200 underline-offset-4">{user?.email}</p>
        </header>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10 text-left">
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Total</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{tasks.length}</h2></div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm border-b-rose-500 border-b-4"><p className="text-[10px] font-black uppercase tracking-widest text-rose-400 italic">Urgent</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{tasks.filter(t=>t.status==='pending'&&t.priority==='urgent').length}</h2></div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm border-b-emerald-500 border-b-4"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Efficiency</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{tasks.length > 0 ? Math.round((tasks.filter(t=>t.status==='completed').length / tasks.length)*100) : 0}%</h2></div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm text-left"><p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">Clients</p><h2 className="text-4xl font-black text-[#3e4362] mt-1">{new Set(tasks.map(t=>t.category?.toLowerCase())).size}</h2></div>
        </div>

        {/* SEARCH & ADD TASK ROW */}
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

        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const subtasks = task.sub_tasks || [];
            const completedSubs = subtasks.filter((s) => s.is_completed).length;
            const progress = subtasks.length > 0 ? Math.round((completedSubs / subtasks.length) * 100) : 0;

            return (
              <div key={task.id} className="group relative">
                <Link href={`/tasks/${task.id.toString()}`} className="block">
                  <div className={`bg-white border border-slate-200 p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:border-indigo-200 ${task.status === 'completed' ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex items-start gap-6 text-left">
                      {/* Checkmark logic fixed */}
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus(task.id, task.status); }} className={`mt-2 h-10 w-10 rounded-2xl flex items-center justify-center border-2 transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-200 text-transparent hover:border-indigo-600'}`}>
                        {task.status === 'completed' && <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-1">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' : task.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400'}`}> {task.priority} </span>
                           <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight italic">@{task.category}</span>
                         </div>
                         <h3 className={`text-2xl font-bold tracking-tight text-[#3e4362]`}>{task.title}</h3>
                         
                         {/* Progress & Asset Indicator */}
                         <div className="mt-4 flex items-center justify-between gap-6 max-w-sm">
                            {subtasks.length > 0 && (
                                <div className="flex-1">
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
                                </div>
                            )}
                            {/* ASSET BADGE */}
                            {task.attachments?.length > 0 && (
                                <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                                    <span className="text-[10px] font-black text-indigo-600">📎 {task.attachments.length} ASSETS</span>
                                </div>
                            )}
                         </div>
                         {task.due_date && <p className="text-[10px] font-black text-rose-400 mt-3 uppercase tracking-widest">Deadline: {formatDate(task.due_date)}</p>}
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
      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={() => { if(taskToDelete){ taskService.deleteTask(taskToDelete); setTasks(tasks.filter(t=>t.id !== taskToDelete)); setIsModalOpen(false); }}} title="Confirm Action" message="Permanently delete objective?" />
    </div>
  );
}