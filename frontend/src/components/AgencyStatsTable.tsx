'use client';

import { AgencyStats } from '@/types/service';
import { clsx } from 'clsx';

interface AgencyStatsTableProps {
  agencyStats: AgencyStats[];
}

export default function AgencyStatsTable({ agencyStats }: AgencyStatsTableProps) {
  const getStatusColor = (normalRate: number) => {
    if (normalRate >= 90) return 'text-green-600 bg-green-50';
    if (normalRate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusText = (normalRate: number) => {
    if (normalRate >= 90) return '양호';
    if (normalRate >= 70) return '주의';
    return '위험';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">기관별 서비스 현황</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기관명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                전체
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                정상
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                점검중
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                문제
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                정상율
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agencyStats.map((agency, index) => (
              <tr key={agency.agency} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {agency.agency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agency.current.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {agency.current.normal}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {agency.current.maintenance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {agency.current.problem}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {agency.current.normalRate.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusColor(agency.current.normalRate)
                  )}>
                    {getStatusText(agency.current.normalRate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
