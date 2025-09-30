'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Github, ExternalLink, Heart, Code, Globe, Mail, Linkedin, Twitter, Instagram, Loader2, AlertCircle } from 'lucide-react';
import { GITHUB_CONFIG } from '@/constants/config';
import { Contributor } from '@/types/contributor';
import contributorsData from '@/data/contributors.json';
import WebAppJsonLd from '@/components/WebAppJsonLd';

export default function ContributorsContent() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [stats, setStats] = useState<{
    totalServices: number;
    totalAgencies: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 기여자 데이터 로드
        const contributors = contributorsData as Contributor[];
        setContributors(contributors);
        
        // 통계 데이터 로드
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalServices: statsData.totalServices,
            totalAgencies: statsData.totalAgencies
          });
        } else {
          console.error('Failed to fetch stats:', statsResponse.status, statsResponse.statusText);
        }
        
        setError(null);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">기여자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'website':
        return <Globe className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'hover:bg-gray-900 hover:text-white';
      case 'website':
        return 'hover:bg-blue-600 hover:text-white';
      case 'linkedin':
        return 'hover:bg-blue-700 hover:text-white';
      case 'twitter':
        return 'hover:bg-sky-500 hover:text-white';
      case 'instagram':
        return 'hover:bg-pink-600 hover:text-white';
      case 'email':
        return 'hover:bg-red-600 hover:text-white';
      default:
        return 'hover:bg-gray-600 hover:text-white';
    }
  };

  return (
    <>
      <WebAppJsonLd
        name="기여자 - 정부 사이트 장애 현황"
        description="정부서비스 장애 현황 모니터링 프로젝트에 기여한 멋진 기여자들을 소개합니다. 오픈소스 프로젝트에 참여해보세요."
        url="https://gov-status.vercel.app/contributors"
        applicationCategory="GovernmentApplication"
        operatingSystem="Any"
        author={{
          name: "김루비",
          url: "https://anb-network.com"
        }}
        faq={[
          {
            question: "어떻게 기여할 수 있나요?",
            answer: "코드 기여, 버그 신고, 문서화, 번역, 새로운 정부 서비스 추가 등 다양한 방법으로 기여할 수 있습니다. GitHub 저장소에서 이슈를 확인해보세요."
          },
          {
            question: "기여자로 등록되려면 어떻게 해야 하나요?",
            answer: "GitHub에서 Pull Request를 제출하고 승인되면 자동으로 기여자 목록에 추가됩니다. 코드 기여 외에도 이슈 제보나 문서화도 기여로 인정됩니다."
          },
          {
            question: "기술적 지식이 없어도 기여할 수 있나요?",
            answer: "네, 가능합니다. 문서화, 번역, 새로운 정부 서비스 정보 제공, 사용자 피드백 등 다양한 비기술적 기여 방법이 있습니다."
          },
          {
            question: "기여자 정보는 어떻게 관리되나요?",
            answer: "contributors.json 파일에서 관리되며, GitHub 프로필 정보를 기반으로 자동으로 업데이트됩니다. 개인정보는 최소한으로 수집합니다."
          },
          {
            question: "프로젝트의 목표는 무엇인가요?",
            answer: "정부 서비스의 투명성과 신뢰성을 높이고, 시민들이 정부 서비스 상태를 쉽게 확인할 수 있도록 하는 것이 목표입니다."
          }
        ]}
        breadcrumb={[
          { name: "홈", url: "https://gov-status.vercel.app", position: 1 },
          { name: "기여자", url: "https://gov-status.vercel.app/contributors", position: 2 }
        ]}
      />
      <div className="space-y-16">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">기여자 리스트</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          정부서비스 모니터링 시스템을 함께 만들어가는 멋진 기여자들을 소개합니다. 🎉
        </p>
      </div>

      {/* 기여자 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contributors.map((contributor) => (
          <div
            key={contributor.name}
            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            {/* 아바타와 기본 정보 */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Image
                  src={contributor.avatar}
                  alt={contributor.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{contributor.name}</h3>
              <p className="text-blue-600 font-semibold mb-2">{contributor.role}</p>
            </div>

            {/* 설명 */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              {contributor.description}
            </p>

            {/* 기여 내용 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">주요 기여</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {contributor.contribution}
              </p>
            </div>

            {/* 기술 스택 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">기술 스택</h4>
              <div className="flex flex-wrap gap-2">
                {contributor.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 소셜 링크 */}
            <div className="flex justify-center space-x-3">
              {Object.entries(contributor.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all duration-300 ${getSocialColor(platform)}`}
                  title={`${platform} 프로필`}
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 통계 섹션 */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">프로젝트 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{contributors.length}</div>
            <div className="text-gray-600">팀 멤버</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats ? stats.totalServices : '51'}
            </div>
            <div className="text-gray-600">모니터링 사이트</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
            <div className="text-gray-600">오픈소스</div>
          </div>
          {/* TODO: 실시간 모니터링 추가 시 주석 해제 */}
          {/* <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600">실시간 모니터링</div>
          </div> */}
        </div>
      </div>

      {/* 기여하기 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">함께 만들어가요!</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          이 프로젝트는 오픈소스로 운영되며, 누구나 기여할 수 있습니다.
          <br />
          개발, 디자인, 문서화, 번역 등 다양한 방식으로 참여하실 수 있습니다.
        </p>

        <a
          href={GITHUB_CONFIG.REPOSITORY_URL}
          target="_blank"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold"
        >
          <Github className="w-5 h-5" />
          <span>GitHub에서 기여하기</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      </div>
    </>
  );
}
