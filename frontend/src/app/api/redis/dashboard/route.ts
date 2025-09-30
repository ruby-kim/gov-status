import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
  try {
    // Redis 연결 테스트
    let redisConnected = false;
    try {
      await redis.ping();
      redisConnected = true;
    } catch {
      console.log('Falling back to sample data');
    }

    // Redis가 연결되지 않았으면 샘플 데이터 사용
    if (!redisConnected) {
      const { allServices } = await import('@/data/sampleData');

      // 샘플 데이터로 기본 통계 생성
      const sampleStats = {
        overall: {
          total: allServices.length,
          normal: allServices.filter(s => s.status === 'normal').length,
          maintenance: allServices.filter(s => s.status === 'maintenance').length,
          problem: allServices.filter(s => s.status === 'problem').length
        },
        perAgency: {} as Record<string, { total: number; normal: number; maintenance: number; problem: number }>
      };

      // 기관별 통계 생성
      allServices.forEach(service => {
        const agencyName = service.agency.name;
        if (!sampleStats.perAgency[agencyName]) {
          sampleStats.perAgency[agencyName] = {
            total: 0,
            normal: 0,
            maintenance: 0,
            problem: 0
          };
        }
        sampleStats.perAgency[agencyName].total++;
        sampleStats.perAgency[agencyName][service.status]++;
      });

      return NextResponse.json({
        services: allServices,
        stats: sampleStats,
        overview: {
          totalServices: sampleStats.overall.total,
          normalServices: sampleStats.overall.normal,
          maintenanceServices: sampleStats.overall.maintenance,
          problemServices: sampleStats.overall.problem,
          overallNormalRate: (sampleStats.overall.normal / sampleStats.overall.total) * 100,
          bestAgency: { name: '샘플 기관', rate: 95.0 },
          warningAgencies: 0,
          avgResponseTime: 500,
          dailyAvgNormalRate: (sampleStats.overall.normal / sampleStats.overall.total) * 100
        },
        agencyStats: Object.entries(sampleStats.perAgency).map(([agencyName, data]) => ({
          agency: agencyName,
          current: {
            total: data.total,
            normal: data.normal,
            maintenance: data.maintenance,
            problem: data.problem,
            normalRate: (data.normal / data.total) * 100
          },
          month1: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: null },
          month2: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: null },
          month3: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: null },
          average: (data.normal / data.total) * 100,
          trend: null
        }))
      });
    }

    // Redis에서 데이터 가져오기
    const [servicesData, statsData, historyData] = await Promise.all([
      redis.get('services:latest'),
      redis.get('stats:latest'),
      redis.zrevrange('stats:history', 0, 144, 'WITHSCORES') // 최근 24시간 (10분 단위)
    ]);

    if (!servicesData || !statsData) {
      console.log('No Redis data found, using sample data');
      // Redis 데이터가 없으면 샘플 데이터 사용
      const { allServices } = await import('@/data/sampleData');

      // 샘플 데이터로 기본 통계 생성
      const sampleStats = {
        overall: {
          total: allServices.length,
          normal: allServices.filter(s => s.status === 'normal').length,
          maintenance: allServices.filter(s => s.status === 'maintenance').length,
          problem: allServices.filter(s => s.status === 'problem').length
        },
        perAgency: {} as Record<string, { total: number; normal: number; maintenance: number; problem: number }>
      };

      // 기관별 통계 생성
      allServices.forEach(service => {
        const agencyName = service.agency.name;
        if (!sampleStats.perAgency[agencyName]) {
          sampleStats.perAgency[agencyName] = {
            total: 0,
            normal: 0,
            maintenance: 0,
            problem: 0
          };
        }
        sampleStats.perAgency[agencyName].total++;
        sampleStats.perAgency[agencyName][service.status]++;
      });

      return NextResponse.json({
        services: allServices,
        stats: sampleStats,
        overview: {
          totalServices: sampleStats.overall.total,
          normalServices: sampleStats.overall.normal,
          maintenanceServices: sampleStats.overall.maintenance,
          problemServices: sampleStats.overall.problem,
          overallNormalRate: (sampleStats.overall.normal / sampleStats.overall.total) * 100,
          bestAgency: { name: '샘플 기관', rate: 95.0 },
          warningAgencies: 0,
          avgResponseTime: 500,
          dailyAvgNormalRate: (sampleStats.overall.normal / sampleStats.overall.total) * 100
        },
        agencyStats: Object.entries(sampleStats.perAgency).map(([agencyName, data]) => ({
          agency: agencyName,
          current: {
            total: data.total,
            normal: data.normal,
            maintenance: data.maintenance,
            problem: data.problem,
            normalRate: (data.normal / data.total) * 100
          },
          month1: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: null },
          month2: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: null },
          month3: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: null },
          average: (data.normal / data.total) * 100,
          trend: null
        }))
      });
    }

    const services = JSON.parse(servicesData);
    const stats = JSON.parse(statsData);

    // 히스토리 데이터 파싱
    const history = [];
    for (let i = 0; i < historyData.length; i += 2) {
      const data = JSON.parse(historyData[i]);
      const timestamp = parseInt(historyData[i + 1]);
      history.push({
        ...data,
        timestamp: new Date(timestamp).toISOString()
      });
    }

    // 1. 전체 정상율 계산
    const overallNormalRate = stats.overall.total > 0
      ? (stats.overall.normal / stats.overall.total) * 100
      : 0;

    // 2. 최고 정상율 기관 (동일한 정상율이 있으면 랜덤 선택)
    const agencyRates = Object.entries(stats.perAgency).map(([agencyId, agencyInfo]) => {
      const agencyData = (agencyInfo as any).stats || agencyInfo; // eslint-disable-line @typescript-eslint/no-explicit-any
      return {
        name: (agencyInfo as any).name || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
        rate: agencyData.total > 0 ? (agencyData.normal / agencyData.total) * 100 : 0
      };
    });

    // 정상율로 정렬하고, 동일한 최고 정상율을 가진 기관들을 찾기
    agencyRates.sort((a, b) => b.rate - a.rate);
    const maxRate = agencyRates[0]?.rate || 0;
    const topAgencies = agencyRates.filter(agency => agency.rate === maxRate);

    // 최고 정상율을 가진 기관들 중에서 랜덤 선택
    const bestAgency = topAgencies.length > 0
      ? topAgencies[Math.floor(Math.random() * topAgencies.length)]
      : null;

    // 3. 주의 필요 기관 수 (정상율 90% 미만)
    const warningAgencies = Object.entries(stats.perAgency).filter(([, agencyStats]) => {
      const rate = (agencyStats as any).total > 0 ? ((agencyStats as any).normal / (agencyStats as any).total) * 100 : 0; // eslint-disable-line @typescript-eslint/no-explicit-any
      return rate < 90;
    }).length;

    // 4. 평균 응답시간 계산 (정상 상태인 서비스만)
    const normalServices = services.filter((service: any) => service.status === 'normal'); // eslint-disable-line @typescript-eslint/no-explicit-any
    const avgResponseTime = normalServices.length > 0
      ? normalServices.reduce((sum: number, service: any) => sum + (service.responseTime || 0), 0) / normalServices.length // eslint-disable-line @typescript-eslint/no-explicit-any
      : 0;

    // 5. 최근 하루 평균 정상율
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentHistory = history.filter(h => new Date(h.timestamp).getTime() > oneDayAgo);
    const recentAvgRate = recentHistory.length > 0
      ? recentHistory.reduce((sum, h) => {
        const rate = h.overall.total > 0 ? (h.overall.normal / h.overall.total) * 100 : 0;
        return sum + rate;
      }, 0) / recentHistory.length
      : overallNormalRate;

    // 6. 기관별 3개월 통계 계산
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const fourMonthsAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);

    // 기관별 통계 초기화
    const agencyStats: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    // 현재 데이터로 초기화 (새로운 구조: perAgency[기관ID] = {id, name, url, stats})
    for (const [agencyId, agencyInfo] of Object.entries(stats.perAgency)) {
      const agencyData = (agencyInfo as any).stats || agencyInfo; // eslint-disable-line @typescript-eslint/no-explicit-any
      agencyStats[agencyId] = {
        id: (agencyInfo as any).id || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
        name: (agencyInfo as any).name || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
        url: (agencyInfo as any).url || '#', // eslint-disable-line @typescript-eslint/no-explicit-any
        current: {
          total: agencyData.total,
          normal: agencyData.normal,
          maintenance: agencyData.maintenance || 0,
          problem: agencyData.problem || 0,
          normalRate: agencyData.total > 0 ? (agencyData.normal / agencyData.total) * 100 : 0
        },
        month1: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
        month2: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
        month3: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 }
      };
    }

    // 히스토리 데이터를 기간별로 분류하여 합계 계산
    const periodData = {
      month1: { total: 0, normal: 0, maintenance: 0, problem: 0, count: 0 },
      month2: { total: 0, normal: 0, maintenance: 0, problem: 0, count: 0 },
      month3: { total: 0, normal: 0, maintenance: 0, problem: 0, count: 0 }
    };

    for (const historyEntry of history) {
      const entryTime = new Date(historyEntry.timestamp);

      // 1개월 전 (30일 ~ 60일 전)
      if (entryTime >= twoMonthsAgo && entryTime < oneMonthAgo) {
        periodData.month1.total += historyEntry.overall.total;
        periodData.month1.normal += historyEntry.overall.normal;
        periodData.month1.maintenance += historyEntry.overall.maintenance;
        periodData.month1.problem += historyEntry.overall.problem;
        periodData.month1.count++;

        // 기관별 데이터도 누적 (새로운 구조: perAgency[기관ID] = {id, name, url, stats})
        for (const [agencyId, agencyInfo] of Object.entries(historyEntry.perAgency)) {
          const agencyData = (agencyInfo as any).stats || agencyInfo; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!agencyStats[agencyId]) {
            agencyStats[agencyId] = {
              id: (agencyInfo as any).id || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
              name: (agencyInfo as any).name || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
              url: (agencyInfo as any).url || '#', // eslint-disable-line @typescript-eslint/no-explicit-any
              current: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month1: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month2: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month3: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 }
            };
          }
          agencyStats[agencyId].month1.total += agencyData.total;
          agencyStats[agencyId].month1.normal += agencyData.normal;
          agencyStats[agencyId].month1.maintenance += agencyData.maintenance || 0;
          agencyStats[agencyId].month1.problem += agencyData.problem || 0;
        }
      }
      // 2개월 전 (60일 ~ 90일 전)
      else if (entryTime >= threeMonthsAgo && entryTime < twoMonthsAgo) {
        periodData.month2.total += historyEntry.overall.total;
        periodData.month2.normal += historyEntry.overall.normal;
        periodData.month2.maintenance += historyEntry.overall.maintenance;
        periodData.month2.problem += historyEntry.overall.problem;
        periodData.month2.count++;

        for (const [agencyId, agencyInfo] of Object.entries(historyEntry.perAgency)) {
          const agencyData = (agencyInfo as any).stats || agencyInfo; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!agencyStats[agencyId]) {
            agencyStats[agencyId] = {
              id: (agencyInfo as any).id || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
              name: (agencyInfo as any).name || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
              url: (agencyInfo as any).url || '#', // eslint-disable-line @typescript-eslint/no-explicit-any
              current: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month1: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month2: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month3: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 }
            };
          }
          agencyStats[agencyId].month2.total += agencyData.total;
          agencyStats[agencyId].month2.normal += agencyData.normal;
          agencyStats[agencyId].month2.maintenance += agencyData.maintenance || 0;
          agencyStats[agencyId].month2.problem += agencyData.problem || 0;
        }
      }
      // 3개월 전 (90일 ~ 120일 전)
      else if (entryTime >= fourMonthsAgo && entryTime < threeMonthsAgo) {
        periodData.month3.total += historyEntry.overall.total;
        periodData.month3.normal += historyEntry.overall.normal;
        periodData.month3.maintenance += historyEntry.overall.maintenance;
        periodData.month3.problem += historyEntry.overall.problem;
        periodData.month3.count++;

        for (const [agencyId, agencyInfo] of Object.entries(historyEntry.perAgency)) {
          const agencyData = (agencyInfo as any).stats || agencyInfo; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!agencyStats[agencyId]) {
            agencyStats[agencyId] = {
              id: (agencyInfo as any).id || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
              name: (agencyInfo as any).name || agencyId, // eslint-disable-line @typescript-eslint/no-explicit-any
              url: (agencyInfo as any).url || '#', // eslint-disable-line @typescript-eslint/no-explicit-any
              current: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month1: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month2: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 },
              month3: { total: 0, normal: 0, maintenance: 0, problem: 0, normalRate: 0 }
            };
          }
          agencyStats[agencyId].month3.total += agencyData.total;
          agencyStats[agencyId].month3.normal += agencyData.normal;
          agencyStats[agencyId].month3.maintenance += agencyData.maintenance || 0;
          agencyStats[agencyId].month3.problem += agencyData.problem || 0;
        }
      }
    }

    // 정상율 계산
    for (const [, data] of Object.entries(agencyStats)) {
      // 1개월 전 정상율
      data.month1.normalRate = data.month1.total > 0 ? (data.month1.normal / data.month1.total) * 100 : null;
      // 2개월 전 정상율
      data.month2.normalRate = data.month2.total > 0 ? (data.month2.normal / data.month2.total) * 100 : null;
      // 3개월 전 정상율
      data.month3.normalRate = data.month3.total > 0 ? (data.month3.normal / data.month3.total) * 100 : null;
    }

    // 히스토리 데이터가 없는 경우 N/A로 설정
    if (periodData.month1.count === 0 && periodData.month2.count === 0 && periodData.month3.count === 0) {
      console.log('No history data found, setting to N/A...');

      for (const [, data] of Object.entries(agencyStats)) {
        // 모든 과거 데이터를 N/A로 설정
        data.month1.total = 0;
        data.month1.normal = 0;
        data.month1.maintenance = 0;
        data.month1.problem = 0;
        data.month1.normalRate = null;

        data.month2.total = 0;
        data.month2.normal = 0;
        data.month2.maintenance = 0;
        data.month2.problem = 0;
        data.month2.normalRate = null;

        data.month3.total = 0;
        data.month3.normal = 0;
        data.month3.maintenance = 0;
        data.month3.problem = 0;
        data.month3.normalRate = null;
      }
    }

    // 평균과 트렌드 계산
    const agencyStatsArray = Object.entries(agencyStats).map(([, data]) => {
      // 실제 데이터가 있는 값들만으로 평균 계산 (N/A 제외)
      const validRates = [];

      // 현재 데이터는 항상 포함
      if (data.current.normalRate !== null) {
        validRates.push(data.current.normalRate);
      }

      // 과거 데이터는 null이 아닌 경우만 포함
      if (data.month1.normalRate !== null) {
        validRates.push(data.month1.normalRate);
      }
      if (data.month2.normalRate !== null) {
        validRates.push(data.month2.normalRate);
      }
      if (data.month3.normalRate !== null) {
        validRates.push(data.month3.normalRate);
      }

      // 유효한 데이터가 있는 경우만 평균 계산
      const avgRate = validRates.length > 0
        ? validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length
        : null;

      // 트렌드 계산 (3개월 전 데이터가 있는 경우만)
      const trend = data.month3.normalRate !== null
        ? data.current.normalRate - data.month3.normalRate
        : null;

      return {
        id: data.id,
        name: data.name,
        url: data.url,
        agency: data.name, // 기존 호환성을 위해 유지
        current: data.current,
        month1: data.month1,
        month2: data.month2,
        month3: data.month3,
        average: avgRate,
        trend: trend
      };
    }).sort((a, b) => b.current.normalRate - a.current.normalRate);

    return NextResponse.json({
      services,
      stats,
      lastUpdated: stats.timestamp || new Date().toISOString(),
      overview: {
        totalServices: stats.overall.total,
        normalServices: stats.overall.normal,
        maintenanceServices: stats.overall.maintenance,
        problemServices: stats.overall.problem,
        overallNormalRate,
        bestAgency: bestAgency ? { name: bestAgency.name, rate: bestAgency.rate } : null,
        warningAgencies,
        avgResponseTime: Math.round(avgResponseTime),
        recentAvgRate: Math.round(recentAvgRate * 100) / 100
      },
      agencyStats: agencyStatsArray
    }, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
