import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { HourlyStats } from '@/types';

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
    const limit = Math.min(days * 24, sortedTimestamps.length);
    const selectedTimestamps = sortedTimestamps.slice(0, limit);

    // 선택된 시간대의 데이터 조회
    const historyData = await db.collection<HourlyStats>('hourly_stats')
      .find({
        timestampHour: { $in: selectedTimestamps }
      })
      .sort({ timestampHour: 1 })
      .toArray();

    // 모든 기관 정보도 가져오기
    const agencies = await db.collection('agencies').find({}).toArray();
    const allAgencyIds = agencies.map(agency => agency.agencyId);

    if (!historyData || historyData.length === 0) {
      return NextResponse.json({ error: 'No history data found' }, { status: 404 });
    }

    // 기관별로 그룹화하여 시간대별 정상율 계산
    const agencyHistory = historyData.reduce((acc, entry) => {
      const agencyId = entry.agencyId;
      const timestamp = entry.timestampHour;

      if (!acc[agencyId]) {
        acc[agencyId] = {};
      }

      // 각 시간대별로 데이터를 그대로 저장
      acc[agencyId][timestamp] = {
        total: entry.stats.total,
        normal: entry.stats.normal,
        maintenance: entry.stats.maintenance,
        problem: entry.stats.problem
      };

      return acc;
    }, {} as Record<string, Record<string, { total: number; normal: number; maintenance: number; problem: number }>>);

    // 모든 기관에 대해 결과 생성 (데이터가 없는 기관은 빈 배열)
    const result = allAgencyIds.map(agencyId => {
      const timeData = agencyHistory[agencyId] || {};
      const timeEntries = Object.entries(timeData)
        .sort(([a], [b]) => a.localeCompare(b)) // 시간순 정렬
        .map(([timestamp, stats]) => ({
          timestamp,
          normalRate: stats.total > 0 ? (stats.normal / stats.total) * 100 : 0,
          stats
        }));

      return {
        agencyId,
        history: timeEntries
      };
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=0'
      }
    });
  } catch (error) {
    console.error('Error fetching agency history data:', error);
    return NextResponse.json({ error: 'Failed to fetch agency history data' }, { status: 500 });
  }
}
