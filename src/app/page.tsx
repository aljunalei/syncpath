import { TaskTable } from '@/components/TaskTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SyncPath Dashboard
          </h1>
          <p className="text-gray-600">
            AI-powered task management with automated workflows
          </p>
        </header>
        
        <TaskTable />
      </div>
    </main>
  );
}
