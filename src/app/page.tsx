'use client';

import { useEffect, useState } from 'react';
import TaskTable from '@/components/TaskTable';
import { Task } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('deadline');

  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        cache: 'no-store', // Prevent caching for fresh data
      });
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
        setFilteredTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
  if (!autoRefresh) return;

  const interval = setInterval(() => {
    fetchTasks();
  }, 10000);

  return () => clearInterval(interval);
}, [autoRefresh]);

  useEffect(() => {
    let result = [...tasks];

    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        
        case 'priority':
          const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);
        
        case 'status':
          return a.status.localeCompare(b.status);
        
        case 'assignee':
          return a.assignee.localeCompare(b.assignee);
        
        default:
          return 0;
      }
    });

    setFilteredTasks(result);
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Calculate stats
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'Done').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    blocked: tasks.filter(t => t.status === 'Blocked').length,
    overdue: tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Done').length,
    highPriority: tasks.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Done').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('deadline');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 md:p-8">
{/* Header */}
<div className="mb-8 flex items-center justify-between">
  <div className="flex items-center gap-4">
    <img 
      src="/logo.png"
      alt="SyncPath Logo" 
      className="w-12 h-12 rounded-xl shadow-lg"
    />
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        SyncPath
      </h1>
      <p className="text-gray-600 text-sm">Project Management Dashboard</p>
    </div>
  </div>

  {/* Simple Refresh Button */}
  <Button 
    onClick={fetchTasks} 
    variant="outline" 
    size="sm"
    className="flex items-center gap-2"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    Refresh
  </Button>
</div>


        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.done}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.blocked}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.overdue}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.highPriority}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />

              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Priority:</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="assignee">Assignee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>

                <div className="ml-auto text-sm text-gray-600 font-medium">
                  Showing {filteredTasks.length} of {stats.total} tasks
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Table */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <TaskTable tasks={filteredTasks} onUpdate={fetchTasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
