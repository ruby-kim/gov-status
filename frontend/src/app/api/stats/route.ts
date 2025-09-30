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
      normalServices: data.filter((service: any) => service.status === 'normal').length,
      maintenanceServices: data.filter((service: any) => service.status === 'maintenance').length,
      problemServices: data.filter((service: any) => service.status === 'problem').length,
      totalAgencies: new Set(data.map((service: any) => service.agency.name)).size,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30'
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
