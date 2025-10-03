from datetime import datetime, timezone
from checker.stats import StatsBuilder

class Storage:
    def __init__(self, db):
        self.db = db

    def save_hourly_and_overall(self, results):
        now = datetime.now(timezone.utc)
        bucket_time = now.replace(minute=0, second=0, microsecond=0)

        # 1. hourly_stats
        for r in results:
            inc = {"stats.total": 1, "stats.normal": 0, "stats.maintenance": 0, "stats.problem": 0}
            inc[f"stats.{r['status']}"] = 1

            self.db["hourly_stats"].update_one(
                {"agencyId": r["agencyId"], "timestampHour": bucket_time},
                {"$setOnInsert": {"agencyId": r["agencyId"], "timestampHour": bucket_time}, "$inc": inc},
                upsert=True
            )

        # 2. overall_stats
        stats = StatsBuilder.build(results)
        agencies_snapshot = [{"agencyId": r["agencyId"], "status": r["status"], "responseTime": r.get("responseTime")} for r in results]

        snapshot_doc = {"timestamp": now, "overall": stats["overall"], "agencies": agencies_snapshot}
        self.db["overall_stats"].replace_one({}, snapshot_doc, upsert=True)

        print(f"✅ MongoDB 저장 완료 (hourly={bucket_time}, snapshot={now})")
