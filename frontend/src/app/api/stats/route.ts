import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { OverallStats } from '@/types/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // MongoDB 연결 테스트
    let mongoConnected = false;
    try {
      await db.admin().ping();
      mongoConnected = true;
    } catch {
      console.log('MongoDB connection failed, using sample data');
    }

    if (!mongoConnected) {
      // MongoDB 연결 실패 시 샘플 데이터 사용
      const { allServices } = await import('@/data/sampleData');
      const stats = {
        totalServices: allServices.length,
        normalServices: allServices.filter(s => s.status === 'normal').length,
        maintenanceServices: allServices.filter(s => s.status === 'maintenance').length,
        problemServices: allServices.filter(s => s.status === 'problem').length,
        totalAgencies: new Set(allServices.map(s => s.agency.name)).size,
        lastUpdated: new Date().toISOString()
      };
      return NextResponse.json(stats);
    }

    // MongoDB에서 최신 전체 통계 가져오기
    const latestStats = await db.collection<OverallStats>('overall_stats')
      .findOne({}, { sort: { timestamp: -1 } });

    if (!latestStats) {
      return NextResponse.json({ error: 'No stats data found' }, { status: 404 });
    }

    // 기관 수 계산
    const agencyCount = await db.collection('agencies').countDocuments();

    // 통계 계산
    const stats = {
      totalServices: latestStats.overall.total,
      normalServices: latestStats.overall.normal,
      maintenanceServices: latestStats.overall.maintenance,
      problemServices: latestStats.overall.problem,
      totalAgencies: agencyCount,
      lastUpdated: latestStats.timestamp
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
