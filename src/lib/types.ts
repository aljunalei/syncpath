// src/lib/types.ts
export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  deadline: string | null;
  tags: string[];
  aiSuggested: boolean;
}
