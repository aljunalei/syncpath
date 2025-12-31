import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, priority } = await request.json();
    const pageId = params.id;

    const updates: any = { properties: {} };

    if (status) {
      updates.properties.Status = { status: { name: status } };
    }
    if (priority) {
      updates.properties.Priority = { select: { name: priority } };
    }

    await notion.pages.update({
      page_id: pageId,
      ...updates,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
