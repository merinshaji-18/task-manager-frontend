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
  
  const [subDrafts, setSubDrafts] = useState<string[]>([]);
  const [currentSub, setCurrentSub] = useState('');
  
  const [fileDrafts, setFileDrafts] = useState<{url: string, name: string, type: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const getMinDateTime = () => {
    const now = new Date();
    // Adjust to local timezone string format
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setFileDrafts([...fileDrafts, { url: data.secure_url, name: file.name, type: file.type }]);
      toast.success("Asset Ready");
    } finally { setUploading(false); }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setLoading(true);
    const toastId = toast.loading("Verifying Time Slot Availability...");
    
    try {
      // 1. Create the Main Task
      // Ensure taskService.createTask returns the actual data object containing the ID
      const task = await taskService.createTask({ 
        title, 
        description, 
        priority, 
        category: category || 'General', 
        due_date: dueDate || null 
      });

      if (!task || !task.id) {
        throw new Error("Task ID not returned from server");
      }

      // 2. Link Subtasks (Use task.id)
      if (subDrafts.length > 0) {
        await Promise.all(
          subDrafts.map(s => 
            axiosInstance.post(`/tasks/${task.id}/subtasks`, { title: s })
          )
        );
      }
      
      // 3. Link Attachments (Use task.id)
      if (fileDrafts.length > 0) {
        await Promise.all(
          fileDrafts.map(f => 
            axiosInstance.post(`/tasks/${task.id}/attachments`, { 
              file_url: f.url, 
              file_name: f.name, 
              file_type: f.type 
            })
          )
        );
      }

      toast.success("Node Operational", { id: toastId });
      router.push('/tasks');
    } catch (err: any) {
      // --- NEW: HANDLE COLLISION ERROR ---
      const errorMessage = err.response?.data?.detail || "Initialization Failed";
      
      toast.error("Operation Blocked", { 
          id: toastId,
          description: errorMessage, // This will say "Collision detected with [Task Name]"
          style: { background: '#fff', border: '2px solid #e11d48', color: '#e11d48' }
      });
    } finally { setLoading(false); }
};

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center py-20 px-6 font-sans">
      <div className="w-full max-w-xl bg-white border border-zinc-200 p-12 rounded-[2.5rem] shadow-xl mb-6">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tighter italic text-center mb-10">Initiate Node</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <select className="bg-zinc-50 border-none p-4 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-indigo-500" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
             </select>
             <input type="text" placeholder="Client Tag" className="bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" onChange={(e) => setCategory(e.target.value)} />
          </div>
          <input type="text" required placeholder="Objective Title" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" onChange={(e) => setTitle(e.target.value)} />
          <textarea rows={2} placeholder="Node Parameters" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" onChange={(e) => setDescription(e.target.value)} />
          <input 
                type="datetime-local" 
                min={getMinDateTime()} 
                className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-800" 
                onChange={(e) => setDueDate(e.target.value)} 
            />
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 uppercase text-xs tracking-widest">{loading ? "Synchronizing..." : "Initialize Workspace"}</button>
        </form>
      </div>

      <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subtask Pool */}
        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm">
           <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 italic">Checkpoints</h3>
           <div className="flex gap-2 mb-4">
             <input type="text" className="flex-1 bg-zinc-50 px-3 py-2 rounded-xl text-xs" placeholder="Add step..." value={currentSub} onChange={(e)=>setCurrentSub(e.target.value)} />
             <button onClick={(e)=>{e.preventDefault(); if(currentSub){setSubDrafts([...subDrafts, currentSub]); setCurrentSub('')}}} className="bg-zinc-900 text-white px-3 rounded-xl font-bold">+</button>
           </div>
           <div className="flex flex-wrap gap-2">{subDrafts.map((s,i)=>(<span key={i} className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 italic">✓ {s}</span>))}</div>
        </div>

        {/* File Pool */}
        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm">
           <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 italic">Assets</h3>
           <button onClick={(e)=>{e.preventDefault(); fileInputRef.current?.click()}} disabled={uploading} className="w-full bg-zinc-50 border border-zinc-200 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all">{uploading ? "Clouding..." : "+ Select File"}</button>
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
           <div className="mt-4 flex flex-col gap-2">{fileDrafts.map((f,i)=>(<span key={i} className="text-[9px] font-bold text-zinc-400 truncate">📎 {f.name}</span>))}</div>
        </div>
      </div>

      <Link href="/tasks" className="mt-8 text-xs font-bold text-zinc-300 hover:text-zinc-900 uppercase tracking-[0.4em] transition-all italic underline decoration-2 underline-offset-8">Cancel Node Activation</Link>
    </div>
  );
}