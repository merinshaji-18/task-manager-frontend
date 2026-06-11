import { redirect } from 'next/navigation';

export default function RootPage() {
  // This automatically redirects the user from "/" to "/login"
  redirect('/login');
  
  // This part is never actually seen by the user
  return null;
}