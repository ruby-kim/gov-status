"""
csv 파일 기반 각 기관별 상태 확인
"""

import asyncio
import aiohttp
import async_timeout
import csv
import time
from config import USER_AGENT, TIMEOUT_MS, MAX_CONCURRENCY


class StatusChecker:
    def __init__(self, db=None, maintenance_keywords=None):
        self.db = db
        self.results = []
        self.maintenance_keywords = maintenance_keywords or [
            "점검", "일시중단", "서비스중단", "maintenance", "개선작업"
        ]
        self.agencies= []


    # --------------------------------------------------------------------------
    # 사이트 조사
    # --------------------------------------------------------------------------
    async def check_site_status(self, session, semaphore, agency):
        async with semaphore:
            url = agency["url"]
            agency_id = agency["agencyId"]

            for attempt in range(2):
                start_time = time.monotonic()
                try:
                    async with async_timeout.timeout(TIMEOUT_MS / 1000):
                        async with session.get(
                            url,
                            ssl=False,
                            allow_redirects=True
                        ) as response:
                            text = await response.text(errors="ignore")
                            response_time = int((time.monotonic() - start_time) * 1000)

                            status, reason = self._determine_status(response, text, response_time)
                            return {
                                "agencyId": agency_id,
                                "url": url,
                                "status": status,
                                "responseTime": response_time,
                                "reason": reason,
                            }

                except Exception as e:
                    if attempt == 1:
                        return {
                            "agencyId": agency_id,
                            "url": url,
                            "status": "problem",
                            "responseTime": TIMEOUT_MS,
                            "reason": f"예외 발생: {type(e).__name__} - {e}"
                        }
                    await asyncio.sleep(0.2)


    # --------------------------------------------------------------------------
    # 상태 판별 + 사유 반환
    # --------------------------------------------------------------------------
    def _determine_status(self, response, text, response_time):
        """응답 상태 및 사유 반환"""
        if response.status == 200:
            if response_time >= TIMEOUT_MS:
                return "problem", f"응답시간 초과 ({response_time}ms ≥ {TIMEOUT_MS}ms)"
            # 본문 점검 키워드 탐지
            for kw in self.maintenance_keywords:
                if kw.lower() in text.lower():
                    return "maintenance", f"본문 내 '{kw}' 키워드 발견"
            return "normal", "정상 응답"

        elif response.status == 503:
            return "maintenance", "HTTP 503 (서비스 점검 중)"
        elif response.status in (404, 403):
            return "problem", f"HTTP {response.status} (접근 불가 또는 존재하지 않음)"
        elif 500 <= response.status < 600:
            return "problem", f"서버 오류 코드 {response.status}"
        else:
            return "problem", f"기타 HTTP 상태 코드 {response.status}"


    # --------------------------------------------------------------------------
    # CSV 로드
    # --------------------------------------------------------------------------
    def load_agencies_from_csv(self, csv_file):
        agencies = []
        with open(csv_file, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("id") and row.get("url"):
                    agencies.append({
                        "agencyId": row["id"],
                        "name": row.get("agency", "").strip(),
                        "url": row["url"].strip(),
                        "mainCategory": row.get("mainCategory", "").strip(),
                        "subCategory": row.get("subCategory", "").strip(),
                        "tags": [t.strip() for t in row.get("tags", "").split("|") if t.strip()]
                    })
                else:
                    print("이거좀봐봐", row)
        return agencies


    # --------------------------------------------------------------------------
    # 전체 검사 실행
    # --------------------------------------------------------------------------
    async def check_all_sites_from_csv(self, csv_file: str, concurrency=MAX_CONCURRENCY):
        self.agencies = self.load_agencies_from_csv(csv_file)
        total_sites = len(self.agencies)
        print(f"🚀 총 {total_sites}개 사이트 검사 시작 (동시 {concurrency}개)\n")

        connector = aiohttp.TCPConnector(limit=concurrency, ssl=False)
        timeout = aiohttp.ClientTimeout(total=TIMEOUT_MS / 1000)

        async with aiohttp.ClientSession(
            connector=connector,
            headers={"User-Agent": USER_AGENT},
            timeout=timeout
        ) as session:
            semaphore = asyncio.Semaphore(concurrency)
            tasks = [self.check_site_status(session, semaphore, agency) for agency in self.agencies]
            for coro in asyncio.as_completed(tasks):
                result = await coro
                if result:
                    self.results.append(result)

        self._print_summary()
        return self.results


    # --------------------------------------------------------------------------
    # 결과 요약
    # --------------------------------------------------------------------------
    def _print_summary(self):
        total = len(self.results)
        if total == 0:
            print("⚠️ 결과가 없습니다.")
            return

        normal = sorted(
            [r for r in self.results if r["status"] == "normal"],
            key=lambda x: x["responseTime"]
        )
        maintenance = sorted(
            [r for r in self.results if r["status"] == "maintenance"],
            key=lambda x: x["responseTime"]
        )
        problem = sorted(
            [r for r in self.results if r["status"] == "problem"],
            key=lambda x: x["responseTime"]
        )

        def pct(n): return f"{(n / total * 100):.1f}%" if total > 0 else "0%"

        print("\n📊 검사 결과 요약")
        print(f"총 검사 사이트 수: {total}")

        # ✅ Normal
        print(f"\n✅ Normal 상태: {len(normal)}곳 ({pct(len(normal))})")

        # ⚠️ Maintenance
        if maintenance:
            print(f"\n⚠️ Maintenance 상태: {len(maintenance)}곳 ({pct(len(maintenance))})")
            for site in maintenance[:20]:
                print(f"   - {site['url']} (응답시간: {site['responseTime']}ms) -> {site.get('reason','')}")

        # ❌ Problem
        if problem:
            print(f"\n❌ Problem 상태: {len(problem)}곳 ({pct(len(problem))})")
            for site in problem[:20]:
                print(f"   - {site['url']} (응답시간: {site['responseTime']}ms) -> {site.get('reason','')}")
