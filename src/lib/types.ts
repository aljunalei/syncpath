// Notion API response types
export interface NotionTask {
  id: string;
  properties: {
    Task: {
      title: Array<{
        plain_text: string;
      }>;
    };
    Status: {
      select: {
        name: string;
        color: string;
      } | null;
    };
    Priority: {
      select: {
        name: string;
        color: string;
      } | null;
    };
    Assignee: {
      people: Array<{
        name: string;
      }>;
    };
    Deadline: {
      date: {
        start: string;
      } | null;
    };
    Tags: {
      multi_select: Array<{
        name: string;
        color: string;
      }>;
    };
    'AI Suggested': {
      checkbox: boolean;
    };
  };
}

// Clean task interface for our app
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
