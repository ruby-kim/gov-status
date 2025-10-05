import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { DEFAULT_API_HEADERS, COLLECTIONS } from '@/constants/api';

/**
 * 최근 6시간 동안의 서비스 정상율 트렌드
 * - gov_sites_status 기준
 * - bucketHour 단위로 전체 합산 후 시간순 정렬
 */
export async function GET() {
  try {
    const db = await getDatabase();

    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // 6시간치 bucketHour별 통계 집계
    const pipeline = [
      { $match: { bucketHour: { $gte: sixHoursAgo } } },
      {
        $group: {
          _id: '$bucketHour',
          total: { $sum: '$stats.total' },
          normal: { $sum: '$stats.normal' },
          maintenance: { $sum: '$stats.maintenance' },
          problem: { $sum: '$stats.problem' },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const results = await db
      .collection(COLLECTIONS.GOV_SITES_STATUS)
      .aggregate(pipeline)
      .toArray();

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No hourly stats found' },
        { status: 404 },
      );
    }

    // 프론트엔드 HistoryData 형태로 포맷팅
    const formatted = results.map((r) => ({
      timestamp: r._id,
      overall: {
        total: r.total,
        normal: r.normal,
        maintenance: r.maintenance,
        problem: r.problem,
      },
    }));

    return NextResponse.json(formatted, {
      headers: DEFAULT_API_HEADERS,
    });
  } catch (error) {
    console.error('🚨 Error fetching 6-hour history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch 6-hour history' },
      { status: 500 },
    );
  }
}
