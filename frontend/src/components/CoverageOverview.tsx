/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, PieChart } from 'lucide-react';
import { PlatformCounts, PlatformType } from '../types';
import {
  InternetLogo,
  YouTubeLogo,
  InstagramLogo,
  MetaLogo,
  XLogo,
} from './PlatformIcons';

interface CoverageOverviewProps {
  distribution: PlatformCounts;
  activeFilter: PlatformType;
  onSelectPlatform: (platform: PlatformType) => void;
  diversity: {
    independentOutlets: number;
    distinctDomains?: number;
    platformCount: number;
    diversityRating: 'Alta' | 'Equilibrada' | 'En desarrollo';
    summaryNote: string;
  };
}

export const CoverageOverview: React.FC<CoverageOverviewProps> = ({
  distribution,
  activeFilter,
  onSelectPlatform,
  diversity,
}) => {
  const total = distribution.all || 1;

  const platforms: {
    id: PlatformType;
    label: string;
    sublabel: string;
    count: number;
    renderIcon: () => React.ReactNode;
    bgColor: string;
    barColor: string;
  }[] = [
    {
      id: 'web',
      label: 'Prensa web',
      sublabel: 'Red abierta de Internet',
      count: distribution.web,
      renderIcon: () => (
        <div className="flex items-center gap-1">
          <InternetLogo className="w-4 h-4 text-[#6B1F32]" />
        </div>
      ),
      bgColor: 'bg-[#F4E8EB]',
      barColor: 'bg-[#6B1F32]',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      sublabel: 'Video en Internet',
      count: distribution.youtube,
      renderIcon: () => (
        <div className="flex items-center gap-1.5">
          <YouTubeLogo className="w-4 h-4 text-[#E50914]" />
          <InternetLogo className="w-3 h-3 text-[#777777]" />
        </div>
      ),
      bgColor: 'bg-[#F9ECEF]',
      barColor: 'bg-[#85263E]',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      sublabel: 'Explore de la cuenta',
      count: distribution.instagram,
      renderIcon: () => (
        <div className="flex items-center gap-1.5">
          <InstagramLogo className="w-4 h-4 text-[#C13584]" />
          <InternetLogo className="w-3 h-3 text-[#777777]" />
        </div>
      ),
      bgColor: 'bg-[#F7F2E7]',
      barColor: 'bg-[#B99A5B]',
    },
    {
      id: 'meta',
      label: 'Facebook',
      sublabel: 'Contenido visible para la cuenta',
      count: distribution.meta ?? 0,
      renderIcon: () => <MetaLogo className="w-4 h-4 text-[#0668E1]" />,
      bgColor: 'bg-[#EAF1FA]',
      barColor: 'bg-[#0668E1]',
    },
    {
      id: 'x',
      label: 'X (Twitter)',
      sublabel: 'Hilos y debate en red',
      count: distribution.x,
      renderIcon: () => (
        <div className="flex items-center gap-1.5">
          <XLogo className="w-4 h-4 text-[#1C1C1C]" />
          <InternetLogo className="w-3 h-3 text-[#777777]" />
        </div>
      ),
      bgColor: 'bg-[#E8E4DD]',
      barColor: 'bg-[#1C1C1C]',
    },
    {
      id: 'bilibili',
      label: 'Bilibili',
      sublabel: 'Búsqueda pública de video',
      count: distribution.bilibili ?? 0,
      renderIcon: () => <span className="text-xs font-black text-[#C13584]">B</span>,
      bgColor: 'bg-[#F7E7EF]',
      barColor: 'bg-[#C13584]',
    },
    {
      id: 'reddit',
      label: 'Reddit',
      sublabel: 'Debates con sesión activa',
      count: distribution.reddit ?? 0,
      renderIcon: () => <span className="text-xs font-black text-[#D05A2A]">R</span>,
      bgColor: 'bg-[#FBEDE7]',
      barColor: 'bg-[#D05A2A]',
    },
  ];

  return (
    <div className="bg-white border border-[#DDD8CF] rounded-lg p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E4DD]">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#6B1F32]" />
          <h2 className="text-sm font-serif font-bold text-[#1C1C1C]">
            Distribución de resultados
          </h2>
        </div>
        <span className="text-xs text-[#777777] font-sans">
          Muestra total:{' '}
          <strong className="text-[#1C1C1C] font-semibold">{distribution.all} registros</strong>
        </span>
      </div>

      {/* Stacked Proportional Distribution Bar */}
      <div className="mt-4">
        <div className="h-3 w-full bg-[#E8E4DD] rounded-full overflow-hidden flex shadow-inner">
          {platforms.map((p) => {
            const pct = Math.round((p.count / total) * 100);
            if (pct === 0) return null;
            return (
              <div
                key={p.id}
                style={{ width: `${pct}%` }}
                title={`${p.label}: ${p.count} (${pct}%)`}
                className={`${p.barColor} h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-90`}
              />
            );
          })}
        </div>
      </div>

      {/* Platform Micro-Cards with Official Logo and Internet Logo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-4">
        {platforms.map((p) => {
          const isSelected = activeFilter === p.id;
          const percentage = Math.round((p.count / total) * 100);

          return (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id === activeFilter ? 'all' : p.id)}
              disabled={p.count === 0}
              className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#6B1F32] bg-[#FAF8F5] ring-2 ring-[#6B1F32]/10'
                    : 'border-[#E8E4DD] hover:border-[#B99A5B] bg-[#FAF8F5]/60 hover:bg-white'
                  } ${p.count === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded ${p.bgColor} flex items-center`}>
                  {p.renderIcon()}
                </div>
                <span className="text-[10px] text-[#777777] font-mono font-medium">
                  {percentage}%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-serif font-black text-[#1C1C1C]">
                  {p.count}
                </div>
                <div className="text-[11px] font-semibold text-[#1C1C1C] font-sans truncate">
                  {p.label}
                </div>
                <div className="text-[10px] text-[#777777] font-sans truncate">
                  {p.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Coverage counts domains and channels, not editorial independence. */}
      <div className="mt-4 pt-3.5 border-t border-[#E8E4DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF8F5] p-3 rounded-md">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#6B1F32] flex-shrink-0" />
          <div>
            <span className="font-semibold text-[#1C1C1C]">
              Canales con resultados: {diversity.platformCount}
            </span>
            <span className="text-[#777777] block sm:inline sm:ml-1 text-[11px]">
              ({diversity.distinctDomains ?? diversity.independentOutlets} dominios distintos; no es una evaluación de independencia)
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#777777] sm:max-w-xs italic text-left sm:text-right">
          {diversity.summaryNote}
        </p>
      </div>
    </div>
  );
};
