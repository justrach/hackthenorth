import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://justrach-web--8000.prod1.defang.dev/user_stats');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}