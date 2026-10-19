/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Clock,
  Layers,
  ArrowUpDown,
  Copy,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { PlatformType } from '../types';

interface ResultsHeaderProps {
  query: string;
  timestamp: string;
  totalResults: number;
  filteredCount: number;
  activeFilter: PlatformType;
  sortBy: 'relevance' | 'date' | 'coverage';
  onSortChange: (sort: 'relevance' | 'date' | 'coverage') => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onCopySummary: () => void;
  onShare: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  query,
  timestamp,
  totalResults,
  filteredCount,
  activeFilter,
  sortBy,
  onSortChange,
  isSaved,
  onToggleSave,
  onCopySummary,
  onShare,
}) => {
  const filterNames: Record<PlatformType, string> = {
    all: 'Todas las plataformas',
    web: 'Noticias web',
    youtube: 'YouTube',
    instagram: 'Instagram',
    meta: 'Meta',
    x: 'X (Twitter)',
    bilibili: 'Bilibili',
    reddit: 'Reddit',
    otros: 'Otras fuentes',
  };

  return (
    <div className="w-full pb-4 border-b border-[#DDD8CF]">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#777777] font-sans pb-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#B99A5B]" />
            <span>{timestamp}</span>
          </span>
          <span>·</span>
          <span className="font-medium text-[#1C1C1C]">
            {filteredCount === totalResults
              ? `${totalResults} resultados disponibles`
              : `${filteredCount} de ${totalResults} resultados (${filterNames[activeFilter]})`}
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-[#FAF8F5] border border-[#DDD8CF] rounded text-[11px] text-[#6B1F32]">
            Síntesis local
          </span>
        </div>

        {/* Action utility buttons: Copy, Share, Save */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onCopySummary}
            title="Copiar síntesis editorial"
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#DDD8CF] hover:border-[#6B1F32] hover:text-[#6B1F32] rounded text-[#1C1C1C] transition-colors shadow-2xs"
          >
            <Copy className="w-3 h-3" />
            <span className="hidden md:inline">Copiar resumen</span>
          </button>

          <button
            onClick={onShare}
            title="Compartir búsqueda"
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#DDD8CF] hover:border-[#6B1F32] hover:text-[#6B1F32] rounded text-[#1C1C1C] transition-colors shadow-2xs"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden md:inline">Compartir</span>
          </button>

          <button
            onClick={onToggleSave}
            title={isSaved ? 'Quitar de guardados' : 'Guardar búsqueda'}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs border rounded transition-colors shadow-2xs ${
              isSaved
                ? 'bg-[#6B1F32] text-white border-[#6B1F32]'
                : 'bg-white border-[#DDD8CF] hover:border-[#6B1F32] text-[#1C1C1C] hover:text-[#6B1F32]'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3 h-3" />
                <span className="hidden md:inline">Guardado</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3 h-3" />
                <span className="hidden md:inline">Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Headline & Sort row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B99A5B] font-bold">
            Síntesis informativa de
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#1C1C1C] mt-0.5 tracking-tight">
            «{query}»
          </h1>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <label htmlFor="sort-select" className="text-xs text-[#777777] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ordenar por:</span>
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'relevance' | 'date' | 'coverage')}
            className="text-xs bg-white border border-[#DDD8CF] rounded-md px-2.5 py-1.5 text-[#1C1C1C] font-sans focus:outline-none focus:border-[#6B1F32] shadow-2xs cursor-pointer"
          >
            <option value="relevance">Mayor relevancia</option>
            <option value="date">Más reciente</option>
            <option value="coverage">Mayor cobertura</option>
          </select>
        </div>
      </div>
    </div>
  );
};
