import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Redis에서 서비스 데이터 가져오기
    const servicesData = await redis.get('services:latest');

    if (!servicesData) {
      return NextResponse.json({ error: 'No services data found' }, { status: 404 });
    }

    const data = JSON.parse(servicesData);

    // 통계 계산
    const stats = {
      totalServices: data.length,
      normalServices: data.filter((service: { status: string }) => service.status === 'normal').length,
      maintenanceServices: data.filter((service: { status: string }) => service.status === 'maintenance').length,
      problemServices: data.filter((service: { status: string }) => service.status === 'problem').length,
      totalAgencies: new Set(data.map((service: { agency: { name: string } }) => service.agency.name)).size,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
