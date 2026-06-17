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
    if (!authLoading && !user) router.push('/login');
    else if (user) loadTasks();
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

  // --- ANALYTICS ---
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const urgentPending = tasks.filter(t => t.status === 'pending' && t.priority === 'urgent').length;
  const efficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const uniqueClients = new Set(tasks.map(t => t.category?.toLowerCase() || 'general')).size;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeFilter === 'all' || (activeFilter === 'urgent' && task.priority === 'urgent') || (activeFilter === 'pending' && task.status === 'pending') || (activeFilter === 'completed' && task.status === 'completed');
    return matchesSearch && matchesTab;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    const weights: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (weights[a.priority?.toLowerCase()] ?? 2) - (weights[b.priority?.toLowerCase()] ?? 2);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const confirmDelete = async () => {
    if (taskToDelete !== null) {
      try {
        await taskService.deleteTask(taskToDelete);
        setTasks(tasks.filter(t => t.id !== taskToDelete));
      } finally { setIsModalOpen(false); setTaskToDelete(null); }
    }
  };

  if (authLoading || (user && tasksLoading)) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
      <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-hidden font-sans selection:bg-indigo-100 px-6 py-12">
      {/* Background Blueprint Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* REFINED HEADER */}
        <header className="flex justify-between items-center mb-12 bg-white/60 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-500/5">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic text-[#3e4362]">Control Center</h1>
            <p className="text-[#717694] text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-60">Architect your workflow</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-black text-[#3e4362] tracking-tight">{user?.full_name || 'Active Node'}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{user?.email}</span>
             </div>

             {/* AVATAR PORTAL */}
             <Link href="/profile" className="group relative shrink-0">
                <div className="h-16 w-16 bg-white border-4 border-white shadow-2xl rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 transition-all group-hover:scale-105 group-hover:shadow-indigo-500/20 active:scale-95 overflow-hidden">
                   {user?.profile_pic ? (
                      <img src={user.profile_pic} alt="Profile" className="h-full w-full object-cover"/>
                   ) : (
                      <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}</span>
                   )}
                   <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
             </Link>

             <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
             <button onClick={logout} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors">Exit</button>
             <Link href="/tasks/create" className="bg-indigo-600 text-white px-7 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all text-xs tracking-widest uppercase">+ Task</Link>
          </div>
        </header>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objectives</p>
            <h2 className="text-3xl font-black text-[#3e4362] mt-1">{totalCount}</h2>
          </div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm border-b-rose-500 border-b-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Urgent</p>
            <h2 className="text-3xl font-black text-[#3e4362] mt-1">{urgentPending}</h2>
          </div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm border-b-emerald-500 border-b-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Efficiency</p>
            <h2 className="text-3xl font-black text-[#3e4362] mt-1">{efficiency}%</h2>
          </div>
          <div className="bg-white border border-slate-200 p-7 rounded-[2rem] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Client Nodes</p>
            <h2 className="text-3xl font-black text-[#3e4362] mt-1">{uniqueClients}</h2>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="relative w-full md:w-96 group">
            <input type="text" placeholder="Filter objective stream..." className="w-full bg-white border border-slate-200 pl-6 pr-4 py-4 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium transition-all group-hover:border-indigo-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex bg-slate-200/50 p-2 rounded-2xl gap-1">
            {['all', 'urgent', 'pending', 'completed'].map((tab) => (
              <button key={tab} onClick={() => setActiveFilter(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* TASK STREAM */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
             <div className="py-20 text-center bg-white/40 border-2 border-dashed border-slate-200 rounded-[2rem]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Signal Detected</p>
             </div>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className={`group bg-white border border-slate-200 p-8 rounded-[2.5rem] flex items-center justify-between transition-all duration-500 ${task.status === 'completed' ? 'opacity-40 grayscale' : 'hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-100'}`}>
                <div className="flex items-start gap-6">
                  <button onClick={() => handleToggleStatus(task.id, task.status)} className={`mt-2 h-10 w-10 rounded-2xl flex items-center justify-center border-2 transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent hover:border-indigo-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' : task.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}> {task.priority} </span>
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight italic">@{task.category}</span>
                     </div>
                     <h3 className={`text-2xl font-bold tracking-tight ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#3e4362]'}`}>{task.title}</h3>
                     <p className="text-[15px] font-medium text-[#717694] mt-1">{task.description}</p>
                     {task.due_date && <p className="text-[10px] font-black text-rose-500 mt-2 uppercase tracking-widest bg-rose-50 inline-block px-2 py-1 rounded-md">Deadline: {formatDate(task.due_date)}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/tasks/edit/${task.id}`} className="p-3 text-slate-300 hover:text-indigo-600 transition-all hover:bg-indigo-50 rounded-2xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></Link>
                  <button onClick={() => { setTaskToDelete(task.id); setIsModalOpen(true); }} className="p-3 text-slate-300 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-2xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} title="Confirm Action" message="Permanently delete this objective from the workspace?" />
    </div>
  );
}