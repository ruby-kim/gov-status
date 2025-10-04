import asyncio
import sys
from checker.db import db
from checker.agencies import AgencyManager
from checker.status_checker import StatusChecker
from checker.storage import Storage
from crawler.gov_crawler import GovCrawler
import time


class Timer:
    def __enter__(self):
        self.start_time = time.monotonic()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        elapsed = time.monotonic() - self.start_time
        minutes = int(elapsed // 60)
        seconds = int(elapsed % 60)
        print(f"\n⏱ 총 프로그램 소요시간: {minutes}분 {seconds}초 ({elapsed:.2f}초)\n")


async def main():
    CSV_FILE = "tasks/gov_sites.csv"
    args = sys.argv[1:]  # ex) ["--summary"] or ["--full"]

    with Timer():
        # --- Step 1: (선택) 기관 목록 크롤링 초기화: csv파일이 있다면 무시해도 됨 ---
        # crawler = GovCrawler()
        # crawler.crawl_all()
        # crawler.save_to_csv(CSV_FILE)

        # --- Step 2: (선택) DB 업데이트: MongoDB에 데이터 없을 시 사용 ---
        # agency_mgr = AgencyManager(csv_file=CSV_FILE)
        # agency_mgr.upload_gov_sites()

        # --- Step 3: 상태 점검 ---
        checker = StatusChecker(db)
        await checker.check_all_sites_from_csv(CSV_FILE)

        # --- Step 4: 데이터 저장 ---
        storage = Storage(db)
        storage.save_hourly_and_overall(checker.results)

        # --- Step 5: Summary 조건부 실행 ---
        if "--summary" in args or "--full" in args:
            storage.save_all_summaries()


if __name__ == "__main__":
    asyncio.run(main())
