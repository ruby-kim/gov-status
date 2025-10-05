'use client';

import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import React from 'react';

type SortField = 'name' | 'status' | 'responseTime';
type SortOrder = 'asc' | 'desc';

interface Props {
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: 'grid' | 'list';
  onSortChange: (field: SortField) => void;
  onOrderToggle: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function ServiceToolbar({
  sortField,
  sortOrder,
  viewMode,
  onSortChange,
  onOrderToggle,
  onViewModeChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <span className="text-sm font-medium text-gray-700">정렬:</span>
        {(['name', 'status', 'responseTime'] as SortField[]).map(field => (
          <button
            key={field}
            onClick={() => {
              if (sortField === field) {
                onOrderToggle();
              } else {
                onSortChange(field);
              }
            }}
            className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md ${
              sortField === field
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>
              {field === 'name'
                ? '서비스명'
                : field === 'status'
                ? '상태'
                : '응답시간'}
            </span>
            {sortField === field &&
              (sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              ))}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">보기:</span>
        <div className="flex border border-gray-300 rounded-md">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${
              viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${
              viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
