"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-[#33373d] rounded-[2.5rem] p-8 shadow-2xl border border-white/5 overflow-hidden">
        <div className="flex flex-col items-center text-center">
          
          {/* Warning Icon */}
          <div className="mb-4 text-zinc-400 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-zinc-400 text-[15px] mb-8 leading-relaxed px-4">{message}</p>

          <div className="flex gap-4 w-full">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-full border border-[#96af8c] text-[#96af8c] font-semibold hover:bg-[#96af8c]/10 transition-colors"
            >
              Cancel
            </button>

            {/* OK Button */}
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-6 rounded-full bg-[#2d4d1a] text-white font-semibold hover:bg-[#3a5d24] transition-all shadow-[0_0_20px_rgba(45,77,26,0.4)]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}