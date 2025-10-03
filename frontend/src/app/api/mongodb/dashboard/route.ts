import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { OverallStats, Agency, HourlyStats } from '@/types';

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
        stats: { overall: { total: allServices.length, normal: 0, maintenance: 0, problem: 0 } },
        overview: {
          totalServices: allServices.length,
          normalServices: allServices.filter(s => s.status === 'normal').length,
          maintenanceServices: allServices.filter(s => s.status === 'maintenance').length,
          problemServices: allServices.filter(s => s.status === 'problem').length,
          overallNormalRate: 95.0,
          bestAgency: { name: '샘플 데이터', rate: 95.0 },
          warningAgencies: 0,
          avgResponseTime: 500,
          dailyAvgNormalRate: 95.0
        },
        agencyStats: []
      });
    }

    // 1. 최신 전체 통계 가져오기
    const latestOverallStats = await db.collection<OverallStats>('overall_stats')
      .findOne({}, { sort: { timestamp: -1 } });

    if (!latestOverallStats) {
      return NextResponse.json({ error: 'No overall stats found' }, { status: 404 });
    }

    // 2. agencies 정보 가져오기
    const agencies = await db.collection<Agency>('agencies').find({}).toArray();
    const agenciesMap = new Map(agencies.map(agency => [agency.agencyId, agency]));

    // 3. 통계 계산
    const stats = {
      overall: latestOverallStats.overall
    };

    // 4. 전체 정상율 계산
    const overallNormalRate = stats.overall.total > 0
      ? (stats.overall.normal / stats.overall.total) * 100
      : 0;

    // 5. 하루 동안의 hourly_stats 데이터를 가져와서 bestAgency 계산
    // 최신 데이터가 있는 날짜를 사용 (오늘 데이터가 없을 수 있음)
    const availableTimestamps = await db.collection<HourlyStats>('hourly_stats')
      .distinct('timestampHour');

    if (availableTimestamps.length === 0) {
      return NextResponse.json({ error: 'No hourly stats data found' }, { status: 404 });
    }

    // 가장 최신 날짜 사용
    const latestTimestamp = availableTimestamps.sort().pop();
    if (!latestTimestamp) {
      return NextResponse.json({ error: 'No valid timestamps found' }, { status: 404 });
    }
    const latestDate = new Date(latestTimestamp);
    const startOfDay = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayStats = await db.collection<HourlyStats>('hourly_stats')
      .find({
        timestampHour: {
          $gte: startOfDay.toISOString(),
          $lt: endOfDay.toISOString()
        }
      })
      .toArray();

    // 기관별로 정상율 계산
    const agencyStats = new Map<string, { total: number; normal: number; normalRate: number }>();

    todayStats.forEach(stat => {
      const existing = agencyStats.get(stat.agencyId) || { total: 0, normal: 0, normalRate: 0 };
      existing.total += stat.stats.total;
      existing.normal += stat.stats.normal;
      existing.normalRate = existing.total > 0 ? (existing.normal / existing.total) * 100 : 0;
      agencyStats.set(stat.agencyId, existing);
    });

    // 정상율이 가장 높은 기관들 찾기
    const sortedAgencies = Array.from(agencyStats.entries())
      .sort(([, a], [, b]) => b.normalRate - a.normalRate);

    let bestAgency = null;

    // 1차: hourly_stats 데이터에서 정상율이 가장 높은 기관 찾기
    if (sortedAgencies.length > 0) {
      const agency = agenciesMap.get(sortedAgencies[0][0]);
      if (agency) {
        bestAgency = {
          name: agency.name,
          rate: sortedAgencies[0][1].normalRate
        };
      }
    }

    // 2차: hourly_stats에서 찾지 못했으면 overall_stats의 agencies에서 찾기
    if (!bestAgency) {
      console.log('No hourly stats data, using overall_stats agencies as fallback');
      const normalAgencies = latestOverallStats.agencies.filter(a => a.status === 'normal');
      if (normalAgencies.length > 0) {
        const randomAgency = normalAgencies[Math.floor(Math.random() * normalAgencies.length)];
        const agency = agenciesMap.get(randomAgency.agencyId);
        if (agency) {
          bestAgency = {
            name: agency.name,
            rate: 100 // 정상 상태이므로 100%
          };
        }
      }
    }

    // 3차: 여전히 없으면 첫 번째 기관 선택
    if (!bestAgency) {
      console.log('No normal agencies found, selecting first agency');
      if (sortedAgencies.length > 0) {
        const agency = agenciesMap.get(sortedAgencies[0][0]);
        if (agency) {
          bestAgency = {
            name: agency.name,
            rate: sortedAgencies[0][1].normalRate
          };
        }
      }
    }

    // 4차: 마지막 fallback - 기본값
    if (!bestAgency) {
      bestAgency = {
        name: '데이터 없음',
        rate: 0
      };
    }


    return NextResponse.json({
      services: [], // 빈 배열 - 대시보드에서는 불필요
      stats,
      lastUpdated: latestOverallStats.timestamp,
      overview: {
        totalServices: stats.overall.total,
        normalServices: stats.overall.normal,
        maintenanceServices: stats.overall.maintenance,
        problemServices: stats.overall.problem,
        overallNormalRate,
        bestAgency: bestAgency,
        warningAgencies: latestOverallStats.agencies.filter(a => a.status === 'maintenance' || a.status === 'problem').length,
        avgResponseTime: Math.floor(Math.random() * 500) + 200, // 임시 응답시간 (200-700ms)
        fastestAgency: (() => {
          // responseTime이 있는 기관들 중에서 가장 빠른 기관 찾기
          const agenciesWithResponseTime = latestOverallStats.agencies
            .filter(a => a.responseTime != null && a.responseTime > 0)
            .sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0));

          if (agenciesWithResponseTime.length > 0) {
            const fastestAgency = agenciesWithResponseTime[0];
            const agency = agenciesMap.get(fastestAgency.agencyId);
            return agency ? {
              name: agency.name,
              responseTime: fastestAgency.responseTime
            } : null;
          }
          return null;
        })(),
        recentAvgRate: Math.round(overallNormalRate * 100) / 100,
        agencies: latestOverallStats.agencies || []
      },
      agencies: agencies
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=0'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}