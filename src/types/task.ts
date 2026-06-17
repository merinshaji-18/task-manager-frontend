export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;  // Add this
  category: string;  // Add this
  due_date: string | null;  // Add this (ISO date string)
  created_at: string;
}