from pymongo import UpdateOne
from db.connection import db

def sync_gov_sites(sites):
    """CSV 기준으로 정부기관 DB 동기화"""
    if not sites:
        print("⚠️ 업로드할 사이트가 없습니다.")
        return

    # 현재 DB에 있는 agencyId 목록 가져오기
    existing_ids = set(
        s["agencyId"] for s in db["gov_sites"].find({}, {"agencyId": 1})
    )

    # CSV 기준 agencyId 목록
    csv_ids = set(s["agencyId"] for s in sites)

    # CSV에 없는 것들 삭제
    to_delete = existing_ids - csv_ids
    if to_delete:
        delete_result = db["gov_sites"].delete_many({"agencyId": {"$in": list(to_delete)}})
        print(f"🗑️ {delete_result.deleted_count}개 항목 삭제됨 (CSV 기준으로 존재하지 않음)")

    # CSV 기준으로 upsert
    ops = [
        UpdateOne({"agencyId": s["agencyId"]}, {"$set": s}, upsert=True)
        for s in sites
    ]
    result = db["gov_sites"].bulk_write(ops)
    print(f"🔄 동기화 완료 (갱신: {result.modified_count}, 신규: {result.upserted_count})")
