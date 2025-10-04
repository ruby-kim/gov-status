from datetime import datetime, timedelta, timezone
from pymongo import UpdateOne
from checker.stats import StatsBuilder


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
    # 매시간 상태 저장
    # --------------------------------------------------------------------------
    def save_hourly_status(self, results):
        now = datetime.now(timezone.utc)
        bucket_hour = now.replace(minute=0, second=0, microsecond=0)
        bucket_day = now.replace(hour=0, minute=0, second=0, microsecond=0)

        bulk_ops = []
        for r in results:
            inc = {"stats.total": 1, "stats.normal": 0, "stats.maintenance": 0, "stats.problem": 0}
            inc[f"stats.{r['status']}"] = 1

            bulk_ops.append(UpdateOne(
                {"agencyId": r["agencyId"], "bucketHour": bucket_hour},
                {"$setOnInsert": {
                    "agencyId": r["agencyId"],
                    "bucketHour": bucket_hour,
                    "bucketDay": bucket_day,
                    "checkedAt": now
                }, "$inc": inc},
                upsert=True
            ))

        if bulk_ops:
            self.db["gov_sites_status"].bulk_write(bulk_ops)
            print(f"✅ {len(bulk_ops)}개 기관 상태 저장 완료 ({bucket_hour})")
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
    # 기관별 summary (daily/weekly/monthly)
    # --------------------------------------------------------------------------
    def aggregate_summary(self, period_name, days, required_days):
        """
        gov_sites_status 기반으로 기관별 집계 생성.
        단, 실제로 'required_days' 이상 날짜 데이터가 존재할 때만 생성.
        """
        now = datetime.now(timezone.utc)
        end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        start_of_period = (end_of_day - timedelta(days=days - 1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        distinct_days = self.db["gov_sites_status"].distinct(
        "bucketDay", {"checkedAt": {"$gte": start_of_period, "$lte": end_of_day}}
        )
        day_count = len(distinct_days)

        if day_count < required_days:
            print(f"  ⚠️ {period_name.capitalize()} 집계 생략 — 데이터 부족 ({day_count}일치, {required_days}일 이상 필요)")
            return

        # 기관별 집계
        pipeline = [
            {"$match": {"checkedAt": {"$gte": start_of_period, "$lte": end_of_day}}},
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
            print(f"  ⚠️ {period_name.capitalize()} 데이터 없음 (스킵)")
            return

        bulk_ops = []
        for r in results:
            bulk_ops.append(UpdateOne(
                {"agencyId": r["_id"], "periodType": period_name},
                {"$set": {
                    "agencyId": r["_id"],
                    "periodType": period_name,
                    "periodStart": start_of_period,
                    "periodEnd": end_of_day,
                    "stats": {
                        "total": r["total"],
                        "normal": r["normal"],
                        "maintenance": r["maintenance"],
                        "problem": r["problem"]
                    },
                    "updatedAt": now
                }},
                upsert=True
            ))

        self.db["gov_sites_summary"].bulk_write(bulk_ops)
        print(
            f"  ✅ {period_name.capitalize()} Summary 저장 완료:"
            f"     ({len(bulk_ops)}개 기관, {start_of_period.date()} ~ {end_of_day.date()})"
        )

    # --------------------------------------------------------------------------
    # 종합 실행
    # --------------------------------------------------------------------------
    def save_hourly_and_overall(self, results):
        self.save_hourly_status(results)
        self.save_overall_snapshot(results)
        print("💾 MongoDB 저장 프로세스 완료\n")


    def save_all_summaries(self):
        """
        일/주/월 요약 생성
        - daily: 항상 생성 시도
        - weekly: 7일 이상 데이터 누적 시 생성
        - monthly: 30일 이상 데이터 누적 시 생성
        """
        print("\n📊 Summary 집계 시작")
        self.aggregate_summary("daily", days=1, required_days=1)
        self.aggregate_summary("weekly", days=7, required_days=7)
        self.aggregate_summary("monthly", days=30, required_days=30)
        print("💾 Summary 집계 완료\n")
