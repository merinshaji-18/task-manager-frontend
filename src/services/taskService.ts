import axiosInstance from '@/lib/axios';
import { Task } from '@/types/task';

export const taskService = {
  // 1. Fetch all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await axiosInstance.get('/tasks/');
    return response.data;
  },

  // 2. Create a new task
  createTask: async (taskData: { title: string; description: string }): Promise<Task> => {
    const response = await axiosInstance.post('/tasks/', taskData);
    return response.data;
  },

  // 3. Update an existing task (The one that was red)
  updateTask: async (id: number, taskData: { title: string; description: string, status: string }): Promise<Task> => {
    const response = await axiosInstance.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // 4. Delete a task
  deleteTask: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },

  async toggleTaskStatus(id: number, status: string): Promise<Task> {
  const response = await axiosInstance.patch(`/tasks/${id}`, { status });
  return response.data;
}
};