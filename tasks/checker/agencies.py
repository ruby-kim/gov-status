import csv, uuid
from urllib.parse import urlparse
from checker.db import db

class AgencyManager:
    central_agencies = ['부', '청', '위원회', '처', '원', '감사원']
    local_agencies = ['시', '도', '구', '군', '특별시', '광역시', '특별자치시', '특별자치도']

    def __init__(self, csv_file='tasks/gov_sites.csv'):
        self.csv_file = csv_file

    def classify_agency(self, name: str):
        name = name.strip()
        for kw in self.central_agencies:
            if kw in name:
                return {"mainCategory": "중앙행정기관", "subCategory": self.get_sub_category(name)}
        for kw in self.local_agencies:
            if kw in name:
                return {"mainCategory": "지방자치단체", "subCategory": self.get_local_sub_category(name)}
        return {"mainCategory": "중앙행정기관", "subCategory": "기타"}

    def get_sub_category(self, name: str):
        if '부' in name and '위원회' not in name: return '부'
        elif '청' in name: return '청'
        elif '위원회' in name: return '위원회'
        elif '처' in name: return '처'
        return '기타'

    def get_local_sub_category(self, name: str):
        if '특별시' in name or '광역시' in name: return '광역시'
        elif '특별자치시' in name: return '특별자치시'
        elif '도' in name and '특별자치도' not in name: return '도'
        elif '특별자치도' in name: return '특별자치도'
        elif '구' in name: return '구'
        elif '군' in name: return '군'
        return '시'

    def generate_tags(self, name, url):
        tags = []
        if '부' in name: tags.append('부')
        elif '청' in name: tags.append('청')
        elif '위원회' in name: tags.append('위원회')
        elif '시' in name or '도' in name: tags.append('지방자치단체')

        domain = urlparse(url).netloc
        if '.go.kr' in domain: tags.append('정부도메인')
        elif '.ac.kr' in domain: tags.append('교육기관')
        elif '.re.kr' in domain: tags.append('연구기관')
        return tags if tags else ['공공기관']

    def load_from_csv(self):
        with open(self.csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            next(reader)
            for row in reader:
                if len(row) >= 2 and row[1].strip():
                    name, url = row[0].strip(), row[1].strip()

                    # 기존 기관 찾기: URL 또는 이름이 일치하면 같은 기관으로 간주
                    existing = db["agencies"].find_one({
                        "$or": [{"url": url}, {"name": name}]
                    })

                    if existing:
                        agency_id = existing["agencyId"]
                    else:
                        # 완전히 새로운 기관 -> 새로운 ID 부여
                        agency_id = str(uuid.uuid4())

                    agency_doc = {
                        "agencyId": agency_id,
                        "name": name,
                        "url": url,
                        **self.classify_agency(name),
                        "tags": self.generate_tags(name, url)
                    }

                    db["agencies"].update_one(
                        {"agencyId": agency_id},
                        {"$set": agency_doc},
                        upsert=True
                    )
        print("✅ agencies 컬렉션 업데이트 완료")
