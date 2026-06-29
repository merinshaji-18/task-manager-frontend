"use client";
import { useEffect,useRef,Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from 'sonner';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code && !called.current) {
      called.current=true;
      const toastId = toast.loading("Securing Bridge to Google API...");
      axiosInstance.post("/tasks/google/exchange-token", { code })
        .then(() => {
          window.location.href="/tasks?status=success"; // Go back to tasks page
        })
        .catch((err) => {
          console.error("Token exchange failed", err);
          toast.error("Bridge Synchronization Failed", { id: toastId });
          router.push("/tasks");
        });
    }
  }, [searchParams,router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
       <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Securing Google Bridge...</p>
    </div>
  );
}
export default function GoogleCallback() {
  return (
    <Suspense><CallbackContent /></Suspense>
  );
}