/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutGrid, List, Sparkles } from 'lucide-react';
import { PublicationItem, PlatformType } from '../types';
import { NewsCard } from './NewsCard';
import { YouTubeCard } from './YouTubeCard';
import { InstagramCard } from './InstagramCard';
import { XPostCard } from './XPostCard';

interface PublicationsListProps {
  items: PublicationItem[];
  activeFilter: PlatformType;
  onOpenArticle: (item: PublicationItem) => void;
  onCitationClick: (citation: number) => void;
}

export const PublicationsList: React.FC<PublicationsListProps> = ({
  items,
  activeFilter,
  onOpenArticle,
  onCitationClick,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter items based on activeFilter
  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.platform === activeFilter;
  });

  return (
    <div className="w-full">
      {/* List Header with layout switcher and count */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E4DD]">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C]">
            Artículos y publicaciones individuales
          </h2>
          <span className="text-xs text-[#777777] font-sans">
            ({filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'})
          </span>
        </div>

        {/* View toggle button */}
        <div className="hidden sm:flex items-center gap-1 bg-[#FAF8F5] border border-[#DDD8CF] rounded p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            title="Vista en cuadrícula"
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-[#6B1F32] shadow-2xs font-semibold'
                : 'text-[#777777] hover:text-[#1C1C1C]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Vista en lista"
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-[#6B1F32] shadow-2xs font-semibold'
                : 'text-[#777777] hover:text-[#1C1C1C]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#DDD8CF] rounded-lg p-8 text-center my-4">
          <Sparkles className="w-6 h-6 text-[#B99A5B] mx-auto mb-2" />
          <h3 className="font-serif font-bold text-base text-[#1C1C1C]">
            No hay resultados de esta plataforma en la consulta
          </h3>
          <p className="text-xs text-[#777777] mt-1">
            Prueba seleccionando «Todas las fuentes» o consultando otra plataforma.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {filteredItems.map((item) => {
            switch (item.platform) {
              case 'web':
              case 'otros':
                return (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onOpenArticle={onOpenArticle}
                    onCitationClick={onCitationClick}
                  />
                );
              case 'youtube':
                return (
                  <YouTubeCard
                    key={item.id}
                    item={item}
                    onOpenArticle={onOpenArticle}
                    onCitationClick={onCitationClick}
                  />
                );
              case 'instagram':
              case 'meta':
                return (
                  <InstagramCard
                    key={item.id}
                    item={item}
                    onOpenArticle={onOpenArticle}
                    onCitationClick={onCitationClick}
                  />
                );
              case 'x':
                return (
                  <XPostCard
                    key={item.id}
                    item={item}
                    onOpenArticle={onOpenArticle}
                    onCitationClick={onCitationClick}
                  />
                );
              default:
                return (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onOpenArticle={onOpenArticle}
                    onCitationClick={onCitationClick}
                  />
                );
            }
          })}
        </div>
      )}
    </div>
  );
};
