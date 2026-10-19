/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Shield,
  Layers,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Award,
  GitBranch,
} from 'lucide-react';
import { SourceReference, SearchResultData } from '../types';
import {
  InternetLogo,
  YouTubeLogo,
  InstagramLogo,
  MetaLogo,
  XLogo,
} from './PlatformIcons';

interface SourcesPanelProps {
  sources: SourceReference[];
  methodology: SearchResultData['methodology'];
  highlightedCitation: number | null;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  methodology,
  highlightedCitation,
}) => {
  return (
    <div id="fuentes-consultadas" className="w-full space-y-6">
      {/* 1. Fuentes Consultadas Card */}
      <div className="bg-white border border-[#DDD8CF] rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E4DD] gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6B1F32]" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C]">
              Fuentes consultadas y trazabilidad
            </h2>
          </div>
          <span className="text-xs text-[#777777] font-sans">
            {sources.length} referencias vinculadas directamente a la síntesis
          </span>
        </div>

        {/* Source References Table / List */}
        <div className="mt-4 divide-y divide-[#E8E4DD]">
          {sources.map((source) => {
            const isHighlighted = highlightedCitation === source.citationIndex;

            return (
              <div
                key={source.id}
                id={`fuente-${source.citationIndex}`}
                className={`py-3.5 px-2.5 rounded transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isHighlighted
                    ? 'bg-[#F4E8EB]/70 border-l-3 border-[#6B1F32] shadow-xs'
                    : 'hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Citation index badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono flex-shrink-0 ${
                      isHighlighted
                        ? 'bg-[#6B1F32] text-white'
                        : 'bg-[#F7F2E7] text-[#6B1F32] border border-[#B99A5B]/30'
                    }`}
                  >
                    [{source.citationIndex}]
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#1C1C1C]">
                        {source.name}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1C1C1C] border border-[#DDD8CF] inline-flex items-center gap-1.5">
                        {source.platform === 'youtube' && <YouTubeLogo className="w-3 h-3 text-[#E50914]" />}
                        {source.platform === 'instagram' && <InstagramLogo className="w-3 h-3 text-[#C13584]" />}
                        {source.platform === 'meta' && <MetaLogo className="w-3 h-3 text-[#0668E1]" />}
                        {source.platform === 'x' && <XLogo className="w-3 h-3 text-[#1C1C1C]" />}
                        {source.platform === 'web' && <InternetLogo className="w-3 h-3 text-[#6B1F32]" />}
                        {source.platform === 'otros' && <InternetLogo className="w-3 h-3 text-[#777777]" />}
                        {source.platform === 'bilibili' && <span className="text-[9px] font-black text-[#C13584]">B</span>}
                        {source.platform === 'reddit' && <span className="text-[9px] font-black text-[#D05A2A]">R</span>}
                        <span>{source.platform === 'meta' ? 'Facebook' : source.platform === 'x' ? 'X' : source.platform === 'instagram' ? 'Instagram Explore' : source.platform}</span>
                        <span className="text-[#DDD8CF]">|</span>
                        <InternetLogo className="w-2.5 h-2.5 text-[#777777]" />
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${source.reputation === 'No evaluada' ? 'text-[#687488] bg-[#F1F3F7] border-[#DCE1E8]' : 'text-[#356B52] bg-[#EAF3EE] border-[#356B52]/20'}`}>
                        {source.reputation === 'No evaluada' ? 'Reputación sin evaluar' : source.reputation}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-serif text-[#1C1C1C] mt-1 line-clamp-1">
                      {source.title}
                    </p>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#777777]">
                      <span>{source.type}</span>
                      <span>·</span>
                      <span>{source.date}</span>
                      {source.authorOrOutlet && (
                        <>
                          <span>·</span>
                          <span className="hidden md:inline">{source.authorOrOutlet}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#6B1F32] bg-white hover:bg-[#F4E8EB] border border-[#DDD8CF] hover:border-[#6B1F32] rounded transition-colors"
                  >
                    <span>Abrir fuente</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cómo se construyó este resumen */}
      <div className="bg-[#FAF8F5] border border-[#DDD8CF] rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E8E4DD]">
          <GitBranch className="w-4 h-4 text-[#B99A5B]" />
          <h2 className="text-sm font-serif font-bold text-[#1C1C1C]">
            Cómo se construyó este resumen
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {methodology.map((m) => (
            <div
              key={m.step}
              className="bg-white border border-[#E8E4DD] rounded-md p-3.5 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {m.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B99A5B]">
                    Fase {m.step}
                  </span>
                </div>
                <h3 className="text-xs font-bold font-serif text-[#1C1C1C] mb-1">
                  {m.title}
                </h3>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
