import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { OverallStats, Agency } from '@/types';

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
      const agencies = [...new Set(allServices.map(s => s.agency.name))].map((name, index) => ({
        agencyId: `sample-${index}`,
        name,
        status: allServices.find(s => s.agency.name === name)?.status || 'normal'
      }));

      return NextResponse.json({
        overview: {
          totalServices: allServices.length,
          normalServices: allServices.filter(s => s.status === 'normal').length,
          maintenanceServices: allServices.filter(s => s.status === 'maintenance').length,
          problemServices: allServices.filter(s => s.status === 'problem').length,
          totalAgencies: agencies.length,
          overallNormalRate: 95.0,
          lastUpdated: new Date().toISOString()
        },
        agencies,
        statusDistribution: {
          normal: allServices.filter(s => s.status === 'normal').length,
          maintenance: allServices.filter(s => s.status === 'maintenance').length,
          problem: allServices.filter(s => s.status === 'problem').length
        }
      });
    }

    // 1. 최신 전체 통계 가져오기
    const latestStats = await db.collection<OverallStats>('overall_stats')
      .findOne({}, { sort: { timestamp: -1 } });

    if (!latestStats) {
      return NextResponse.json({ error: 'No stats data found' }, { status: 404 });
    }

    // 2. 기관 메타데이터 가져오기
    const agencies = await db.collection<Agency>('agencies').find({}).toArray();
    const agencyMap = new Map(agencies.map(agency => [agency.agencyId, agency]));

    // 3. overall_stats의 agencies 배열과 기관 메타데이터 매핑
    const agenciesWithStatus = latestStats.agencies.map(agencyStatus => {
      const agency = agencyMap.get(agencyStatus.agencyId);
      return {
        agencyId: agencyStatus.agencyId,
        name: agency?.name || 'Unknown Agency',
        url: agency?.url || '',
        mainCategory: agency?.mainCategory || 'Unknown',
        subCategory: agency?.subCategory || 'Unknown',
        status: agencyStatus.status,
        tags: agency?.tags || []
      };
    });

    // 4. 상태별 분포 계산
    const statusDistribution = {
      normal: latestStats.overall.normal,
      maintenance: latestStats.overall.maintenance,
      problem: latestStats.overall.problem
    };

    // 5. 전체 정상율 계산
    const overallNormalRate = latestStats.overall.total > 0
      ? (latestStats.overall.normal / latestStats.overall.total) * 100
      : 0;

    // 6. bestAgency 계산 (하루 동안의 hourly_stats 데이터 기반)

    // 최신 데이터가 있는 날짜 사용
    const availableTimestamps = await db.collection('hourly_stats').distinct('timestampHour');
    const latestTimestamp = availableTimestamps.sort().pop();
    const latestDate = new Date(latestTimestamp);
    const dataStartOfDay = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
    const dataEndOfDay = new Date(dataStartOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayStats = await db.collection('hourly_stats')
      .find({
        timestampHour: {
          $gte: dataStartOfDay.toISOString(),
          $lt: dataEndOfDay.toISOString()
        }
      })
      .toArray();

    // 기관별로 정상율 계산
    const agencyStats = new Map();
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
    if (sortedAgencies.length > 0) {
      const maxNormalRate = sortedAgencies[0][1].normalRate;
      const bestAgencies = sortedAgencies.filter(([, stats]) => stats.normalRate === maxNormalRate);

      // 가장 높은 정상율을 가진 기관들 중에서 랜덤 선택
      const randomBestAgency = bestAgencies[Math.floor(Math.random() * bestAgencies.length)];
      const agency = agencyMap.get(randomBestAgency[0]);

      bestAgency = agency ? {
        name: agency.name,
        rate: randomBestAgency[1].normalRate
      } : null;
    } else {
      // hourly_stats 데이터가 없으면 overall_stats의 agencies에서 정상 상태인 기관 중 랜덤 선택
      const normalAgencies = latestStats.agencies.filter(a => a.status === 'normal');
      if (normalAgencies.length > 0) {
        const randomAgency = normalAgencies[Math.floor(Math.random() * normalAgencies.length)];
        const agency = agencyMap.get(randomAgency.agencyId);
        bestAgency = agency ? {
          name: agency.name,
          rate: 100 // 정상 상태이므로 100%
        } : null;
      }
    }

    // 7. warningAgencies 계산
    const warningAgencies = latestStats.agencies.filter(a => a.status === 'maintenance' || a.status === 'problem').length;

    // 8. avgResponseTime과 fastestAgency 계산
    const avgResponseTime = Math.floor(Math.random() * 500) + 200; // 임시 응답시간 (200-700ms)

    const fastestAgency = (() => {
      // responseTime이 있는 기관들 중에서 가장 빠른 기관 찾기
      const agenciesWithResponseTime = latestStats.agencies
        .filter(a => a.responseTime != null && a.responseTime > 0)
        .sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0));

      if (agenciesWithResponseTime.length > 0) {
        const fastestAgency = agenciesWithResponseTime[0];
        const agency = agencyMap.get(fastestAgency.agencyId);
        return agency ? {
          name: agency.name,
          responseTime: fastestAgency.responseTime
        } : null;
      }
      return null;
    })();

    return NextResponse.json({
      overview: {
        totalServices: latestStats.overall.total,
        normalServices: latestStats.overall.normal,
        maintenanceServices: latestStats.overall.maintenance,
        problemServices: latestStats.overall.problem,
        totalAgencies: agenciesWithStatus.length,
        overallNormalRate: Math.round(overallNormalRate * 100) / 100,
        lastUpdated: latestStats.timestamp,
        bestAgency,
        warningAgencies,
        avgResponseTime,
        fastestAgency
      },
      agencies: agenciesWithStatus,
      statusDistribution
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=0'
      }
    });
  } catch (error) {
    console.error('Error fetching comprehensive stats:', error);
    return NextResponse.json({ error: 'Failed to fetch comprehensive stats' }, { status: 500 });
  }
}
