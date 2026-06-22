import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner"; // 1. Import Toaster
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar /> {/* 1. Add Navbar here */}
          <main className="pt-16"> {/* 2. Add padding top so content isn't hidden under Navbar */}
            {children}
          </main>
          {/* 2. Add Toaster here */}
          <Toaster 
            position="top-center" 
            expand={false} 
            richColors 
            theme="light"
            toastOptions={{
              style: { 
                borderRadius: '1.5rem', 
                padding: '1rem',
                border: '1px solid #e4e4e7',
                fontFamily: 'Inter, sans-serif'
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}