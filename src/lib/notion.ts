import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const databaseId = process.env.NOTION_DATABASE_ID!;

export async function getTask () {
    try
    {
    const response = await notion.dataSources.query({
        data_source_id: databaseId,
    });
    
    console.log("Success! Retrieved tasks from Notion database.");
    console.log("Task found:", response);

    } catch (error) {
        console.error("Error retrieving tasks from Notion database:", error);
        throw error;
    }
}