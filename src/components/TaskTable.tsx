'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TaskTableProps {
  tasks: Task[];
  onUpdate: () => void;
}

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'Blocked'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

export default function TaskTable({ tasks, onUpdate }: TaskTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdate = async (
    taskId: string,
    field: 'status' | 'priority',
    value: string
  ) => {
    setUpdating(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error('Update failed');
      
      onUpdate(); // Refresh the task list
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setUpdating(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Tags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className={updating === task.id ? 'opacity-50' : ''}>
            <TableCell className="font-medium">{task.title}</TableCell>
            
            <TableCell>
              <Select
                value={task.status}
                onValueChange={(value) => handleUpdate(task.id, 'status', value)}
                disabled={updating === task.id}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>

            <TableCell>
              <Select
                value={task.priority}
                onValueChange={(value) => handleUpdate(task.id, 'priority', value)}
                disabled={updating === task.id}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>

            <TableCell>{task.assignee}</TableCell>
            <TableCell>{task.deadline || 'No deadline'}</TableCell>
            <TableCell>
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="mr-1">
                  {tag}
                </Badge>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
