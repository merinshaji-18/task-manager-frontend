"use client";

import { useEffect, useState, useRef } from 'react';
import { taskService } from '@/services/taskService';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function EditTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
          setDescription(currentTask.description || '');
          setStatus(currentTask.status);
          setPriority(currentTask.priority || 'medium');
          setCategory(currentTask.category || '');
          if (currentTask.due_date) {
            setDueDate(new Date(currentTask.due_date).toISOString().split('T')[0]);
          }
        }
      } catch {
        toast.error("Data Fetch Error");
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
      await taskService.updateTask(id, { title, description, status, priority, category, due_date: dueDate || null });
      toast.success("Workspace Updated");
      router.push('/tasks');
    } catch {
      toast.error("Update Failed");
    } finally {
      setUpdating(false);
    }
  };

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      // 1. Upload to Cloudinary
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const cloudData = await cloudRes.json();

      // 2. Save Link to Backend Vault
      await axiosInstance.post(`/tasks/${id}/attachments`, {
        file_url: cloudData.secure_url,
        file_name: file.name,
        file_type: file.type
      });

      toast.success("Asset Secured", { description: "File is now available in your Vault." });
    } catch (error) {
      toast.error("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-200 animate-pulse uppercase tracking-[0.4em]">Initialising...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center px-6 py-20 selection:bg-indigo-100 font-sans">
      
      {/* 1. MAIN EDIT FORM */}
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 mb-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter italic">Edit Objective</h1>
          <p className="text-zinc-500 mt-2 font-medium">Refine parameters for Node: {id}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Priority</label>
              <select className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Status</label>
              <select className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Client Tag</label>
            <input type="text" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Title</label>
            <input type="text" required className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Notes</label>
            <textarea rows={3} className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Deadline</label>
            <input type="date" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <button disabled={updating} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200 uppercase text-xs tracking-widest">
            {updating ? "Syncing..." : "Update Workspace"}
          </button>
        </form>
      </div>

      {/* 2. NEW ASSET UPLOAD SECTION (THIS IS THE MISSING BUTTON) */}
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between">
        <div>
           <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Task Assets</h2>
           <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Deliverables for this objective</p>
        </div>
        
        <button 
           type="button"
           onClick={() => fileInputRef.current?.click()}
           disabled={uploading}
           className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-all active:scale-95 disabled:bg-zinc-200 flex items-center gap-2 shadow-lg"
        >
           {uploading ? (
              <span className="animate-pulse">Securing...</span>
           ) : (
              <><span>+</span> Add Asset</>
           )}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
      </div>

      <Link href="/tasks" className="mt-8 text-xs font-bold text-zinc-300 hover:text-zinc-900 uppercase tracking-[0.3em] transition-all italic underline decoration-2 underline-offset-8">
          Return to Control Center
      </Link>
    </div>
  );
}