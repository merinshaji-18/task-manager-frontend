"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setProfilePic(user.profile_pic || null);
    }
  }, [user, authLoading]);

  // --- NEW CLOUDINARY UPLOAD LOGIC ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      // 1. Upload directly to Cloudinary
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();

      // 2. Set the resulting URL to our state
      setProfilePic(data.secure_url); 
      toast.success("Image uploaded to cloud");
    } catch (error) {
      toast.error("Cloud upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 3. Send ONLY the URL string to your FastAPI backend
      await axiosInstance.put('/users/profile', { 
        full_name: fullName, 
        bio: bio,
        profile_pic: profilePic 
      });
      await refreshUser();
      toast.success("Profile Synchronized");
      setTimeout(() => router.push('/tasks'), 1500);
    } catch {
      toast.error("Sync Failed");
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-300">INITIALIZING...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 font-sans selection:bg-indigo-100">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 p-12 rounded-[3rem] shadow-xl shadow-zinc-200/40">
        
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="h-28 w-28 bg-indigo-600 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-2xl mb-4 border-4 border-white overflow-hidden transition-all group-hover:scale-105">
              {uploading ? (
                <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full"></div>
              ) : profilePic ? (
                <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 h-28 w-28 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black uppercase tracking-widest">
              Update
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tighter italic">Professional Identity</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
           {/* ... (Keep your email, name, and bio fields the same) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Email</label>
              <input type="text" disabled value={user?.email || ''} className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-medium text-zinc-300 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Full Name</label>
              <input type="text" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">Professional Bio</label>
            <textarea rows={3} className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-800" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button disabled={uploading} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.98]">
            {uploading ? "Uploading Image..." : "Update Workspace"}
          </button>
          <Link href="/tasks" className="block text-center text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest italic">Discard</Link>
        </form>
      </div>
    </div>
  );
}