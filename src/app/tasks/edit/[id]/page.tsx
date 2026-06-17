"use client";

import { useEffect, useState } from 'react';
import { taskService } from '@/services/taskService';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  
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
          setDescription(currentTask.description || ''); // Restore Notes
          setStatus(currentTask.status);
          setPriority(currentTask.priority || 'medium');
          setCategory(currentTask.category || '');
          if (currentTask.due_date) {
            setDueDate(new Date(currentTask.due_date).toISOString().split('T')[0]);
          }
        }
      } catch {
        toast.error("Data Fetch Error", { description: "Could not load objective details." });
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
      await taskService.updateTask(id, { 
        title, 
        description, 
        status, 
        priority, 
        category, 
        due_date: dueDate || null 
      });
      toast.success("Workspace Updated", { description: "Changes saved to the cloud." });
      router.push('/tasks');
    } catch {
      toast.error("Update Failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] gap-4">
      <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Fetching Objective...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-6 py-12 selection:bg-indigo-100">
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter italic">Edit Objective</h1>
          <p className="text-zinc-500 mt-2 font-medium">Refine the parameters for task ID: {id}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Priority</label>
              <select 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 cursor-pointer"
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
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Status</label>
              <select 
                className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800 cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Row 2: Client Tag */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Client / Category</label>
            <input 
              type="text" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800"
              value={category}
              onChange={(e) => setCategory(e.target.value)} 
            />
          </div>

          {/* Row 3: Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Title</label>
            <input 
              type="text" required
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          {/* Row 4: RESTORED NOTES (Description) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Notes</label>
            <textarea 
              rows={3}
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          {/* Row 5: Deadline */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Deadline</label>
            <input 
              type="date" 
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            <button 
              disabled={updating}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200"
            >
              {updating ? "Syncing..." : "Save Changes"}
            </button>
            
            {/* RESTORED CANCEL OPTION */}
            <Link 
              href="/tasks" 
              className="w-full text-center py-2 text-sm text-zinc-400 font-bold hover:text-zinc-900 uppercase tracking-widest transition-colors italic"
            >
              Cancel and Return
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}