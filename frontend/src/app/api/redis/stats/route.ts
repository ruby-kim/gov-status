import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const statsData = await redis.get('stats:latest');

    if (!statsData) {
      return NextResponse.json({ error: 'No stats data found' }, { status: 404 });
    }

    const stats = JSON.parse(statsData);
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching stats data:', error);
    return NextResponse.json({ error: 'Failed to fetch stats data' }, { status: 500 });
  }
}
