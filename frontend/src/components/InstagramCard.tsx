/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { PublicationItem } from '../types';
import { InstagramLogo, MetaLogo, InternetLogo } from './PlatformIcons';

interface InstagramCardProps {
  item: PublicationItem;
  onOpenArticle: (item: PublicationItem) => void;
  onCitationClick: (citation: number) => void;
}

export const InstagramCard: React.FC<InstagramCardProps> = ({
  item,
  onOpenArticle,
  onCitationClick,
}) => {
  return (
    <article className="bg-white border border-[#DDD8CF] hover:border-[#B99A5B] rounded-lg p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-sm">
      <div>
        {/* Top meta with Instagram, Meta and Internet logos */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E4DD] text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#F7F2E7] text-[#B99A5B] flex items-center gap-1">
              {item.platform === 'meta'
                ? <MetaLogo className="w-3.5 h-3.5 text-[#0668E1]" />
                : <InstagramLogo className="w-3.5 h-3.5 text-[#C13584]" />}
            </div>
            <span className="font-semibold text-[#1C1C1C]">
              {item.authorHandle || item.sourceName}
            </span>
            <span className="text-[10px] font-medium text-[#777777] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E8E4DD] hidden sm:inline-flex items-center gap-1">
              <MetaLogo className="w-2.5 h-2.5 text-[#0668E1]" />
              <InternetLogo className="w-2.5 h-2.5" />
              <span>{item.platform === 'meta' ? 'Facebook' : 'Instagram Explore'}</span>
            </span>
            {item.postType && (
              <>
                <span className="text-[#DDD8CF]">·</span>
                <span className="text-[11px] font-medium text-[#777777] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E8E4DD]">
                  {item.postType}
                </span>
              </>
            )}
            <span className="text-[#DDD8CF]">·</span>
            <span className="text-[#777777]">{item.publishedAt}</span>
          </div>

          <button
            onClick={() => onCitationClick(item.citationNumber)}
            title={`Referencia citada [${item.citationNumber}]`}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#DDD8CF] text-[#6B1F32] hover:bg-[#6B1F32] hover:text-white transition-colors"
          >
            Ref [{item.citationNumber}]
          </button>
        </div>

        {/* Media Thumbnail */}
        {item.imageUrl && (
          <div
            onClick={() => onOpenArticle(item)}
            className="mt-4 relative w-full h-44 rounded-md overflow-hidden bg-[#E8E4DD] cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.postType === 'Carrusel' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#1C1C1C]/80 text-white text-[10px] rounded backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B99A5B]" />
                <span>Carrusel</span>
              </div>
            )}
          </div>
        )}

        {/* Title and caption */}
        <div className="mt-3.5">
          <h3
            onClick={() => onOpenArticle(item)}
            className="text-base font-serif font-bold text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors cursor-pointer leading-snug"
          >
            {item.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#777777] line-clamp-3 leading-relaxed font-sans">
            {item.summary}
          </p>
        </div>

        {/* Metrics */}
        {item.metrics && (
          <div className="mt-3 flex items-center gap-4 text-xs text-[#777777]">
            {item.metrics.likes && (
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#6B1F32]" />
                {item.metrics.likes.toLocaleString()} me gusta
              </span>
            )}
            {item.metrics.comments && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {item.metrics.comments}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="mt-5 pt-3 border-t border-[#E8E4DD] flex items-center justify-between">
        <span className="text-[11px] text-[#777777] uppercase tracking-wider font-semibold">
          Divulgación visual
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B99A5B] hover:text-[#1C1C1C] transition-colors group-hover:translate-x-0.5"
        >
          <span>Ver publicación</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
