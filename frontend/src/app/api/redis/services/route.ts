import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    const servicesData = await redis.get('services:latest');

    if (!servicesData) {
      return NextResponse.json({ error: 'No services data found' }, { status: 404 });
    }

    const services = JSON.parse(servicesData);
    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching services data:', error);
    return NextResponse.json({ error: 'Failed to fetch services data' }, { status: 500 });
  }
}
