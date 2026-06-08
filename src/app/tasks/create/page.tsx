"use client";

import { useState } from 'react';
import { taskService } from '@/services/taskService';
import { useRouter } from 'next/navigation';

export default function CreateTaskPage() {
  // Logic State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskService.createTask({ title, description });
      router.push('/tasks'); // Redirect back to Workspace list
    } catch (error) {
      console.error(error);
      alert("Failed to create task. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-6 py-12 selection:bg-indigo-100">
      <div className="w-full max-w-lg bg-white border border-zinc-200 p-10 rounded-[32px] shadow-xl shadow-zinc-200/40">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">New Objective</h1>
          <p className="text-zinc-500 mt-2 font-medium">Define a new goal for your workspace.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Weekly synchronization"
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-300 text-zinc-800 font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              Description
            </label>
            <textarea
              placeholder="Provide context or specific steps..."
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-300 text-zinc-800 font-medium"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-100 disabled:text-zinc-400 shadow-lg shadow-zinc-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 border-2 border-zinc-400 border-t-white rounded-full" viewBox="0 0 24 24"></svg>
                  Syncing...
                </span>
              ) : (
                "Create Objective"
              )}
            </button>
            <button 
              type="button"
              onClick={() => router.push('/tasks')}
              className="text-zinc-400 text-sm font-bold hover:text-zinc-900 transition-colors py-2"
            >
              Cancel and return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}