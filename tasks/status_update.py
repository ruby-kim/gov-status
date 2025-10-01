import csv
import aiohttp
import asyncio
import time
import uuid
import os
from urllib.parse import urlparse
from datetime import datetime, timezone
from typing import Dict, List, Any
from pymongo import MongoClient

TIMEOUT_THRESHOLD = 30000  # 30초

class GovSiteStatusCheckerAsync:
    def __init__(self, csv_file: str = 'tasks/gov_sites.csv'):
        self.csv_file = csv_file
        self.results: List[Dict[str, Any]] = []

        # MongoDB 연결
        mongo_uri = os.getenv("MONGODB_URI", "YOUR_MONGODB_URI")
        mongo_db = os.getenv("MONGODB_DATABASE", "YOUR_DATABASE")
        client = MongoClient(mongo_uri)
        self.db = client[mongo_db]

        # 카테고리 키워드
        self.central_agencies = ['부', '청', '위원회', '처', '원', '감사원']
        self.local_agencies = ['시', '도', '구', '군', '특별시', '광역시', '특별자치시', '특별자치도']
        self.maintenance_keywords = ["점검", "일시중단", "서비스중단", "maintenance"]

    # ---------------------------
    # 기관 메타데이터 관리
    # ---------------------------
    def classify_agency(self, agency_name: str) -> Dict[str, str]:
        agency_name = agency_name.strip()
        for keyword in self.central_agencies:
            if keyword in agency_name:
                return {"mainCategory": "중앙행정기관", "subCategory": self.get_sub_category(agency_name)}
        for keyword in self.local_agencies:
            if keyword in agency_name:
                return {"mainCategory": "지방자치단체", "subCategory": self.get_local_sub_category(agency_name)}
        return {"mainCategory": "중앙행정기관", "subCategory": "기타"}

    def get_sub_category(self, agency_name: str) -> str:
        if '부' in agency_name and '위원회' not in agency_name: return '부'
        elif '청' in agency_name: return '청'
        elif '위원회' in agency_name: return '위원회'
        elif '처' in agency_name: return '처'
        else: return '기타'

    def get_local_sub_category(self, agency_name: str) -> str:
        if '특별시' in agency_name or '광역시' in agency_name: return '광역시'
        elif '특별자치시' in agency_name: return '특별자치시'
        elif '도' in agency_name and '특별자치도' not in agency_name: return '도'
        elif '특별자치도' in agency_name: return '특별자치도'
        elif '구' in agency_name: return '구'
        elif '군' in agency_name: return '군'
        else: return '시'

    def generate_tags(self, agency_name: str, url: str) -> List[str]:
        tags = []
        if '부' in agency_name: tags.append('부')
        elif '청' in agency_name: tags.append('청')
        elif '위원회' in agency_name: tags.append('위원회')
        elif '시' in agency_name or '도' in agency_name: tags.append('지방자치단체')

        domain = urlparse(url).netloc
        if '.go.kr' in domain: tags.append('정부도메인')
        elif '.ac.kr' in domain: tags.append('교육기관')
        elif '.re.kr' in domain: tags.append('연구기관')
        return tags if tags else ['공공기관']

    def load_agencies_from_csv(self):
        """CSV 기반으로 agencies 컬렉션 업데이트"""
        with open(self.csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if len(row) >= 2 and row[1].strip():
                    name, url = row[0].strip(), row[1].strip()
                    agency_id = str(uuid.uuid5(uuid.NAMESPACE_URL, url))
                    agency_doc = {
                        "agencyId": agency_id,
                        "name": name,
                        "url": url,
                        **self.classify_agency(name),
                        "tags": self.generate_tags(name, url)
                    }
                    self.db["agencies"].update_one(
                        {"agencyId": agency_id},
                        {"$set": agency_doc},
                        upsert=True
                    )
        print("✅ agencies 컬렉션 업데이트 완료")

    # ---------------------------
    # 사이트 상태 체크
    # ---------------------------
    async def check_site_status(self, session, semaphore, agency_id, url):
        async with semaphore:
            start_time = time.monotonic()
            try:
                async with session.get(
                        url, allow_redirects=True, timeout=aiohttp.ClientTimeout(
                            total=TIMEOUT_THRESHOLD/1000)) as response:
                    raw = await response.read()
                    text = raw.decode(errors="ignore")
                    response_time = int((time.monotonic() - start_time) * 1000)

                    if response.status == 200:
                        status = 'normal' if response_time < TIMEOUT_THRESHOLD else 'problem'
                    elif response.status == 503:
                        status = 'maintenance'
                    else:
                        status = 'problem'

                    if status == 'normal':
                        for kw in self.maintenance_keywords:
                            if kw.lower() in text.lower():
                                status = 'maintenance'
                                break
                    print(f"✅ 요청 성공: {url} → {status}")
            except Exception as e:
                print(f"❌ 요청 실패: {url} → {e if e else 'Timeout'}")
                status = 'problem'
                response_time = TIMEOUT_THRESHOLD

            return {
                "agencyId": agency_id,
                "status": status,
                "responseTime": response_time
            }

    async def check_all_sites(self, concurrency=30):
        agencies = list(self.db["agencies"].find({}, {"agencyId": 1, "url": 1}))
        semaphore = asyncio.Semaphore(concurrency)

        async with aiohttp.ClientSession(headers={'User-Agent': 'GovStatusBot/1.0'}) as session:
            tasks = [self.check_site_status(session, semaphore, a["agencyId"], a["url"]) for a in agencies]
            for coro in asyncio.as_completed(tasks):
                result = await coro
                if result:
                    self.results.append(result)

    # ---------------------------
    # 집계 로직
    # ---------------------------
    def build_stats(self):
        overall = {"total": 0, "normal": 0, "maintenance": 0, "problem": 0}
        per_agency = {}

        for r in self.results:
            aid = r["agencyId"]
            if aid not in per_agency:
                per_agency[aid] = {"total": 0, "normal": 0, "maintenance": 0, "problem": 0}

            st = r["status"]
            per_agency[aid][st] += 1
            per_agency[aid]["total"] += 1

            overall[st] += 1
            overall["total"] += 1

        return {"overall": overall, "perAgency": per_agency}

    # ---------------------------
    # 저장 로직
    # ---------------------------
    def save_hourly_and_overall(self):
        now = datetime.now(timezone.utc)
        bucket_time = now.replace(minute=0, second=0, microsecond=0)

        # === 1. hourly_stats (기관별 정각 버킷에 누적) ===
        for r in self.results:
            status = r["status"]
            agency_id = r["agencyId"]

            inc = {
                "stats.total": 1,
                "stats.normal": 0,
                "stats.maintenance": 0,
                "stats.problem": 0
            }
            inc[f"stats.{status}"] = 1

            self.db["hourly_stats"].update_one(
                {"agencyId": agency_id, "timestampHour": bucket_time},
                {
                    "$setOnInsert": {
                        "agencyId": agency_id,
                        "timestampHour": bucket_time
                    },
                    "$inc": inc
                },
                upsert=True
            )

        # === 2. overall_stats (현재 전체 상황 스냅샷) ===
        stats = self.build_stats()

        # 기관별 리스트 (agencyId + status + responseTime)
        agencies_snapshot = [
            {
                "agencyId": r["agencyId"],
                "status": r["status"],
                "responseTime": r.get("responseTime", None)  # 없으면 None
            }
            for r in self.results
        ]

        snapshot_doc = {
            "timestamp": now,
            "overall": stats["overall"],       # 전체 합계
            "agencies": agencies_snapshot      # 각 기관의 최신 상태 + 속도
        }

        # 항상 최신 1개 유지
        self.db["overall_stats"].replace_one({}, snapshot_doc, upsert=True)

        print(f"✅ MongoDB 저장 완료 (hourly={bucket_time}, snapshot={now})")


# ---------------------------
# 실행
# ---------------------------
async def main():
    checker = GovSiteStatusCheckerAsync()
    # checker.load_agencies_from_csv()   # CSV → agencies 업데이트 (최초 1회)
    await checker.check_all_sites()
    checker.save_hourly_and_overall()

if __name__ == "__main__":
    asyncio.run(main())
