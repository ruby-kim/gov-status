import asyncio
import aiohttp, time
from aiohttp import ClientConnectorCertificateError
import csv
import uuid
from ssl import SSLCertVerificationError
from config import TIMEOUT_THRESHOLD, USER_AGENT

class StatusChecker:
    def __init__(self, db, maintenance_keywords=None):
        self.db = db
        self.results = []
        self.maintenance_keywords = maintenance_keywords or ["점검", "일시중단", "서비스중단", "maintenance"]

    async def check_site_status(self, session, semaphore, agency_id, url):
        async with semaphore:
            start_time = time.monotonic()
            try:
                async with session.get(
                        url, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=TIMEOUT_THRESHOLD/1000)
                ) as response:
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
            except (ClientConnectorCertificateError, SSLCertVerificationError):
                try:
                    async with session.get(url, allow_redirects=True,
                                           timeout=aiohttp.ClientTimeout(total=TIMEOUT_THRESHOLD/1000),
                                           ssl=False) as response:
                        response_time = int((time.monotonic() - start_time) * 1000)
                        status = 'normal' if response.status == 200 else 'problem'
                        print(f"🔁 insecure retry 성공: {url} → {status}")
                except Exception as e2:
                    print(f"❌ 요청 실패: {url} → {e2}")
                    status = 'problem'
                    response_time = TIMEOUT_THRESHOLD
            except Exception as e:
                print(f"❌ 요청 실패: {url} → {e if e else 'Timeout'}")
                status = 'problem'
                response_time = TIMEOUT_THRESHOLD

            return {"agencyId": agency_id, "status": status, "responseTime": response_time}


    async def check_all_sites_from_csv(self, csv_file: str, concurrency=30):
        agencies = []
        with open(csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            next(reader)  # 헤더 스킵
            for row in reader:
                if len(row) >= 2 and row[1].strip():
                    name, url = row[0].strip(), row[1].strip()
                    agency_id = str(uuid.uuid5(uuid.NAMESPACE_URL, url))
                    agencies.append({"agencyId": agency_id, "name": name, "url": url})

        semaphore = asyncio.Semaphore(concurrency)
        async with aiohttp.ClientSession(headers={'User-Agent': 'GovStatusBot/1.0'}) as session:
            tasks = [self.check_site_status(session, semaphore, a["agencyId"], a["url"]) for a in agencies]
            for coro in asyncio.as_completed(tasks):
                result = await coro
                if result:
                    self.results.append(result)
