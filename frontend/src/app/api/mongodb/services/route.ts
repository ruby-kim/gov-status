import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Agency, HourlyStats, AgencyStatus } from '@/types';

export async function GET() {
  try {
    const db = await getDatabase();

    // MongoDB 연결 테스트
    let mongoConnected = false;
    try {
      await db.admin().ping();
      mongoConnected = true;
    } catch {
      console.log('MongoDB connection failed, falling back to sample data');
    }

    // MongoDB가 연결되지 않았으면 샘플 데이터 사용
    if (!mongoConnected) {
      const { allServices } = await import('@/data/sampleData');
      return NextResponse.json({
        services: allServices,
        lastUpdated: new Date().toISOString()
      });
    }

    // 1. 최신 전체 통계에서 시간 정보 가져오기
    const latestOverallStats = await db.collection('overall_stats')
      .findOne({}, { sort: { timestamp: -1 } });

    if (!latestOverallStats) {
      console.log('No overall stats found, using sample data');
      const { allServices } = await import('@/data/sampleData');
      return NextResponse.json({
        services: allServices,
        lastUpdated: new Date().toISOString()
      });
    }

    // 2. 최신 시간대의 기관별 통계 가져오기
    const availableTimestamps = await db.collection<HourlyStats>('hourly_stats')
      .distinct('timestampHour');

    if (availableTimestamps.length === 0) {
      console.log('No hourly stats found, using sample data');
      const { allServices } = await import('@/data/sampleData');
      return NextResponse.json({
        services: allServices,
        lastUpdated: new Date().toISOString()
      });
    }

    // 가장 최신 timestampHour 사용
    const latestTimestampHour = availableTimestamps.sort().pop();

    const latestHourlyStats = await db.collection<HourlyStats>('hourly_stats')
      .find({ timestampHour: latestTimestampHour })
      .toArray();

    // 3. 모든 기관 정보 가져오기
    const agencies = await db.collection<Agency>('agencies').find({}).toArray();
    const agencyMap = new Map(agencies.map(agency => [agency.agencyId, agency]));

    if (latestHourlyStats.length === 0) {
      console.log('No hourly stats found, using sample data');
      const { allServices } = await import('@/data/sampleData');
      return NextResponse.json({
        services: allServices,
        lastUpdated: new Date().toISOString()
      });
    }

    // 4. overall_stats의 agencies에서 responseTime 정보 가져오기
    const agencyResponseTimes = new Map<string, number>();
    latestOverallStats.agencies.forEach((agencyStatus: AgencyStatus) => {
      if (agencyStatus.responseTime != null) {
        agencyResponseTimes.set(agencyStatus.agencyId, agencyStatus.responseTime);
      }
    });

    // 5. 서비스 데이터 구성 (기관별 통계를 기반으로)
    const services = latestHourlyStats.map(hourlyStat => {
      const agency = agencyMap.get(hourlyStat.agencyId);
      if (!agency) return null;

      // 상태 결정 로직
      let status = 'normal';
      if (hourlyStat.stats.problem > 0) {
        status = 'problem';
      } else if (hourlyStat.stats.maintenance > 0) {
        status = 'maintenance';
      }

      // responseTime 가져오기
      const responseTime = agencyResponseTimes.get(hourlyStat.agencyId) || null;

      return {
        id: `${hourlyStat.agencyId}-${hourlyStat._id}`, // MongoDB _id를 사용하여 고유한 ID 생성
        name: agency.name,
        url: agency.url,
        status: status,
        responseTime: responseTime,
        agency: {
          id: agency.agencyId,
          name: agency.name,
          url: agency.url,
          mainCategory: agency.mainCategory,
          subCategory: agency.subCategory
        },
        lastChecked: latestOverallStats.timestamp,
        tags: agency.tags
      };
    }).filter(Boolean);

    return NextResponse.json({
      services,
      lastUpdated: latestOverallStats.timestamp
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=0'
      }
    });
  } catch (error) {
    console.error('Error fetching services data:', error);
    return NextResponse.json({ error: 'Failed to fetch services data' }, { status: 500 });
  }
}