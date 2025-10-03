import asyncio
from checker.db import db
from checker.agencies import AgencyManager
from checker.status_checker import StatusChecker
from checker.storage import Storage
from crawler.gov_crawler import GovCrawler

async def main():
    CSV_FILE = "tasks/gov_sites.csv"
    # # Step 1. 기관 목록 크롤링 (gov_sites.csv 생성): 초반 csv파일이 없거나 GovCrawler 클래스 수정 시 사용
    # crawler = GovCrawler()
    # crawler.crawl_all()
    # crawler.save_to_csv(CSV_FILE)
    
    # # Step 2. CSV 기반 DB 업데이트: DB에 데이터가 없거나 GovCrawler 클래스 수정 시 사용
    # agency_mgr = AgencyManager(csv_file=CSV_FILE)
    # agency_mgr.load_from_csv()
    
    # Step 3. 기관 상태 확인
    checker = StatusChecker(db)
    await checker.check_all_sites_from_csv(CSV_FILE)
    
    # Step 4. 결과 저장
    storage = Storage(db)
    storage.save_hourly_and_overall(checker.results)

if __name__ == "__main__":
    asyncio.run(main())
