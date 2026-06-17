"use client";

import { useState } from 'react';
import { taskService } from '@/services/taskService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskService.createTask({ 
        title, 
        description, 
        priority, 
        category: category || 'General', 
        due_date: dueDate || null 
      });
      toast.success("Objective Created", { description: "Added to your workspace flow." });
      router.push('/tasks');
    } catch {
      toast.error("Process Failed", { description: "Check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter italic">New Objective</h1>
          <p className="text-zinc-500 mt-2 font-medium">Define the parameters for your next task.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Priority</label>
              <select 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all cursor-pointer"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Client / Category</label>
              <input 
                type="text" 
                placeholder="e.g. Design, Client A"
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)} 
              />
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Title</label>
            <input 
              type="text" required placeholder="What are you working on?" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          {/* Row 3: Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Notes</label>
            <textarea 
              rows={3}
              placeholder="Add details..." 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          {/* Row 4: Due Date */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Deadline (Optional)</label>
            <input 
              type="date" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 transition-all"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200 mt-4"
          >
            {loading ? "Syncing Workspace..." : "Initialize Task"}
          </button>
        </form>

        <p className="mt-8 text-center">
          <Link href="/tasks" className="text-sm text-zinc-400 font-bold hover:text-zinc-900 uppercase tracking-widest transition-colors italic">
            Cancel and Return
          </Link>
        </p>
      </div>
    </div>
  );
}