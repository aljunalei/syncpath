// src/components/TaskTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/types';

interface TaskTableProps {
  tasks: Task[];
  onUpdate: () => void;
}

export default function TaskTable({ tasks, onUpdate }: TaskTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdate = async (taskId: string, field: 'status' | 'priority', value: string) => {
    setUpdating(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      'Done': 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
      'Blocked': 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
      'To Do': 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-100',
    };
    
    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles] || styles['To Do']} font-medium`}>
        {status}
      </Badge>
    );
  };

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles = {
      'Urgent': 'bg-red-500 text-white hover:bg-red-500',
      'High': 'bg-orange-500 text-white hover:bg-orange-500',
      'Medium': 'bg-yellow-400 text-gray-900 hover:bg-yellow-400',
      'Low': 'bg-green-500 text-white hover:bg-green-500',
    };
    
    return (
      <Badge className={`${styles[priority as keyof typeof styles] || styles['Medium']} font-semibold`}>
        {priority}
      </Badge>
    );
  };

  // Check if task is overdue
  const isOverdue = (deadline: string | null, status: string) => {
    if (!deadline || status === 'Done') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Task</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Assignee</TableHead>
            <TableHead className="font-semibold">Deadline</TableHead>
            <TableHead className="font-semibold">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const taskIsOverdue = isOverdue(task.deadline, task.status);
            const isDone = task.status === 'Done';
            
            return (
              <TableRow
                key={task.id}
                className={`
                  ${updating === task.id ? 'opacity-50' : ''}
                  ${taskIsOverdue ? 'bg-red-50 border-l-4 border-l-red-500' : ''}
                  ${isDone ? 'bg-green-50/30' : ''}
                  hover:bg-gray-50 transition-colors
                `}
              >
                <TableCell className="font-medium">
                  {task.title}
                  {taskIsOverdue && (
                    <span className="ml-2 text-xs text-red-600 font-semibold">⚠️ OVERDUE</span>
                  )}
                </TableCell>

                <TableCell>
                  {isDone ? (
                    // Show badge only for Done tasks (locked)
                    getStatusBadge(task.status)
                  ) : (
                    // Editable dropdown for non-Done tasks
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleUpdate(task.id, 'status', value)}
                      disabled={updating === task.id}
                    >
                      <SelectTrigger className="w-[140px] border-none shadow-none p-0">
                        <SelectValue>
                          {getStatusBadge(task.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>

                <TableCell>
                  {/* Priority is read-only - just display the badge */}
                  {getPriorityBadge(task.priority)}
                </TableCell>

                <TableCell className="text-gray-700">{task.assignee}</TableCell>
                
                <TableCell className={taskIsOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                  {task.deadline || 'No deadline'}
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
