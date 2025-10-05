###
# main.py의 step2를 실행 후 사용할 것
###
from datetime import datetime, timedelta, timezone
from pymongo import UpdateOne
import random

from checker.db import db

KST = timezone(timedelta(hours=9))


class Storage:
    def __init__(self, db):
        self.db = db

    def aggregate_summary(self, period_name, days, required_days):
        """
        gov_sites_status 기반으로 기관별 집계 생성.
        한국시간 기준 0시~24시 단위로 정확히 구간화.
        - daily: 어제(0~24시)
        """
        now_kst = datetime.now(KST)

        # daily는 "어제" 데이터 기준으로
        if period_name == "daily":
            now_kst -= timedelta(days=1)

        end_of_day_kst = now_kst.replace(hour=23, minute=59, second=59, microsecond=999999)
        start_of_period_kst = (end_of_day_kst - timedelta(days=days - 1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        # UTC 변환
        start_utc = start_of_period_kst.astimezone(timezone.utc)
        end_utc = end_of_day_kst.astimezone(timezone.utc)
        now_utc = datetime.now(timezone.utc)

        # 데이터 존재 확인
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
        print(
            f"✅ {period_name.capitalize()} Summary 저장 완료 "
            f"({len(bulk_ops)}개 기관, {start_of_period_kst.date()} ~ {end_of_day_kst.date()})"
        )

    def save_all_summaries(self):
        print("\n📊 Summary 집계 시작 (KST 기준)")
        self.aggregate_summary("daily", days=1, required_days=1)
        self.aggregate_summary("weekly", days=7, required_days=7)
        self.aggregate_summary("monthly", days=30, required_days=30)
        print("💾 Summary 집계 완료\n")


# --------------------------------------------------------------------------
# 샘플 summary 데이터 생성 (랜덤)
# --------------------------------------------------------------------------
def generate_fake_summary_data():
    agency_ids = db["gov_sites_status"].distinct("agencyId")
    print(f"총 {len(agency_ids)}개 기관에서 summary 생성 예정")

    now_kst = datetime.now(KST)
    now_utc = now_kst.astimezone(timezone.utc)

    # === UTC 기준 기간 설정 (KST 기준 변환 포함) ===
    periods = {
        "today": (
            (now_kst.replace(hour=0, minute=0, second=0, microsecond=0)).astimezone(timezone.utc),
            (now_kst.replace(hour=23, minute=59, second=59, microsecond=999999)).astimezone(timezone.utc)
        ),
        "daily": (  # 하루 전 (KST 기준 어제)
            (now_kst - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc),
            (now_kst - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999).astimezone(timezone.utc)
        ),
        "weekly": (
            (now_kst - timedelta(days=7)).astimezone(timezone.utc),
            now_utc
        ),
        "monthly": (
            (now_kst - timedelta(days=30)).astimezone(timezone.utc),
            now_utc
        )
    }

    bulk_ops = []
    for agency_id in agency_ids:
        for period_name, (start, end) in periods.items():
            total = random.randint(80, 300)
            normal = random.randint(int(total * 0.8), total)
            maintenance = random.randint(0, total - normal)
            problem = max(0, total - normal - maintenance)

            doc = {
                "agencyId": agency_id,
                "periodType": period_name,
                "periodStart": start,
                "periodEnd": end,
                "stats": {
                    "total": total,
                    "normal": normal,
                    "maintenance": maintenance,
                    "problem": problem
                },
                "updatedAt": now_utc
            }

            bulk_ops.append(UpdateOne(
                {"agencyId": agency_id, "periodType": period_name},
                {"$set": doc},
                upsert=True
            ))

    if bulk_ops:
        db["gov_sites_summary"].bulk_write(bulk_ops)
        print(f"✅ 샘플 summary {len(bulk_ops)}개 문서 생성 완료!")
    else:
        print("⚠️ 생성할 데이터 없음")

    print("\n📊 샘플 데이터 생성 완료 — 이제 API에서 어제/주간/월간 테스트 가능!\n")


# --------------------------------------------------------------------------
# 실행
# --------------------------------------------------------------------------
if __name__ == "__main__":
    print("🚀 샘플 요약 데이터 생성 시작...")
    generate_fake_summary_data()

    print("\n🧮 실제 집계 로직 실행 중...")
    storage = Storage(db)
    storage.save_all_summaries()
