import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // MongoDB 연결 테스트
    let mongoConnected = false;
    try {
      await db.admin().ping();
      mongoConnected = true;
    } catch {
      return NextResponse.json({ error: 'MongoDB connection failed' }, { status: 500 });
    }

    // 각 컬렉션의 데이터 개수 확인
    const agenciesCount = await db.collection('agencies').countDocuments();
    const hourlyStatsCount = await db.collection('hourly_stats').countDocuments();
    const overallStatsCount = await db.collection('overall_stats').countDocuments();

    // 최신 데이터 샘플 확인
    const latestAgency = await db.collection('agencies').findOne({}, { sort: { _id: -1 } });
    const latestHourlyStats = await db.collection('hourly_stats').findOne({}, { sort: { _id: -1 } });
    const latestOverallStats = await db.collection('overall_stats').findOne({}, { sort: { _id: -1 } });

    // hourly_stats의 시간대 분포 확인
    const hourlyStatsSample = await db.collection('hourly_stats')
      .find({})
      .sort({ timestampHour: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      mongoConnected,
      counts: {
        agencies: agenciesCount,
        hourly_stats: hourlyStatsCount,
        overall_stats: overallStatsCount
      },
      samples: {
        latestAgency,
        latestHourlyStats,
        latestOverallStats
      },
      hourlyStatsTimeDistribution: hourlyStatsSample.map(stat => ({
        agencyId: stat.agencyId,
        timestampHour: stat.timestampHour,
        stats: stat.stats
      }))
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json({ error: 'Debug API failed' }, { status: 500 });
  }
}
