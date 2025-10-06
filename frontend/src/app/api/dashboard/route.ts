import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { OverallStats, SiteStatus, Agency } from '@/types/dashboard';
import { DEFAULT_API_HEADERS, COLLECTIONS, DEFAULT_STATS } from '@/constants/api';

export async function GET() {
  try {
    const db = await getDatabase();

    // 1. 최신 전체 통계 불러오기
    const latestOverall = await db
      .collection<{
        timestamp: Date;
        overall: OverallStats;
        sites: SiteStatus[];
      }>(COLLECTIONS.OVERALL_STATS)
      .findOne({}, { sort: { timestamp: -1 } });

    if (!latestOverall) {
      return NextResponse.json({ error: 'No overall stats found' }, { status: 404 });
    }

    // 2. 기관 정보 불러오기
    const agencies = await db.collection<Agency>(COLLECTIONS.GOV_SITES).find({}).toArray();
    const agencyMap = new Map(agencies.map((a) => [a.agencyId, a]));

    // 3. 전체 통계 계산
    const overall = latestOverall.overall ?? { ...DEFAULT_STATS };
    const total = overall.total ?? 0;
    const normal = overall.normal ?? 0;
    const maintenance = overall.maintenance ?? 0;
    const problem = overall.problem ?? 0;
    const overallNormalRate = total > 0 ? (normal / total) * 100 : 0;

    // 4. 사이트 데이터
    const sites: SiteStatus[] = latestOverall.sites ?? [];

    // 5. 평균 응답시간 계산 (정상 상태만)
    const validResponses = sites.filter(
      (s) => s.status === 'normal' && typeof s.responseTime === 'number'
    );

    const avgResponseTime =
      validResponses.length > 0
        ? Math.round(
            validResponses.reduce((sum, s) => sum + (s.responseTime || 0), 0) /
              validResponses.length
          )
        : 0;

    // 6. Top3 빠른 서비스 (정상 상태만)
    const top3FastestServices = validResponses
      .sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0))
      .slice(0, 3)
      .map((site, i) => ({
        rank: i + 1,
        name: agencyMap.get(site.agencyId)?.name ?? '알 수 없음',
        responseTime: site.responseTime ?? 0,
        status: site.status,
      }));

    // 7. 기관별 정상률 계산
    const agencyRates: Record<string, { total: number; normal: number; normalRate: number }> = {};

    for (const site of sites) {
      const id = site.agencyId;
      if (!id) continue;
      if (!agencyRates[id]) agencyRates[id] = { total: 0, normal: 0, normalRate: 0 };
      agencyRates[id].total += 1;
      if (site.status === 'normal') agencyRates[id].normal += 1;
    }

    for (const id in agencyRates) {
      const r = agencyRates[id];
      r.normalRate = r.total > 0 ? (r.normal / r.total) * 100 : 0;
    }

    // 8. 최고 정상률 기관 추출 (여러 개 허용)
    const maxRate = Math.max(...Object.values(agencyRates).map((r) => r.normalRate));
    const bestAgencies = Object.entries(agencyRates)
      .filter(([, r]) => r.normalRate === maxRate)
      .map(([id, r]) => {
        const agency = agencyMap.get(id);
        return {
          agencyId: id,
          name: agency?.name ?? '알 수 없음',
          rate: Math.round(r.normalRate * 100) / 100,
        };
      });

    if (bestAgencies.length === 0) {
      bestAgencies.push({ agencyId: '', name: '데이터 없음', rate: 0 });
    }

    // 9. 응답 반환
    return NextResponse.json(
      {
        stats: { overall },
        lastUpdated: latestOverall.timestamp,
        overview: {
          totalServices: total,
          normalServices: normal,
          maintenanceServices: maintenance,
          problemServices: problem,
          overallNormalRate,
          bestAgencies,
          warningAgencies: maintenance + problem,
          avgResponseTime,
          top3FastestServices,
        },
      },
      {
        headers: DEFAULT_API_HEADERS,
      }
    );
  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
