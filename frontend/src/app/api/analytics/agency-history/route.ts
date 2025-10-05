import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { DEFAULT_API_HEADERS, COLLECTIONS } from '@/constants/api';

export async function GET() {
  try {
    const db = await getDatabase();

    // -------------------------------------------------------------------
    // 1. KST <-> UTC 변환 유틸
    // -------------------------------------------------------------------
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const toUTC = (date: Date) => new Date(date.getTime() - KST_OFFSET);
    const toKST = (date: Date) => new Date(date.getTime() + KST_OFFSET);

    // -------------------------------------------------------------------
    // 2. 오늘 / 어제 범위 (한국 기준)
    // -------------------------------------------------------------------
    const nowKST = toKST(new Date());

    const todayStartKST = new Date(nowKST);
    todayStartKST.setHours(0, 0, 0, 0);

    const yesterdayStartKST = new Date(todayStartKST);
    yesterdayStartKST.setDate(todayStartKST.getDate() - 1);

    const yesterdayEndKST = new Date(todayStartKST.getTime() - 1);

    // KST → UTC 변환
    const todayStartUTC = toUTC(todayStartKST);
    const yesterdayStartUTC = toUTC(yesterdayStartKST);
    const yesterdayEndUTC = toUTC(yesterdayEndKST);

    // -------------------------------------------------------------------
    // 3. 오늘 / 하루 전 데이터 (gov_sites_status)
    // -------------------------------------------------------------------
    const aggregateDayKST = async (startUTC: Date, endUTC: Date) => {
      return db.collection(COLLECTIONS.GOV_SITES_STATUS)
        .aggregate([
          {
            $match: {
              checkedAt: { $gte: startUTC, $lte: endUTC }
            }
          },
          {
            $group: {
              _id: '$agencyId',
              total: { $sum: '$stats.total' },
              normal: { $sum: '$stats.normal' },
              maintenance: { $sum: '$stats.maintenance' },
              problem: { $sum: '$stats.problem' },
            },
          },
        ])
        .toArray();
    };

    const [todayAgg, yesterdayAgg] = await Promise.all([
      aggregateDayKST(todayStartUTC, new Date()),
      aggregateDayKST(yesterdayStartUTC, yesterdayEndUTC),
    ]);

    // -------------------------------------------------------------------
    // 4. 주간 / 월간 (summary)
    // -------------------------------------------------------------------
    const [weeklyAgg, monthlyAgg] = await Promise.all([
      db.collection(COLLECTIONS.GOV_SITES_SUMMARY)
        .aggregate([
          { $match: { periodType: 'weekly' } },
          { $sort: { updatedAt: -1 } },
          { $group: { _id: '$agencyId', doc: { $first: '$$ROOT' } } },
          { $replaceRoot: { newRoot: '$doc' } }
        ])
        .toArray(),
      db.collection(COLLECTIONS.GOV_SITES_SUMMARY)
        .aggregate([
          { $match: { periodType: 'monthly' } },
          { $sort: { updatedAt: -1 } },
          { $group: { _id: '$agencyId', doc: { $first: '$$ROOT' } } },
          { $replaceRoot: { newRoot: '$doc' } }
        ])
        .toArray()
    ]);

    // -------------------------------------------------------------------
    // 5. 데이터 매핑
    // -------------------------------------------------------------------
    const buildMap = (
      arr: Array<{
        _id?: string;
        agencyId?: string;
        total?: number;
        normal?: number;
        maintenance?: number;
        problem?: number;
        stats?: {
          total: number;
          normal: number;
          maintenance: number;
          problem: number;
        };
      }>,
      keyField: '_id' | 'agencyId' = '_id'
    ) =>
      new Map(
        arr.map((r) => [
          keyField === '_id' ? r._id ?? r.agencyId : r.agencyId ?? r._id,
          {
            total: r.total ?? r.stats?.total ?? 0,
            normal: r.normal ?? r.stats?.normal ?? 0,
            maintenance: r.maintenance ?? r.stats?.maintenance ?? 0,
            problem: r.problem ?? r.stats?.problem ?? 0,
          },
        ]),
      );


    const todayMap = buildMap(todayAgg);
    const yesterdayMap = buildMap(yesterdayAgg);
    const weekMap = buildMap(weeklyAgg, 'agencyId');
    const monthMap = buildMap(monthlyAgg, 'agencyId');

    // -------------------------------------------------------------------
    // 6. 병합
    // -------------------------------------------------------------------
    const allAgencyIds = new Set([
      ...todayMap.keys(),
      ...yesterdayMap.keys(),
      ...weekMap.keys(),
      ...monthMap.keys(),
    ]);

    const calcRate = (s?: {
      total: number;
      normal: number;
      maintenance: number;
      problem: number;
    }) =>
      s && s.total > 0 ? (s.normal / s.total) * 100 : null;

    const results = Array.from(allAgencyIds).map((agencyId) => ({
      agencyId,
      history: [
        {
          timestamp: 'today',
          normalRate: calcRate(todayMap.get(agencyId)),
          stats: todayMap.get(agencyId),
        },
        {
          timestamp: 'yesterday',
          normalRate: calcRate(yesterdayMap.get(agencyId)),
          stats: yesterdayMap.get(agencyId),
        },
        {
          timestamp: 'week',
          normalRate: calcRate(weekMap.get(agencyId)),
          stats: weekMap.get(agencyId),
        },
        {
          timestamp: 'month',
          normalRate: calcRate(monthMap.get(agencyId)),
          stats: monthMap.get(agencyId),
        },
      ].filter((h) => h.stats),
    }));

    return NextResponse.json(results, { headers: DEFAULT_API_HEADERS });

  } catch (error) {
    console.error('Error fetching agency history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agency history' },
      { status: 500 },
    );
  }
}
