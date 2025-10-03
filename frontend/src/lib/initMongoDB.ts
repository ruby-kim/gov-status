import { getDatabase } from './mongodb';
import { Agency, HourlyStats, OverallStats, AgencyStatus } from '@/types';

/**
 * MongoDB 데이터베이스 초기화 및 샘플 데이터 삽입
 */
export async function initializeMongoDB() {
  try {
    const db = await getDatabase();

    // 컬렉션 생성 및 인덱스 설정
    await db.collection('agencies').createIndex({ agencyId: 1 }, { unique: true });
    await db.collection('hourly_stats').createIndex({ agencyId: 1, timestampHour: 1 }, { unique: true });
    await db.collection('overall_stats').createIndex({ timestamp: 1 }, { unique: true });

    // 샘플 데이터 삽입 (기존 데이터가 없는 경우에만)
    const agenciesCount = await db.collection('agencies').countDocuments();
    if (agenciesCount === 0) {
      await insertSampleData(db);
    }

  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
}

/**
 * 샘플 데이터 삽입
 */
async function insertSampleData(db: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // 샘플 기관 데이터
  const sampleAgencies: Agency[] = [
    {
      agencyId: 'agency1',
      name: '정부24',
      url: 'https://www.gov.kr',
      mainCategory: '정부포털',
      subCategory: '통합포털',
      tags: ['정부', '포털', '통합']
    },
    {
      agencyId: 'agency2',
      name: '국세청',
      url: 'https://www.nts.go.kr',
      mainCategory: '세무',
      subCategory: '국세',
      tags: ['세무', '국세', '신고']
    },
    {
      agencyId: 'agency3',
      name: '건강보험공단',
      url: 'https://www.nhis.or.kr',
      mainCategory: '보험',
      subCategory: '건강보험',
      tags: ['건강보험', '의료', '보험']
    }
  ];

  // 샘플 시간별 통계 데이터 (최근 24시간)
  const now = new Date();
  const sampleHourlyStats: HourlyStats[] = [];
  const sampleOverallStats: OverallStats[] = [];

  for (let i = 0; i < 24; i++) {
    const timestampHour = new Date(now.getTime() - (i * 60 * 60 * 1000));
    timestampHour.setMinutes(0, 0, 0);
    const timestampHourISO = timestampHour.toISOString();

    let totalNormal = 0;
    let totalMaintenance = 0;
    let totalProblem = 0;
    const agenciesStatus: AgencyStatus[] = [];

    // 각 기관별 통계 생성
    for (const agency of sampleAgencies) {
      const normal = Math.floor(Math.random() * 10) + 5; // 5-14
      const maintenance = Math.floor(Math.random() * 3); // 0-2
      const problem = Math.floor(Math.random() * 2); // 0-1
      const total = normal + maintenance + problem;

      sampleHourlyStats.push({
        agencyId: agency.agencyId,
        timestampHour: timestampHourISO,
        stats: {
          total,
          normal,
          maintenance,
          problem
        }
      });

      // 기관 상태 결정 (가장 많은 상태를 기준으로)
      let status: 'normal' | 'maintenance' | 'problem' = 'normal';
      if (maintenance > normal && maintenance > problem) {
        status = 'maintenance';
      } else if (problem > normal && problem > maintenance) {
        status = 'problem';
      }

      agenciesStatus.push({
        agencyId: agency.agencyId,
        status,
        responseTime: Math.floor(Math.random() * 2000) + 100 // 100-2100ms
      });

      totalNormal += normal;
      totalMaintenance += maintenance;
      totalProblem += problem;
    }

    // 전체 통계 생성
    sampleOverallStats.push({
      timestamp: timestampHourISO,
      overall: {
        total: totalNormal + totalMaintenance + totalProblem,
        normal: totalNormal,
        maintenance: totalMaintenance,
        problem: totalProblem
      },
      agencies: agenciesStatus
    });
  }

  // 데이터 삽입
  await db.collection('agencies').insertMany(sampleAgencies);
  await db.collection('hourly_stats').insertMany(sampleHourlyStats);
  await db.collection('overall_stats').insertMany(sampleOverallStats);
}

/**
 * MongoDB 연결 테스트
 */
export async function testMongoDBConnection(): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return false;
  }
}
