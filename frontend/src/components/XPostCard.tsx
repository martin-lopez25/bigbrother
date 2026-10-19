/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Repeat2, Heart, MessageCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { PublicationItem } from '../types';
import { XLogo, InternetLogo } from './PlatformIcons';

interface XPostCardProps {
  item: PublicationItem;
  onOpenArticle: (item: PublicationItem) => void;
  onCitationClick: (citation: number) => void;
}

export const XPostCard: React.FC<XPostCardProps> = ({
  item,
  onOpenArticle,
  onCitationClick,
}) => {
  return (
    <article className="bg-white border border-[#DDD8CF] hover:border-[#1C1C1C] rounded-lg p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-sm">
      <div>
        {/* Top Header: Account Handle, Verified, Date, Ref citation with X and Internet logo */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E4DD] text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#E8E4DD] text-[#1C1C1C] flex items-center gap-1">
              <XLogo className="w-3.5 h-3.5 text-[#1C1C1C]" />
            </div>
            <div className="flex items-center gap-1 font-semibold text-[#1C1C1C]">
              <span>{item.authorHandle || item.sourceName}</span>
              <CheckCircle className="w-3 h-3 text-[#356B52]" />
            </div>
            <span className="text-[10px] font-medium text-[#777777] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E8E4DD] hidden sm:inline-flex items-center gap-1">
              <InternetLogo className="w-2.5 h-2.5" />
              <span>X Web</span>
            </span>
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

        {/* Content Body */}
        <div className="mt-4">
          <p
            onClick={() => onOpenArticle(item)}
            className="text-sm sm:text-base text-[#1C1C1C] font-sans leading-relaxed cursor-pointer hover:text-[#6B1F32] transition-colors"
          >
            {item.summary}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono text-[#6B1F32] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E4DD]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interaction Metrics */}
        {item.metrics && (
          <div className="mt-4 pt-3 border-t border-[#E8E4DD] flex items-center gap-6 text-xs text-[#777777]">
            {item.metrics.reposts && (
              <span className="flex items-center gap-1.5">
                <Repeat2 className="w-3.5 h-3.5 text-[#356B52]" />
                {item.metrics.reposts.toLocaleString()}
              </span>
            )}
            {item.metrics.likes && (
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#6B1F32]" />
                {item.metrics.likes.toLocaleString()}
              </span>
            )}
            {item.metrics.comments && (
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                {item.metrics.comments}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[#E8E4DD] flex items-center justify-between">
        <span className="text-[11px] text-[#777777] uppercase tracking-wider font-semibold">
          Publicación en X
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1C1C] hover:text-[#6B1F32] transition-colors group-hover:translate-x-0.5"
        >
          <span>Ver publicación</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
