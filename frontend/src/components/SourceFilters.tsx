/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlatformType, PlatformCounts } from '../types';
import {
  InternetLogo,
  YouTubeLogo,
  MetaLogo,
  XLogo,
} from './PlatformIcons';

interface SourceFiltersProps {
  activeFilter: PlatformType;
  onFilterChange: (filter: PlatformType) => void;
  counts?: PlatformCounts;
}

interface FilterOption {
  id: PlatformType;
  label: string;
  renderLogo: (isActive: boolean) => React.ReactNode;
}

export const SourceFilters: React.FC<SourceFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const filterOptions: FilterOption[] = [
    {
      id: 'all',
      label: 'Todo Internet',
      renderLogo: (isActive) => (
        <span className="flex items-center gap-1">
          <InternetLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#6B1F32]'}`} />
        </span>
      ),
    },
    {
      id: 'web',
      label: 'Noticias web',
      renderLogo: (isActive) => (
        <span className="flex items-center gap-1">
          <InternetLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#6B1F32]'}`} />
        </span>
      ),
    },
    {
      id: 'youtube',
      label: 'YouTube',
      renderLogo: (isActive) => (
        <span className="flex items-center gap-1">
          <YouTubeLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#E50914]'}`} />
          <InternetLogo className={`w-2.5 h-2.5 opacity-60 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
        </span>
      ),
    },
    {
      id: 'bilibili',
      label: 'Bilibili',
      renderLogo: (isActive) => (
        <span className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-[#C13584]'}`}>B</span>
      ),
    },
    {
      id: 'meta',
      label: 'Facebook',
      renderLogo: (isActive) => (
        <span className="flex items-center gap-1">
          <MetaLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0668E1]'}`} />
          <InternetLogo className={`w-2.5 h-2.5 opacity-60 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
        </span>
      ),
    },
    {
      id: 'x',
      label: 'X (Twitter)',
      renderLogo: (isActive) => (
        <span className="flex items-center gap-1">
          <XLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#1C1C1C]'}`} />
          <InternetLogo className={`w-2.5 h-2.5 opacity-60 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
        </span>
      ),
    },
    {
      id: 'otros',
      label: 'Otras fuentes',
      renderLogo: (isActive) => (
        <span className="flex items-center gap-1">
          <InternetLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Container with horizontal scroll on small devices */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-2 px-1 gap-2 sm:gap-2.5">
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.id;
          const count = counts ? counts[option.id] : undefined;

          // If counts are available and a specific filter has 0 results, allow clicking if all or if items exist
          const hasResults = count === undefined || count > 0;

          return (
            <button
              key={option.id}
              onClick={() => onFilterChange(option.id)}
              disabled={!hasResults && option.id !== 'all'}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#6B1F32] text-white shadow-xs border border-[#6B1F32]'
                  : 'bg-white hover:bg-[#F3ECE0]/70 text-[#1C1C1C] border border-[#DDD8CF] hover:border-[#B99A5B]'
              } ${!hasResults && option.id !== 'all' ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {option.renderLogo(isActive)}
              <span>{option.label}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#E8E4DD] text-[#1C1C1C]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
