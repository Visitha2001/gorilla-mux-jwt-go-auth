export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  start_date: string;
  end_date: string;
  user_id?: string;
}

export interface SubTask {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  start_date: string;
  end_date: string;
  task_id?: string;
}