import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 최근 N일간의 데이터 가져오기
    const now = Math.floor(Date.now() / 1000);
    const daysAgo = now - (days * 24 * 60 * 60);

    // 먼저 키가 존재하는지 확인
    const keyExists = await redis.exists('stats:history');

    if (!keyExists) {
      return NextResponse.json({ error: 'stats:history key does not exist' }, { status: 404 });
    }

    // ZSET의 모든 멤버 확인
    const allMembers = await redis.zrange('stats:history', 0, -1, 'WITHSCORES');

    // 최근 멤버들 확인
    const recentMembers = await redis.zrevrange('stats:history', 0, 5, 'WITHSCORES');
    const historyData = await redis.zrangebyscore(
      'stats:history',
      daysAgo,
      now,
      'WITHSCORES'
    );

    if (!historyData || historyData.length === 0) {
      return NextResponse.json({ error: 'No history data found' }, { status: 404 });
    }

    // ZSET 데이터를 파싱하여 배열로 변환
    const history = [];
    for (let i = 0; i < historyData.length; i += 2) {
      const data = JSON.parse(historyData[i]);
      const timestamp = parseFloat(historyData[i + 1]);

      history.push({
        ...data,
        timestamp: new Date(timestamp * 1000).toISOString()
      });
    }

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
