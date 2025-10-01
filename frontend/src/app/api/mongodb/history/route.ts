import { NextResponse } from 'next/server';
import { getDatabase, HourlyStats } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const db = await getDatabase();

    // MongoDB 연결 테스트
    let mongoConnected = false;
    try {
      await db.admin().ping();
      mongoConnected = true;
    } catch {
      console.log('MongoDB connection failed');
    }

    if (!mongoConnected) {
      return NextResponse.json({ error: 'MongoDB connection failed' }, { status: 500 });
    }

    // 사용 가능한 timestampHour들을 확인
    const availableTimestamps = await db.collection<HourlyStats>('hourly_stats')
      .distinct('timestampHour');

    if (availableTimestamps.length === 0) {
      return NextResponse.json({ error: 'No hourly stats data found' }, { status: 404 });
    }

    // 최신 timestampHour부터 최대 N개 가져오기
    const sortedTimestamps = availableTimestamps.sort().reverse();
    const limit = Math.min(days * 24, sortedTimestamps.length); // 최대 N일 * 24시간
    const selectedTimestamps = sortedTimestamps.slice(0, limit);

    // 선택된 시간대의 데이터 조회
    const historyData = await db.collection<HourlyStats>('hourly_stats')
      .find({
        timestampHour: { $in: selectedTimestamps }
      })
      .sort({ timestampHour: 1 })
      .toArray();

    if (!historyData || historyData.length === 0) {
      return NextResponse.json({ error: 'No history data found' }, { status: 404 });
    }

    // 시간별로 그룹화하여 전체 통계 계산
    const groupedByHour = historyData.reduce((acc, entry) => {
      const hour = entry.timestampHour;
      if (!acc[hour]) {
        acc[hour] = {
          total: 0,
          normal: 0,
          maintenance: 0,
          problem: 0
        };
      }
      acc[hour].total += entry.stats.total;
      acc[hour].normal += entry.stats.normal;
      acc[hour].maintenance += entry.stats.maintenance;
      acc[hour].problem += entry.stats.problem;
      return acc;
    }, {} as Record<string, { total: number; normal: number; maintenance: number; problem: number }>);

    // MongoDB 데이터를 기존 Redis 구조로 변환
    const history = Object.entries(groupedByHour).map(([timestamp, stats]) => ({
      timestamp,
      overall: stats
    }));

    return NextResponse.json(history, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching history data:', error);
    return NextResponse.json({ error: 'Failed to fetch history data' }, { status: 500 });
  }
}