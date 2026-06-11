"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // NEW: Use Auth Context
import { taskService } from '@/services/taskService';
import { Task } from '@/types/task';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function TaskListPage() {
  const { user, loading: authLoading, logout } = useAuth(); // Get user from global state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadTasks();
    }
  }, [user, authLoading, router]);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await taskService.toggleTaskStatus(id, newStatus);
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus } : t));
      alert("Failed to update status.");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;
    return 0;
  });

  const openDeleteModal = (id: number) => {
    setTaskToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete !== null) {
      try {
        await taskService.deleteTask(taskToDelete);
        setTasks(tasks.filter(t => t.id !== taskToDelete));
      } finally {
        setIsModalOpen(false);
        setTaskToDelete(null);
      }
    }
  };

  // Loading state (Auth or Data)
  if (authLoading || (user && tasksLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fc]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#5c59c2] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`, backgroundSize: '45px 45px' }}>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-[#3e4362] tracking-tight">Project Workspace</h1>
            <p className="text-[#717694] text-lg mt-2 font-medium">
              Hello, <span className="text-[#5c59c2]">{user?.email}</span>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={logout} className="text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors mr-2">Logout</button>
            <Link href="/tasks/create" className="flex items-center bg-[#5c59c2] text-white px-7 py-3 rounded-xl font-bold shadow-xl hover:bg-[#4d4aad] active:scale-95 transition-all">
              <span className="mr-2 text-2xl">+</span> Add New Task
            </Link>
          </div>
        </header>

        <div className="space-y-5">
          {sortedTasks.map((task) => (
            <div key={task.id} className={`group bg-white border border-slate-200 p-8 rounded-2xl flex items-center justify-between transition-all duration-500 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-6">
                <div className="mt-1">
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-[#5c59c2]'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-md ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{task.status}</span>
                    <h3 className={`text-3xl font-bold tracking-tight transition-all ${task.status === 'completed' ? 'text-slate-400 line-through decoration-emerald-500/50' : 'text-[#3e4362]'}`}>{task.title}</h3>
                  </div>
                  <p className={`text-[17px] font-medium leading-relaxed ${task.status === 'completed' ? 'text-slate-300' : 'text-[#717694]'}`}>
                    <span className="font-bold">Description:</span> {task.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/tasks/edit/${task.id}`} className="p-3 text-slate-400 hover:text-indigo-600 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></Link>
                <button onClick={() => openDeleteModal(task.id)} className="p-3 text-slate-400 hover:text-rose-600 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Dynamic Avatar */}
      <div className="fixed bottom-10 left-10 z-40 group">
        <div className="h-14 w-14 bg-[#333752] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-2xl transition-all group-hover:scale-110">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="absolute left-16 top-3 bg-white border border-slate-200 px-4 py-1.5 rounded-lg shadow-xl text-xs font-bold text-[#3e4362] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {user?.email}
        </div>
      </div>

      <ConfirmModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} title="Confirm Action" message="Are you sure you want to delete this task?" />
    </div>
  );
}