import csv
import json
import aiohttp
import asyncio
import time
from urllib.parse import urlparse
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any
import os
import redis
from collections import defaultdict
import uuid

TIMEOUT_THRESHOLD= 30000

class GovSiteStatusCheckerAsync:
    def __init__(self, csv_file: str = 'tasks/gov_sites.csv'):
        self.csv_file = csv_file
        self.results: List[Dict[str, Any]] = []

        # 기관 카테고리 분류용 키워드
        self.central_agencies = ['부', '청', '위원회', '처', '원', '감사원']
        self.local_agencies = ['시', '도', '구', '군', '특별시', '광역시', '특별자치시', '특별자치도']

        # Redis 연결
        redis_url = os.getenv("REDIS_URL")
        if not redis_url:
            raise ValueError("❌ REDIS_URL 환경 변수가 필요합니다.")
        self.redis = redis.from_url(redis_url)

        # 점검 페이지 키워드
        self.maintenance_keywords = ["점검", "일시중단", "서비스중단", "maintenance"]

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

    async def check_site_status(self, session: aiohttp.ClientSession, semaphore: asyncio.Semaphore, agency_name: str, url: str) -> Dict[str, Any]:
        async with semaphore:
            start_time = time.monotonic()
            try:
                async with session.get(url, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=10)) as response:
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
            except Exception as e:
                print(f"❌ {agency_name} 요청 실패: {e}")
                status = 'problem'
                response_time = TIMEOUT_THRESHOLD

            # URL 기반으로 고정 ID 생성 (이름이 바뀌어도 유지됨)
            agency_id = str(uuid.uuid5(uuid.NAMESPACE_URL, url))

            result = {
                'id': str(uuid.uuid4())[:8],  # 요청 실행 고유 ID (로그용)
                'name': agency_name,
                'url': url,
                'status': status,
                'description': f'{agency_name} 공식 홈페이지',
                'agency': {
                    "id": agency_id,
                    "name": agency_name,
                    "url": url,
                    **self.classify_agency(agency_name)
                },
                'lastChecked': datetime.now(timezone.utc).isoformat(),
                'responseTime': response_time,
                'tags': self.generate_tags(agency_name, url)
            }

            print(f"{agency_name} [{url}] → {status} ({response_time}ms)")
            return result

    def load_csv_data(self) -> List[List[str]]:
        data = []
        with open(self.csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if len(row) >= 2 and row[1].strip():
                    data.append(row)
        return data

    async def check_all_sites(self, concurrency: int = 30, batch_size: int = 100):
        data = self.load_csv_data()
        semaphore = asyncio.Semaphore(concurrency)

        async with aiohttp.ClientSession(headers={'User-Agent': 'GovStatusBot/1.0'}) as session:
            tasks = [self.check_site_status(session, semaphore, row[0], row[1]) for row in data]

            batch = []
            for coro in asyncio.as_completed(tasks):
                try:
                    result = await coro
                    if result:
                        self.results.append(result)
                        batch.append(result)

                    # 배치 단위 Redis 저장
                    if len(batch) >= batch_size:
                        self.save_partial_to_redis(batch)
                        batch = []
                except Exception as e:
                    print(f"❌ 사이트 확인 실패: {e}")

            # 남은 배치 저장
            if batch:
                self.save_partial_to_redis(batch)

    def save_partial_to_redis(self, batch_results: List[Dict[str, Any]]):
        """배치 단위로 Redis에 누적 저장"""
        pipe = self.redis.pipeline()
        for r in batch_results:
            pipe.rpush("services:stream", json.dumps(r, ensure_ascii=False))  # 스트림처럼 저장
        pipe.execute()
        print(f"📥 Redis에 {len(batch_results)}개 저장 완료")

    def build_stats(self):
        overall = {"total": 0, "normal": 0, "maintenance": 0, "problem": 0}
        per_agency = {}

        for s in self.results:
            aid = s["agency"]["id"]
            if aid not in per_agency:
                per_agency[aid] = {
                    "id": aid,
                    "name": s["agency"]["name"],
                    "url": s["agency"]["url"],
                    "stats": {"total": 0, "normal": 0, "maintenance": 0, "problem": 0}
                }

            st = s["status"]
            per_agency[aid]["stats"]["total"] += 1
            per_agency[aid]["stats"][st] += 1
            overall["total"] += 1
            overall[st] += 1

        return {"timestamp": datetime.now(timezone.utc).isoformat(), "overall": overall, "perAgency": per_agency}

    def save_summary_to_redis(self):
        """최종 통계만 저장"""
        stats = self.build_stats()
        pipe = self.redis.pipeline()
        pipe.set("services:latest", json.dumps(self.results, ensure_ascii=False))
        pipe.set("stats:latest", json.dumps(stats, ensure_ascii=False))
        pipe.zadd("stats:history", {json.dumps(stats, ensure_ascii=False): datetime.now(timezone.utc).timestamp()})
        cutoff = datetime.now(timezone.utc) - timedelta(days=90)
        pipe.zremrangebyscore("stats:history", 0, cutoff.timestamp())
        pipe.execute()
        print("✅ Redis 최종 요약 업데이트 완료")


async def main():
    checker = GovSiteStatusCheckerAsync()
    await checker.check_all_sites(concurrency=30, batch_size=100)
    checker.save_summary_to_redis()


if __name__ == "__main__":
    asyncio.run(main())
