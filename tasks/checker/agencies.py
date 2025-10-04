import csv
import uuid
from urllib.parse import urlparse
from config import NAMESPACE_AGENCY
from checker.db import db

class AgencyManager:
    """기관정보 CSV 자동 생성기"""

    CENTRAL = ['부', '청', '위원회', '처', '원', '감사원']
    LOCAL = ['시', '도', '구', '군', '특별시', '광역시', '특별자치시', '특별자치도']


    def __init__(self, csv_file='tasks/gov_sites.csv'):
        self.csv_file = csv_file
        self.db = db

    # ------------------------------------------------------------
    # 분류 및 태그 로직
    # ------------------------------------------------------------
    def classify_agency(self, name: str):
        """기관명 기반으로 중앙/지방 분류"""
        name = name.strip()
        for kw in self.CENTRAL:
            if kw in name:
                return ("중앙행정기관", self.get_sub_category(name))
        for kw in self.LOCAL:
            if kw in name:
                return ("지방자치단체", self.get_local_sub_category(name))
        return ("중앙행정기관", "기타")


    def get_sub_category(self, name: str):
        if '부' in name and '위원회' not in name: return '부'
        if '청' in name: return '청'
        if '위원회' in name: return '위원회'
        if '처' in name: return '처'
        return '기타'


    def get_local_sub_category(self, name: str):
        if '특별시' in name or '광역시' in name: return '광역시'
        if '특별자치시' in name: return '특별자치시'
        if '도' in name and '특별자치도' not in name: return '도'
        if '특별자치도' in name: return '특별자치도'
        if '구' in name: return '구'
        if '군' in name: return '군'
        return '시'


    def generate_tags(self, name: str, url: str):
        """기관명 + 도메인 기반 태그 자동 생성"""
        tags = []
        if '부' in name: tags.append('부')
        elif '청' in name: tags.append('청')
        elif '위원회' in name: tags.append('위원회')
        elif any(x in name for x in ['시', '도']): tags.append('지방자치단체')

        domain = urlparse(url).netloc
        if '.go.kr' in domain: tags.append('정부도메인')
        elif '.ac.kr' in domain: tags.append('교육기관')
        elif '.re.kr' in domain: tags.append('연구기관')

        return tags or ['공공기관']


    # ------------------------------------------------------------
    # CSV 자동 갱신
    # ------------------------------------------------------------
    def enrich_csv(self):
        """
        기존 CSV(tasks/gov_sites.csv)를 읽어
        id, mainCategory, subCategory, tags 컬럼을 자동 생성/갱신 후 저장
        """
        rows = []

        with open(self.csv_file, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames or []

            base_cols = ['id', 'agency', 'url', 'mainCategory', 'subCategory', 'tags']
            for col in base_cols:
                if col not in fieldnames:
                    fieldnames.append(col)

            for row in reader:
                name = row.get("agency", "").strip() or row.get("기관명", "").strip()
                url = row.get("url", "").strip() or row.get("URL", "").strip()
                if not name or not url:
                    continue

                # id
                agency_id = row.get("id") or str(uuid.uuid5(NAMESPACE_AGENCY, url.strip()))

                # 분류
                main_cat, sub_cat = self.classify_agency(name)

                # 태그
                if row.get("tags"):
                    tags = [t.strip() for t in row["tags"].split("|") if t.strip()]
                else:
                    tags = self.generate_tags(name, url)

                rows.append({
                    "id": agency_id,
                    "agency": name,
                    "url": url,
                    "mainCategory": main_cat,
                    "subCategory": sub_cat,
                    "tags": "|".join(tags)
                })

        with open(self.csv_file, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=['id', 'agency', 'url', 'mainCategory', 'subCategory', 'tags']
            )
            writer.writeheader()
            writer.writerows(rows)

        print(f"✅ {self.csv_file} 갱신 완료 (id + 분류 + 태그 추가됨)")


    def upload_gov_sites(self,csv_file="tasks/gov_sites.csv"):
        sites = []
        with open(csv_file, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tags = [t.strip() for t in row["tags"].split("|") if t.strip()]
                sites.append({
                    "siteId": row["id"],
                    "name": row["agency"],
                    "url": row["url"],
                    "mainCategory": row["mainCategory"],
                    "subCategory": row["subCategory"],
                    "tags": tags
                })

        self.db["gov_sites"].insert_many(sites)
        print(f"✅ {len(sites)}개 정부 사이트 업로드 완료 (컬렉션: gov_sites)")
