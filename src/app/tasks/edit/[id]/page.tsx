"use client";

import { useEffect, useState, useRef } from 'react';
import { taskService } from '@/services/taskService';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { Task, Attachment, SubTask } from '@/types/task';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function EditTaskPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  // Interaction States
  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editingSubText, setEditingSubText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const taskId = typeof id === 'string' ? parseInt(id) : 0;
  const router = useRouter();

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}`);
      const t: Task = res.data;
      setTitle(t.title);
      setDescription(t.description || '');
      setStatus(t.status);
      setPriority(t.priority);
      setCategory(t.category);
      setSubtasks(t.sub_tasks || []);
      setAttachments(t.attachments || []);
      if (t.due_date) {
      // 1. Create a date object from the UTC string
      const dateObj = new Date(t.due_date);
      
      // 2. Adjust for timezone offset so the input shows the CORRECT local time
      const offset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);
      
      setDueDate(localISOTime);
    }    
  } catch { toast.error("Sync Error"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTask(); }, [taskId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const finalDate = dueDate ? new Date(dueDate).toISOString() : null;
      await taskService.updateTask(taskId, { title, description, status, priority, category, due_date: finalDate });
      toast.success("Workspace Synced");
      router.push(`/tasks/${taskId}`);
    } catch (err: any) {
        toast.error(err.response?.data?.detail || "Update Failed");
    } finally { setUpdating(false); }
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
      await axiosInstance.post(`/tasks/${taskId}/attachments`, { file_url: data.secure_url, file_name: file.name, file_type: file.type });
      fetchTask();
      toast.success("Asset Secured");
    } finally { setUploading(false); }
  };

  const confirmDeleteAsset = async () => {
    if (assetToDelete) {
      await axiosInstance.delete(`/tasks/attachments/${assetToDelete}`);
      setAttachments(prev => prev.filter(f => f.id !== assetToDelete));
      setIsAssetModalOpen(false);
      toast.success("Asset Purged");
    }
  };

  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      await axiosInstance.post(`/tasks/${taskId}/subtasks`, { title: newSubtask });
      setNewSubtask('');
      fetchTask();
      toast.success("Checkpoint Logged");
    } catch { toast.error("Log Failed"); }
  };

  const toggleSubtask = async (subId: number) => {
    try {
      await axiosInstance.patch(`/tasks/subtasks/${subId}/toggle`);
      setSubtasks(prev => prev.map(s => s.id === subId ? {...s, is_completed: !s.is_completed} : s));
    } catch { toast.error("Toggle Failed"); }
  };

  const handleUpdateSubtask = async (subId: number) => {
    try {
      await axiosInstance.put(`/tasks/subtasks/${subId}`, { title: editingSubText });
      setEditingSubId(null);
      fetchTask();
      toast.success("Step Refined");
    } catch { toast.error("Failed to update"); }
  };

  const confirmDeleteSubtask = async () => {
    if (subToDelete) {
      await axiosInstance.delete(`/tasks/subtasks/${subToDelete}`);
      setSubtasks(prev => prev.filter(s => s.id !== subToDelete));
      setIsSubModalOpen(false);
      toast.success("Checkpoint Removed");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-200 animate-pulse uppercase tracking-[0.4em]">Node Decrypting...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-6 font-sans selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-end px-2">
          <div className="text-left">
            <h1 className="text-4xl font-black tracking-tighter italic text-[#3e4362]">Calibrate Node</h1>
            <p className="text-[#717694] text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">System Registry: {taskId}</p>
          </div>
          <Link href={`/tasks/${taskId}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-all italic underline underline-offset-8 decoration-2">Cancel Calibration</Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* FORM COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-zinc-200/20 text-left">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <select className="bg-zinc-50 border-none p-4 rounded-2xl outline-none font-bold text-zinc-800" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                  <select className="bg-zinc-50 border-none p-4 rounded-2xl outline-none font-bold text-zinc-800" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="pending">Pending</option><option value="completed">Completed</option>
                  </select>
                </div>
                <input type="text" placeholder="Client" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none border-none font-bold text-zinc-800" value={category} onChange={(e) => setCategory(e.target.value)} />
                <input type="text" required placeholder="Title" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none border-none font-bold text-zinc-800" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea rows={4} placeholder="Description" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none border-none font-bold text-zinc-800" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button disabled={updating} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">{updating ? "Syncing..." : "Update Node Settings"}</button>
              </form>
            </div>
          </div>

          {/* ASSETS & CHECKPOINTS COLUMN */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm text-left">
              <div className="flex justify-between items-center mb-6 text-left"><h2 className="text-sm font-black uppercase tracking-widest text-[#3e4362] italic">Assets</h2><button onClick={() => fileInputRef.current?.click()} className="bg-zinc-900 text-white px-4 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-all">Upload</button></div>
              <div className="space-y-2">
                  {attachments.map(f => (
                      <div key={f.id} className="bg-zinc-50 p-3 rounded-2xl flex justify-between items-center group transition-all">
                          <span className="truncate max-w-[140px] text-[10px] font-black text-zinc-500 uppercase">📎 {f.file_name}</span>
                          <button onClick={() => { setAssetToDelete(f.id); setIsAssetModalOpen(true); }} className="text-[9px] font-black uppercase text-rose-400 opacity-0 group-hover:opacity-100 transition-all">Remove</button>
                      </div>
                  ))}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>

            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm text-left">
                <h2 className="text-sm font-black uppercase tracking-widest text-[#3e4362] mb-6 italic">Checkpoints</h2>
                <div className="space-y-3 mb-6">
                    {subtasks.map((st) => (
                        <div key={st.id} className="group flex items-center justify-between gap-3">
                            {editingSubId === st.id ? (
                                <div className="flex gap-2 w-full animate-in fade-in">
                                    <input className="flex-1 bg-zinc-50 rounded-lg p-2 text-xs font-bold outline-none ring-1 ring-indigo-500" value={editingSubText} onChange={(e) => setEditingSubText(e.target.value)} autoFocus />
                                    <button onClick={() => handleUpdateSubtask(st.id)} className="text-indigo-600 font-bold text-[10px]">SAVE</button>
                                </div>
                            ) : (
                                <>
                                    <div onClick={() => toggleSubtask(st.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all ${st.is_completed ? 'bg-zinc-900 border-zinc-900 shadow-lg' : 'border-slate-100'}`}>
                                            {st.is_completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="6"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-tight ${st.is_completed ? 'text-zinc-300 line-through italic' : 'text-[#3e4362]'}`}>{st.title}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingSubId(st.id); setEditingSubText(st.title); }} className="text-zinc-400 hover:text-indigo-600 text-[10px] font-bold">EDIT</button>
                                        <button onClick={() => { setSubToDelete(st.id); setIsSubModalOpen(true); }} className="text-zinc-400 hover:text-rose-500 text-[10px] font-bold">DEL</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <form onSubmit={addSubtask} className="flex gap-2">
                    <input type="text" placeholder="Add step..." className="flex-1 bg-zinc-50 px-4 py-2.5 rounded-xl outline-none text-[11px] font-bold" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
                    {newSubtask.trim() && <button className="bg-zinc-900 text-white px-4 rounded-xl">+</button>}
                </form>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-400 mb-2 italic">Adjust Deadline</p>
                <input type="datetime-local" className="bg-transparent border-none p-0 font-black text-rose-600 text-xl outline-none uppercase cursor-pointer w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onConfirm={confirmDeleteAsset} title="Remove Asset" message="Permanently remove file?" />
      <ConfirmModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} onConfirm={confirmDeleteSubtask} title="Delete Step" message="Permanently delete this checkpoint?" />
    </div>
  );
}