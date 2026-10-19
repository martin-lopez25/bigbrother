/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { PublicationItem } from '../types';
import { InternetLogo } from './PlatformIcons';

interface NewsCardProps {
  item: PublicationItem;
  onOpenArticle: (item: PublicationItem) => void;
  onCitationClick: (citation: number) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  onOpenArticle,
  onCitationClick,
}) => {
  return (
    <article className="bg-white border border-[#DDD8CF] hover:border-[#6B1F32] rounded-lg p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-sm">
      <div>
        {/* Top meta: Outlet, Date, Citation */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E4DD] text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#F4E8EB] text-[#6B1F32] flex items-center gap-1">
              <InternetLogo className="w-3.5 h-3.5 text-[#6B1F32]" />
            </div>
            <span className="font-semibold text-[#1C1C1C] tracking-wide">
              {item.sourceName}
            </span>
            <span className="text-[10px] font-medium text-[#777777] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E8E4DD] hidden sm:inline-flex items-center gap-1">
              <InternetLogo className="w-2.5 h-2.5" />
              <span>{item.platform === 'reddit' ? 'Reddit' : item.platform === 'bilibili' ? 'Bilibili' : 'Web'}</span>
            </span>
            <span className="text-[#DDD8CF]">·</span>
            <span className="text-[#777777] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.publishedAt}
            </span>
          </div>

          <button
            onClick={() => onCitationClick(item.citationNumber)}
            title={`Referencia citada [${item.citationNumber}]`}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD8CF] text-[#6B1F32] hover:bg-[#6B1F32] hover:text-white transition-colors"
          >
            Ref [{item.citationNumber}]
          </button>
        </div>

        {/* Content body with optional thumbnail */}
        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-4">
          <div className="flex-1">
            <h3
              onClick={() => onOpenArticle(item)}
              className="text-lg sm:text-xl font-serif font-bold text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors cursor-pointer leading-snug"
            >
              {item.title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#777777] line-clamp-3 leading-relaxed font-sans">
              {item.summary}
            </p>
          </div>

          {item.imageUrl && (
            <div className="sm:w-36 h-28 sm:h-24 w-full flex-shrink-0 overflow-hidden rounded bg-[#E8E4DD]">
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-[10px] bg-[#FAF8F5] text-[#777777] px-2 py-0.5 rounded border border-[#E8E4DD]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer action */}
      <div className="mt-5 pt-3 border-t border-[#E8E4DD] flex items-center justify-between">
        <span className="text-[11px] text-[#777777] uppercase tracking-wider font-semibold">
          {item.platform === 'reddit'
            ? 'Debate en Reddit'
            : item.platform === 'bilibili'
              ? 'Video de Bilibili'
              : item.contentType === 'investigacion'
                ? 'Investigación sectorial'
                : 'Prensa digital'}
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1F32] hover:text-[#501725] transition-colors group-hover:translate-x-0.5"
        >
          <span>{item.platform === 'reddit' || item.platform === 'bilibili' ? 'Abrir fuente original' : 'Leer fuente original'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
