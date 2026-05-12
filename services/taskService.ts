import api from './api';

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  siteId: string;
  siteName: string;
  assignedToId: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/api/tasks');
  return response.data;
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
  await api.patch(`/api/tasks/${id}/status`, { status });
};