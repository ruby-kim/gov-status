import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { OverallStats, SiteStatus } from '@/types/dashboard';
import { Services } from '@/types/service';
import { DEFAULT_API_HEADERS, COLLECTIONS } from '@/constants/api';

// 실시간 서비스 상태 조회 API
export async function GET() {
  try {
    const db = await getDatabase();

    // 1. 최신 전체 통계 불러오기
    const latestOverall = await db
      .collection<{ timestamp: Date; overall: OverallStats; sites: SiteStatus[] }>(
        COLLECTIONS.OVERALL_STATS
      ).findOne({}, { sort: { timestamp: -1 } });

    if (!latestOverall) {
      return NextResponse.json({ error: 'No overall stats found' }, { status: 404 });
    }

    // 2. 기관 정보 불러오기
    const agencies = await db.collection<Services>(COLLECTIONS.GOV_SITES).find({}).toArray();
    const agencyMap = new Map(agencies.map(a => [a.agencyId, a]));

    // 3. 각 사이트 상태를 병합
    const services = latestOverall.sites
      .map((site) => {
        const agency = agencyMap.get(site.agencyId);
        if (!agency) return null;

        return {
          id: site.agencyId,
          name: agency.name,
          url: agency.url ?? null,
          status: site.status,
          responseTime: site.responseTime ?? null,
          mainCategory: agency.mainCategory ?? null,
          subCategory: agency.subCategory ?? null,
          lastChecked: latestOverall.timestamp,
          tags: agency.tags ?? [],
        };
      })
      .filter(Boolean);

    // 4. 최신 타임스탬프 반환
    return NextResponse.json(
      {
        services,
        lastUpdated: latestOverall.timestamp,
      },
      {
        headers: DEFAULT_API_HEADERS,
      },
    );
  } catch (error) {
    console.error('🚨 Error fetching live service data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live service data' },
      { status: 500 },
    );
  }
}
