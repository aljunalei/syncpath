import { Client } from "@notionhq/client";
import { Task } from './types';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const databaseId = process.env.NOTION_DATABASE_ID!;

export async function getTasks() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
    });
    
    console.log("Successfully fetched tasks from Notion");
    console.log("Tasks found:", response.results.length);
    
    return response.results;
  } catch (error) {
    console.error("Error fetching tasks from Notion:", error);
    throw error;
  }
}

export function parseNotionTask(notionTask: any): Task {
  const props = notionTask.properties;
  
  return {
    id: notionTask.id,
    title: props.Task?.title?.[0]?.plain_text || 'Untitled',
    status: props.Status?.select?.name || 'To Do',
    priority: props.Priority?.select?.name || 'Medium',
    assignee: props.Assignee?.people?.[0]?.name || 'Unassigned',
    deadline: props.Deadline?.date?.start || null,
    tags: props.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    aiSuggested: props['AI Suggested']?.checkbox || false,
  };
}

export async function getTasksParsed(): Promise<Task[]> {
  const rawTasks = await getTasks();
  return rawTasks.map(task => parseNotionTask(task));
}
