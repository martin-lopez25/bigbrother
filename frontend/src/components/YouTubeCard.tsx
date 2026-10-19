/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Clock, Eye, ThumbsUp, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { PublicationItem } from '../types';
import { API_BASE_URL } from '../data/searchApi';
import { YouTubeLogo, InternetLogo } from './PlatformIcons';

interface YouTubeCardProps {
  item: PublicationItem;
  onOpenArticle: (item: PublicationItem) => void;
  onCitationClick: (citation: number) => void;
}

export const YouTubeCard: React.FC<YouTubeCardProps> = ({
  item,
  onOpenArticle,
  onCitationClick,
}) => {
  const [summaryState, setSummaryState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [summary, setSummary] = useState('');
  const [summaryMethod, setSummaryMethod] = useState('');
  const [summaryError, setSummaryError] = useState('');

  const handleSummarize = async () => {
    if (!item.videoId || summaryState === 'loading') return;
    setSummaryState('loading');
    setSummaryError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/youtube-summary?id=${encodeURIComponent(item.videoId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo resumir el video.');
      setSummary(data.summary);
      setSummaryMethod(`${data.method} · subtítulos ${String(data.language).toUpperCase()}`);
      setSummaryState('ready');
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'No se pudo resumir el video.');
      setSummaryState('error');
    }
  };

  return (
    <article className="bg-white border border-[#DDD8CF] hover:border-[#85263E] rounded-lg p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-sm">
      <div>
        {/* Top meta with YouTube and Internet logos */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E4DD] text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#F9ECEF] text-[#85263E] flex items-center gap-1">
              <YouTubeLogo className="w-3.5 h-3.5 text-[#E50914]" />
            </div>
            <span className="font-semibold text-[#1C1C1C]">
              {item.sourceName}
            </span>
            <span className="text-[10px] font-medium text-[#777777] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E8E4DD] hidden sm:inline-flex items-center gap-1">
              <InternetLogo className="w-2.5 h-2.5" />
              <span>YouTube Web</span>
            </span>
            {item.authorHandle && (
              <>
                <span className="text-[#DDD8CF]">·</span>
                <span className="text-[#777777] hidden sm:inline">{item.authorHandle}</span>
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

        {/* Thumbnail with duration overlay */}
        <div
          onClick={() => onOpenArticle(item)}
          className="mt-4 relative w-full h-44 sm:h-48 rounded-md overflow-hidden bg-[#1C1C1C] cursor-pointer group-hover:shadow-md transition-all"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2D2D2D]">
              <YouTubeLogo className="w-12 h-12 text-white/50" />
            </div>
          )}

          {/* Central Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#1C1C1C]/80 group-hover:bg-[#85263E] text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Duration badge */}
          {item.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#1C1C1C]/90 text-white text-[11px] font-mono rounded font-medium">
              {item.duration}
            </div>
          )}
        </div>

        {/* Title & Synopsis */}
        <div className="mt-3.5">
          <h3
            onClick={() => onOpenArticle(item)}
            className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors cursor-pointer leading-snug"
          >
            {item.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#777777] line-clamp-2 leading-relaxed font-sans">
            {item.summary}
          </p>
        </div>

        {item.videoId && (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={summaryState === 'loading'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#6B1F32] bg-[#F4E8EB] hover:bg-[#EEDCE1] disabled:opacity-60 rounded transition-colors"
            >
              {summaryState === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{summaryState === 'loading' ? 'Buscando subtítulos…' : summaryState === 'ready' ? 'Actualizar resumen' : 'Resumir video'}</span>
            </button>
            {summaryState === 'ready' && (
              <div className="mt-2 p-3 bg-[#FAF8F5] border-l-2 border-[#B99A5B] rounded-r">
                <p className="text-[10px] text-[#777777] mb-1">{summaryMethod}</p>
                <p className="text-xs text-[#2D2D2D] leading-relaxed whitespace-pre-line">{summary}</p>
              </div>
            )}
            {summaryState === 'error' && <p className="mt-2 text-xs text-[#85263E]">{summaryError}</p>}
          </div>
        )}

        {/* Metrics */}
        {item.metrics && (
          <div className="mt-3 flex items-center gap-4 text-xs text-[#777777]">
            {item.metrics.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#B99A5B]" />
                {item.metrics.views.toLocaleString()} vistas
              </span>
            )}
            {item.metrics.likes && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                {item.metrics.likes.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer action */}
      <div className="mt-5 pt-3 border-t border-[#E8E4DD] flex items-center justify-between">
        <span className="text-[11px] text-[#777777] uppercase tracking-wider font-semibold">
          Video análisis
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#85263E] hover:text-[#501725] transition-colors group-hover:translate-x-0.5"
        >
          <span>Ver video</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
