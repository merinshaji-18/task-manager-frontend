"use client";

import { useState, useRef } from 'react';
import { taskService } from '@/services/taskService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function CreateTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // States for Attachment Logic
  const [attachments, setAttachments] = useState<{url: string, name: string, type: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- Step 1: Upload to Cloudinary & store in local draft list ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const cloudData = await cloudRes.json();

      // Store in local state (We link these after the task is created)
      setAttachments(prev => [...prev, { 
        url: cloudData.secure_url, 
        name: file.name, 
        type: file.type 
      }]);

      toast.success("File Prepared", { description: `${file.name} ready for vaulting.` });
    } catch (error) {
      toast.error("Upload Error");
    } finally {
      setUploading(false);
    }
  };

  // --- Step 2: Create Task + Link all Assets ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the task
      const newTask = await taskService.createTask({ 
        title, 
        description, 
        priority, 
        category: category || 'General', 
        due_date: dueDate || null 
      });

      // 2. Link all uploaded assets to the new Task ID
      if (attachments.length > 0) {
        await Promise.all(attachments.map(file => 
          axiosInstance.post(`/tasks/${newTask.id}/attachments`, {
            file_url: file.url,
            file_name: file.name,
            file_type: file.type
          })
        ));
      }

      toast.success("Objective Initialized", { description: "Workspace data and assets synchronized." });
      router.push('/tasks');
    } catch {
      toast.error("Initialization Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center px-6 py-12 font-sans selection:bg-indigo-100">
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 mb-6">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter italic">New Objective</h1>
          <p className="text-zinc-500 mt-2 font-medium">Define parameters for your next node.</p>
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
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Client Tag</label>
              <input type="text" placeholder="e.g. Acme Corp" className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Title</label>
            <input type="text" required placeholder="Objective name" className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Notes</label>
            <textarea rows={3} placeholder="Provide context..." className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Deadline</label>
            <input type="date" className="w-full bg-zinc-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-zinc-200 uppercase text-xs tracking-widest">
            {loading ? "Syncing..." : "Initialize Task"}
          </button>
        </form>
      </div>

      {/* DRAFT ASSETS SECTION */}
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div>
               <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Attachment Pool</h2>
               <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Will be linked to this task</p>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-zinc-800 transition-all active:scale-95">
               {uploading ? "Uploading..." : "+ Add Asset"}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </div>

        {/* Show a list of files prepared for upload */}
        {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-50">
                {attachments.map((file, i) => (
                    <div key={i} className="bg-zinc-50 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-600 border border-zinc-100">
                        📎 {file.name}
                    </div>
                ))}
            </div>
        )}
      </div>

      <Link href="/tasks" className="mt-8 text-xs font-bold text-zinc-300 hover:text-zinc-900 uppercase tracking-[0.3em] transition-all italic underline decoration-2 underline-offset-8">
          Cancel and Return
      </Link>
    </div>
  );
}