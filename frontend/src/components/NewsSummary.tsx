/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  HelpCircle,
  Users,
  Compass,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { SummaryData, ContentClassification } from '../types';

interface NewsSummaryProps {
  summary: SummaryData;
  onCitationClick: (citationNumber: number) => void;
}

export const NewsSummary: React.FC<NewsSummaryProps> = ({
  summary,
  onCitationClick,
}) => {
  const [perspectivesOpen, setPerspectivesOpen] = useState(true);
  const [unconfirmedOpen, setUnconfirmedOpen] = useState(true);
  const hasEditorialClassifications = summary.keyPoints.some((point) => point.category !== 'extracto');

  // Badge styles based on editorial classification
  const renderBadge = (category: ContentClassification) => {
    switch (category) {
      case 'hecho':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EAF3EE] text-[#356B52] border border-[#356B52]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#356B52]"></span>
            Hecho reportado
          </span>
        );
      case 'opinion':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F7F2E7] text-[#B99A5B] border border-[#B99A5B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B99A5B]"></span>
            Postura / Opinión
          </span>
        );
      case 'analisis':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1C1C1C] border border-[#DDD8CF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#777777]"></span>
            Análisis de datos
          </span>
        );
      case 'por_confirmar':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F4E8EB] text-[#6B1F32] border border-[#6B1F32]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B1F32]"></span>
            Por confirmar
          </span>
        );
      case 'extracto':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EAF0F7] text-[#405D86] border border-[#405D86]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#405D86]"></span>
            Extracto de fuente
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#DDD8CF] rounded-lg shadow-xs overflow-hidden transition-all">
      {/* Top Editorial Ribbon */}
      <div className="bg-[#6B1F32] text-white px-5 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#B99A5B]" />
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-[#F7F4EE]">
            En pocas palabras
          </span>
        </div>
        <div className="text-[11px] text-[#F7F4EE]/80 font-sans hidden sm:block">
          Extractos seleccionados · revisión en fuente original
        </div>
      </div>

      {/* Main Overview Paragraph */}
      <div className="p-5 sm:p-7 border-b border-[#E8E4DD] bg-[#FAF8F5]/50">
        <p className="text-base sm:text-lg text-[#1C1C1C] font-serif leading-relaxed">
          {summary.overview}
        </p>

        {hasEditorialClassifications && <div className="mt-4 pt-4 border-t border-[#E8E4DD] flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[#777777]">
          <span className="text-[11px] font-sans font-medium text-[#1C1C1C]">Clasificación:</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#356B52]"></span>
            Hecho reportado
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#777777]"></span>
            Análisis de datos
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#B99A5B]"></span>
            Postura / Opinión
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#6B1F32]"></span>
            Por confirmar
          </span>
        </div>}
      </div>

      {/* Section 1: Lo más importante */}
      <div className="p-5 sm:p-7 border-b border-[#E8E4DD]">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-[#356B52]" />
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C]">
            {hasEditorialClassifications ? 'Lo más importante' : 'Extractos destacados'}
          </h2>
        </div>

        <ul className="space-y-3.5">
          {summary.keyPoints.map((point) => (
            <li
              key={point.id}
              className="flex items-start gap-3 text-sm text-[#1C1C1C] leading-normal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B1F32] mt-2 flex-shrink-0"></span>
              <div className="flex-1">
                <span className="font-sans text-sm text-[#1C1C1C]">{point.text}</span>
                <span className="ml-2 inline-flex items-center gap-1.5">
                  {point.citations.map((cite) => (
                    <button
                      key={cite}
                      onClick={() => onCitationClick(cite)}
                      title={`Ver fuente [${cite}]`}
                      className="inline-block px-1.5 py-0.2 text-[10px] font-bold font-sans text-[#6B1F32] bg-[#F4E8EB] hover:bg-[#6B1F32] hover:text-white rounded border border-[#6B1F32]/30 transition-colors cursor-pointer"
                    >
                      [{cite}]
                    </button>
                  ))}
                  {renderBadge(point.category)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 2: Contexto */}
      <div className="p-5 sm:p-7 border-b border-[#E8E4DD] bg-[#FAF8F5]/40">
        <div className="flex items-center gap-2 mb-2.5">
          <Compass className="w-4 h-4 text-[#B99A5B]" />
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C]">
            Alcance de la consulta
          </h2>
        </div>
        <p className="text-sm text-[#2D2D2D] font-sans leading-relaxed">
          {summary.context}
        </p>
      </div>

      {/* Editorial perspectives are shown only when a backend provides them. */}
      {summary.perspectives.length > 0 && (
      <div className="p-5 sm:p-7 border-b border-[#E8E4DD]">
        <div
          onClick={() => setPerspectivesOpen(!perspectivesOpen)}
          className="flex items-center justify-between cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6B1F32]" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors">
              Perspectivas diferentes
            </h2>
            <span className="text-xs text-[#777777] font-sans">
              ({summary.perspectives.length} posturas identificadas)
            </span>
          </div>
          <button
            aria-label="Alternar perspectivas"
            className="text-[#777777] group-hover:text-[#1C1C1C]"
          >
            {perspectivesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {perspectivesOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 animate-fade-in">
            {summary.perspectives.map((perspective, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] border border-[#E8E4DD] rounded-md p-4 flex flex-col justify-between hover:border-[#DDD8CF] transition-colors"
              >
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#1C1C1C] mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B99A5B] flex-shrink-0"></span>
                    <span>{perspective.title}</span>
                  </h3>
                  <p className="text-xs text-[#2D2D2D] font-sans leading-relaxed">
                    {perspective.stance}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#E8E4DD] flex items-center justify-between text-[11px] text-[#777777]">
                  <span className="truncate max-w-[140px]" title={perspective.sources.join(', ')}>
                    {perspective.sources.join(', ')}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    {perspective.citations.map((cite) => (
                      <button
                        key={cite}
                        onClick={() => onCitationClick(cite)}
                        className="px-1 text-[10px] font-bold text-[#6B1F32] bg-[#F4E8EB] hover:bg-[#6B1F32] hover:text-white rounded border border-[#6B1F32]/20"
                      >
                        [{cite}]
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {summary.unconfirmed.length > 0 && (
      <div className="p-5 sm:p-7 bg-[#FFFDF9]">
        <div
          onClick={() => setUnconfirmedOpen(!unconfirmedOpen)}
          className="flex items-center justify-between cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#B99A5B]" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors">
              Qué falta por confirmar
            </h2>
            <span className="text-xs text-[#777777] font-sans">
              (Verificación en curso)
            </span>
          </div>
          <button
            aria-label="Alternar datos no confirmados"
            className="text-[#777777] group-hover:text-[#1C1C1C]"
          >
            {unconfirmedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {unconfirmedOpen && (
          <div className="mt-4 space-y-3 pt-1 animate-fade-in">
            {summary.unconfirmed.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-l-3 border-[#B99A5B] border-y border-r border-[#E8E4DD] p-3.5 rounded-r-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#1C1C1C]">
                    {item.claim}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F7F2E7] text-[#B99A5B] border border-[#B99A5B]/30">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-[#777777] leading-relaxed">
                  {item.note}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#777777]">
                  <span>Referencias citadas:</span>
                  {item.citations.map((cite) => (
                    <button
                      key={cite}
                      onClick={() => onCitationClick(cite)}
                      className="px-1 text-[10px] font-bold text-[#6B1F32] bg-[#F4E8EB] hover:bg-[#6B1F32] hover:text-white rounded border border-[#6B1F32]/20"
                    >
                      [{cite}]
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};
