'use client';

interface WebAppJsonLdProps {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  author?: {
    name: string;
    url: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  breadcrumb?: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}

export default function WebAppJsonLd({
  name,
  description,
  url,
  applicationCategory,
  operatingSystem,
  offers,
  author,
  faq,
  breadcrumb
}: WebAppJsonLdProps) {
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0.0',
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    ...(offers && { offers }),
    ...(author && { author: { '@type': 'Person', ...author } }),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/services?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    featureList: [
      '실시간 정부 사이트 모니터링',
      '장애 현황 대시보드',
      '기관별 통계 분석',
      '모바일 반응형 디자인',
      '10분마다 자동 업데이트'
    ]
  };

  const faqJsonLd = faq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  } : null;

  const breadcrumbJsonLd = breadcrumb ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url
    }))
  } : null;

  const allJsonLd: any[] = [webAppJsonLd];
  if (faqJsonLd) allJsonLd.push(faqJsonLd);
  if (breadcrumbJsonLd) allJsonLd.push(breadcrumbJsonLd);

  return (
    <>
      {allJsonLd.map((jsonLd, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
    </>
  );
}
