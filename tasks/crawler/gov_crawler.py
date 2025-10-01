#!/usr/bin/env python3
"""
정부기관 홈페이지 URL 크롤러 (정리된 버전)
===============================================

간단하고 효율적인 정부기관 홈페이지 URL 수집기
- 중앙행정기관, 지방자치단체, 공공기관 URL 수집
- 중복 제거 및 CSV 저장
- 에러 핸들링 및 서버 부하 방지
"""

import requests
from bs4 import BeautifulSoup
import csv
import re
from urllib.parse import urljoin, urlparse
import time
from typing import Set, List, Tuple

class GovCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.org_data = []  # (기관명, URL) 튜플 저장
        
        # 주요 정부기관 목록
        self.known_orgs = {
            # 중앙행정기관
            '기획재정부': 'https://www.moef.go.kr',
            '교육부': 'https://www.moe.go.kr',
            '과학기술정보통신부': 'https://www.msit.go.kr',
            '외교부': 'https://www.mofa.go.kr',
            '통일부': 'https://www.unikorea.go.kr',
            '법무부': 'https://www.moj.go.kr',
            '국방부': 'https://www.mnd.go.kr',
            '행정안전부': 'https://www.mois.go.kr',
            '문화체육관광부': 'https://www.mcst.go.kr',
            '농림축산식품부': 'https://www.mafra.go.kr',
            '산업통상자원부': 'https://www.motie.go.kr',
            '보건복지부': 'https://www.mohw.go.kr',
            '환경부': 'https://www.me.go.kr',
            '고용노동부': 'https://www.moel.go.kr',
            '여성가족부': 'https://www.mogef.go.kr',
            '국토교통부': 'https://www.molit.go.kr',
            '해양수산부': 'https://www.mof.go.kr',
            '중소벤처기업부': 'https://www.mss.go.kr',
            
            # 청과 위원회
            '국세청': 'https://www.nts.go.kr',
            '관세청': 'https://www.customs.go.kr',
            '조달청': 'https://www.pps.go.kr',
            '통계청': 'https://www.kostat.go.kr',
            '검찰청': 'https://www.spo.go.kr',
            '병무청': 'https://www.mma.go.kr',
            '경찰청': 'https://www.police.go.kr',
            '해양경찰청': 'https://www.koast.go.kr',
            '기상청': 'https://www.kma.go.kr',
            '농촌진흥청': 'https://www.rda.go.kr',
            '산림청': 'https://www.forest.go.kr',
            '특허청': 'https://www.kipo.go.kr',
            '식품의약품안전처': 'https://www.mfds.go.kr',
            '소방청': 'https://www.nfa.go.kr',
            '질병관리청': 'https://www.kdca.go.kr',
            '인사혁신처': 'https://www.ipa.go.kr',
            
            # 지방자치단체
            '서울특별시': 'https://www.seoul.go.kr',
            '부산광역시': 'https://www.busan.go.kr',
            '대구광역시': 'https://www.daegu.go.kr',
            '인천광역시': 'https://www.incheon.go.kr',
            '광주광역시': 'https://www.gwangju.go.kr',
            '대전광역시': 'https://www.daejeon.go.kr',
            '울산광역시': 'https://www.ulsan.go.kr',
            '세종특별자치시': 'https://www.sejong.go.kr',
            '경기도': 'https://www.gg.go.kr',
            '강원특별자치도': 'https://www.gangwon.go.kr',
            '충청북도': 'https://www.chungbuk.go.kr',
            '충청남도': 'https://www.chungnam.go.kr',
            '전북특별자치도': 'https://www.jeonbuk.go.kr',
            '전라남도': 'https://www.jeonnam.go.kr',
            '경상북도': 'https://www.gb.go.kr',
            '경상남도': 'https://www.gyeongnam.go.kr',
            '제주특별자치도': 'https://www.jeju.go.kr',
        }
    
    def is_gov_domain(self, url: str) -> bool:
        """정부 도메인인지 확인"""
        if not url:
            return False
            
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            # gov.kr 내부 링크 제외
            if 'gov.kr' in domain:
                return False
                
            # 정부 도메인 패턴
            gov_patterns = [
                r'\.go\.kr$',      # .go.kr
                r'\.gov\.kr$',     # .gov.kr (외부)
                r'\.or\.kr$',      # 공공기관
                r'\.re\.kr$',      # 연구기관
                r'\.ac\.kr$',      # 국립대학교
            ]
            
            return any(re.search(pattern, domain) for pattern in gov_patterns)
            
        except Exception:
            return False
    
    def is_valid_site(self, url: str, text: str = "") -> bool:
        """유효한 기관 사이트인지 확인"""
        if not url:
            return False
            
        # 제외할 URL 패턴
        exclude_patterns = [
            r'/bbs/', r'/board/', r'/event/', r'/contest/', r'/gongmo/',
            r'/privacy', r'/policy', r'/notice/', r'/news/', r'/content/',
            r'#', r'\.pdf$', r'\.xlsx$', r'\.doc$', r'\.zip$'
        ]
        
        # 제외할 텍스트 키워드
        exclude_keywords = [
            '공모전', '이벤트', '대회', '개인정보처리방침', '공지사항',
            '보도자료', '뉴스', '게시판', '자료실', '다운로드',
            '로그인', '회원가입', '바로가기', '웹접근성', '배너'
        ]
        
        # URL 패턴 체크
        if any(re.search(pattern, url, re.IGNORECASE) for pattern in exclude_patterns):
            return False
        
        # 텍스트 키워드 체크
        text_lower = text.lower()
        if any(keyword in text_lower for keyword in exclude_keywords):
            return False
        
        return True
    
    def extract_org_name(self, url: str, text: str = "") -> str:
        """기관명 추출"""
        if text and len(text) < 50:
            return text
            
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            if '.go.kr' in domain:
                parts = domain.split('.')
                return parts[-3] if parts[-3] != 'www' else parts[-2]
            elif '.gov.kr' in domain:
                parts = domain.split('.')
                return parts[-3] if parts[-3] != 'www' else parts[-2]
            elif '.or.kr' in domain:
                parts = domain.split('.')
                return parts[-3] if parts[-3] != 'www' else parts[-2]
            elif '.re.kr' in domain:
                parts = domain.split('.')
                return parts[-3] if parts[-3] != 'www' else parts[-2]
            elif '.ac.kr' in domain:
                parts = domain.split('.')
                return parts[-3] if parts[-3] != 'www' else parts[-2]
                
            return "기관명 미확인"
            
        except Exception:
            return "기관명 미확인"
    
    def crawl_page(self, url: str) -> None:
        """단일 페이지 크롤링"""
        try:
            print(f"크롤링 중: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 기관 목록 링크 찾기
            for link in soup.find_all('a', href=True):
                href = link['href'].strip()
                text = link.get_text(strip=True)
                full_url = urljoin(url, href)
                
                # 정부 도메인이면서 유효한 사이트인지 확인
                if (self.is_gov_domain(full_url) and 
                    self.is_valid_site(full_url, text)):
                    
                    # 중복 체크
                    existing_urls = [url for _, url in self.org_data]
                    if full_url not in existing_urls:
                        org_name = self.extract_org_name(full_url, text)
                        self.org_data.append((org_name, full_url))
                        print(f"  발견: {org_name} - {full_url}")
            
            time.sleep(1)  # 서버 부하 방지
            
        except requests.RequestException as e:
            print(f"페이지 요청 실패 ({url}): {e}")
        except Exception as e:
            print(f"페이지 파싱 실패 ({url}): {e}")
    
    def crawl_all(self) -> None:
        """전체 크롤링 실행"""
        # 1. 알려진 기관들 추가
        print("알려진 정부 기관들 추가 중...")
        for org_name, url in self.known_orgs.items():
            self.org_data.append((org_name, url))
            print(f"추가: {org_name} - {url}")
        
        # 2. 정부 포털에서 기관 목록 크롤링
        target_urls = [
            'https://www.gov.kr/portal/orgInfo',
            'https://www.gov.kr/portal/orgInfo/orgmapr'
        ]
        
        for url in target_urls:
            self.crawl_page(url)
    
    def save_to_csv(self, filename: str = 'gov_sites.csv') -> None:
        """결과를 CSV 파일로 저장"""
        try:
            with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['기관명', 'URL'])
                
                # 중복 제거
                unique_data = {}
                for org_name, url in self.org_data:
                    if url not in unique_data:
                        unique_data[url] = org_name
                
                # 정렬해서 저장
                for url in sorted(unique_data.keys()):
                    writer.writerow([unique_data[url], url])
                    
            print(f"\nCSV 파일 저장 완료: {filename}")
            
        except Exception as e:
            print(f"CSV 저장 실패: {e}")
    
    def print_results(self) -> None:
        """결과 출력"""
        unique_urls = list(set(url for _, url in self.org_data))
        unique_urls.sort()
        
        print("\n" + "="*80)
        print("크롤링 결과")
        print("="*80)
        
        for i, url in enumerate(unique_urls, 1):
            print(f"{i:3d}. {url}")
        
        print(f"\n총 발견된 정부기관 사이트 수: {len(unique_urls)}개")
        print("="*80)

def main():
    """메인 실행 함수"""
    print("정부기관 홈페이지 URL 크롤러")
    print("="*50)
    
    crawler = GovCrawler()
    
    try:
        # 크롤링 실행
        crawler.crawl_all()
        
        # 결과 출력
        crawler.print_results()
        
        # CSV 파일로 저장
        crawler.save_to_csv('gov_sites.csv')
        
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"예상치 못한 오류 발생: {e}")

if __name__ == "__main__":
    main()
