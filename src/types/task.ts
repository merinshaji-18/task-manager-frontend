export interface Attachment {
  id: number;
  task_id: number;
  file_url: string;
  file_name: string;
  file_type: string;
}

export interface SubTask {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  due_date: string | null;
  created_at: string;
  owner_id: number;
  // ENSURE THESE ARE HERE
  sub_tasks: SubTask[];
  attachments: Attachment[]; 
}