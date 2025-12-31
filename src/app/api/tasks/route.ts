import { NextResponse } from 'next/server';
import { getTasksParsed } from '@/lib/notion';

export async function GET() {
  try {
    const tasks = await getTasksParsed();
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
       { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
