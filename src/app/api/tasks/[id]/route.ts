import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

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

    // 🔥 WEBHOOK TRIGGER - Check this is here!
    if (status === 'Done' && process.env.N8N_WEBHOOK_URL) {
      try {
        const taskResponse = await notion.pages.retrieve({ page_id: pageId });
        const props = (taskResponse as any).properties;
        
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'task_completed',
            task: {
              id: pageId,
              title: props.Name?.title?.[0]?.plain_text || 'Untitled',
              priority: props.Priority?.select?.name || 'Medium',
              assignee: props.Assignee?.people?.[0]?.name || 'Unassigned',
              completedAt: new Date().toISOString(),
            },
          }),
        });
        
        console.log('✅ Webhook sent to n8n successfully');
      } catch (webhookError) {
        console.error('⚠️ Webhook failed (task still updated):', webhookError);
        // Don't fail the whole request if webhook fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
