"use client";

import { useEffect, useState } from 'react';
import { taskService } from '@/services/taskService';
import { useRouter, useParams } from 'next/navigation';

export default function EditTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const tasks = await taskService.getTasks();
        const currentTask = tasks.find(t => t.id === id);
        if (currentTask) {
          setTitle(currentTask.title);
          setDescription(currentTask.description);
          setStatus(currentTask.status);
        }
      } catch (error) {
        console.error("Failed to load task", error);
        alert("Failed to load task data");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await taskService.updateTask(id, { title, description, status });
      router.push('/tasks');
    } catch (error) {
      alert("Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#fcfcfc]">
      <div className="h-8 w-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-white border border-zinc-200 p-10 rounded-[32px] shadow-xl shadow-zinc-200/50">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Update Objective</h1>
          <p className="text-zinc-500 mt-2">Refine the details of this task.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Title
            </label>
            <input
              type="text"
              required
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-800 font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Notes
            </label>
            <textarea
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-800 font-medium"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Status
            </label>
            <select 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-800 font-medium appearance-none cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-200 shadow-lg"
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
            <button 
              type="button"
              onClick={() => router.push('/tasks')}
              className="text-zinc-400 text-sm font-medium hover:text-zinc-900 transition-colors py-2"
            >
              Discard changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}