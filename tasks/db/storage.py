from datetime import datetime, timedelta, timezone
from pymongo import UpdateOne
from db.stats import StatsBuilder

class Storage:
    def __init__(self, db):
        self.db = db
        self.ensure_ttl_index()

    def ensure_ttl_index(self):
        """checkedAt 기준 48시간 TTL"""
        self.db["gov_sites_status"].create_index(
            "checkedAt", expireAfterSeconds=48 * 3600, background=True
        )

    # --------------------------------------------------------------------------
    # 매시간 상태 저장 (KST 기준 버전)
    # --------------------------------------------------------------------------
    def save_hourly_status(self, results):
        # 한국시간(KST) 기준 현재 시각
        KST = timezone(timedelta(hours=9))
        now_kst = datetime.now(KST)

        # 한국시간 기준 버킷 계산
        bucket_hour_kst = now_kst.replace(minute=0, second=0, microsecond=0)
        bucket_day_kst = now_kst.replace(hour=0, minute=0, second=0, microsecond=0)

        # UTC로 변환하여 MongoDB에 저장
        bucket_hour_utc = bucket_hour_kst.astimezone(timezone.utc)
        bucket_day_utc = bucket_day_kst.astimezone(timezone.utc)
        now_utc = now_kst.astimezone(timezone.utc)

        bulk_ops = []
        for r in results:
            # 상태 카운트 증가
            inc = {
                "stats.total": 1,
                "stats.normal": 0,
                "stats.maintenance": 0,
                "stats.problem": 0
            }
            inc[f"stats.{r['status']}"] = 1

            bulk_ops.append(UpdateOne(
                {"agencyId": r["agencyId"], "bucketHour": bucket_hour_utc},
                {
                    "$setOnInsert": {
                        "agencyId": r["agencyId"],
                        "bucketHour": bucket_hour_utc,
                        "bucketDay": bucket_day_utc,
                        "checkedAt": now_utc
                    },
                    "$inc": inc
                },
                upsert=True
            ))

        if bulk_ops:
            self.db["gov_sites_status"].bulk_write(bulk_ops)
            print(f"✅ {len(bulk_ops)}개 기관 상태 저장 완료 (KST {bucket_hour_kst})")
        else:
            print("⚠️ 저장할 결과 없음")

    # --------------------------------------------------------------------------
    # 전체 스냅샷 (최신 1개)
    # --------------------------------------------------------------------------
    def save_overall_snapshot(self, results):
        now = datetime.now(timezone.utc)
        stats = StatsBuilder.build(results)
        snapshot_doc = {
            "timestamp": now,
            "overall": stats["overall"],
            "sites": [
                {
                    "agencyId": r["agencyId"],
                    "status": r["status"],
                    "responseTime": r.get("responseTime")
                }
                for r in results
            ]
        }
        self.db["overall_stats"].replace_one({}, snapshot_doc, upsert=True)
        print(f"📸 전체 스냅샷 갱신 완료 ({now})")

    # --------------------------------------------------------------------------
    # 요약 (daily/weekly/monthly)
    # --------------------------------------------------------------------------
    def aggregate_summary(self, period_name, days, required_days):
        """
        gov_sites_status 기반으로 기관별 집계 생성 (KST 기준).
        """
        KST = timezone(timedelta(hours=9))
        now_kst = datetime.now(KST)
        end_of_day_kst = now_kst.replace(hour=23, minute=59, second=59, microsecond=999999)
        start_of_period_kst = (end_of_day_kst - timedelta(days=days - 1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        # UTC로 변환 (MongoDB에는 UTC 기준으로 저장됨)
        start_utc = start_of_period_kst.astimezone(timezone.utc)
        end_utc = end_of_day_kst.astimezone(timezone.utc)

        distinct_days = self.db["gov_sites_status"].distinct(
            "bucketDay", {"checkedAt": {"$gte": start_utc, "$lte": end_utc}}
        )
        day_count = len(distinct_days)

        if day_count < required_days:
            print(f"⚠️ {period_name.capitalize()} 집계 생략 — 데이터 부족 ({day_count}일치, {required_days}일 이상 필요)")
            return

        pipeline = [
            {"$match": {"checkedAt": {"$gte": start_utc, "$lte": end_utc}}},
            {"$group": {
                "_id": "$agencyId",
                "normal": {"$sum": "$stats.normal"},
                "maintenance": {"$sum": "$stats.maintenance"},
                "problem": {"$sum": "$stats.problem"},
                "total": {"$sum": "$stats.total"},
            }},
        ]

        results = list(self.db["gov_sites_status"].aggregate(pipeline))
        if not results:
            print(f"⚠️ {period_name.capitalize()} 데이터 없음 (스킵)")
            return

        bulk_ops = []
        now_utc = now_kst.astimezone(timezone.utc)
        for r in results:
            bulk_ops.append(UpdateOne(
                {"agencyId": r["_id"], "periodType": period_name},
                {"$set": {
                    "agencyId": r["_id"],
                    "periodType": period_name,
                    "periodStart": start_utc,
                    "periodEnd": end_utc,
                    "stats": {
                        "total": r["total"],
                        "normal": r["normal"],
                        "maintenance": r["maintenance"],
                        "problem": r["problem"]
                    },
                    "updatedAt": now_utc
                }},
                upsert=True
            ))

        self.db["gov_sites_summary"].bulk_write(bulk_ops)
        print(f"✅ {period_name.capitalize()} Summary 저장 완료 ({start_of_period_kst.date()} ~ {end_of_day_kst.date()})")

    # --------------------------------------------------------------------------
    # 전체 실행
    # --------------------------------------------------------------------------
    def save_hourly_and_overall(self, results):
        self.save_hourly_status(results)
        self.save_overall_snapshot(results)
        print("💾 MongoDB 저장 프로세스 완료\n")

    def save_all_summaries(self):
        print("\n📊 Summary 집계 시작 (KST 기준)")
        self.aggregate_summary("daily", days=1, required_days=1)
        self.aggregate_summary("weekly", days=7, required_days=7)
        self.aggregate_summary("monthly", days=30, required_days=30)
        print("💾 Summary 집계 완료\n")
