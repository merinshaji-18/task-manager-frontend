"use client";

interface NotificationPopupProps {
  tasks: any[];
  onClose: () => void;
}

export default function NotificationPopup({
  tasks,
  onClose,
}: NotificationPopupProps) {
  if (!tasks.length) return null;

  return (
    <div className="fixed top-24 right-6 z-[9999] w-[420px] bg-white border border-amber-200 rounded-3xl shadow-2xl overflow-hidden">

      <div className="bg-amber-500 text-white p-4">
        <h2 className="font-black uppercase tracking-wider text-sm">
          ⚠ Upcoming Deadlines
        </h2>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border-b border-slate-100"
          >
            <p className="font-black text-[#3e4362]">
              {task.title}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Due within 24 hours
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 font-black uppercase text-xs"
      >
        Dismiss
      </button>
    </div>
  );
}