/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SearchX, Sparkles, RotateCcw } from 'lucide-react';
import { INITIAL_SUGGESTIONS } from '../data/suggestions';

interface EmptyStateProps {
  query: string;
  onReset: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  query,
  onReset,
  onSelectSuggestion,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto py-16 px-4 text-center bg-white border border-[#DDD8CF] rounded-lg shadow-xs my-8 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD8CF] flex items-center justify-center mx-auto mb-4 text-[#777777]">
        <SearchX className="w-6 h-6 text-[#6B1F32]" />
      </div>

      <h2 className="text-xl font-serif font-bold text-[#1C1C1C]">
        Sin coincidencias para «{query}»
      </h2>
      <p className="text-xs sm:text-sm text-[#777777] mt-2 max-w-md mx-auto leading-relaxed">
        Ninguna de las fuentes seleccionadas devolvió coincidencias. Prueba con otros términos o revisa el estado de las fuentes.
      </p>

      {/* Suggested Topics */}
      <div className="mt-6 pt-5 border-t border-[#E8E4DD]">
        <span className="text-xs font-semibold text-[#1C1C1C] flex items-center justify-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#B99A5B]" />
          <span>Temas recomendados para explorar:</span>
        </span>

        <div className="flex flex-wrap justify-center gap-2">
          {INITIAL_SUGGESTIONS.slice(0, 4).map((sugg) => (
            <button
              key={sugg}
              onClick={() => onSelectSuggestion(sugg)}
              className="px-3 py-1 bg-[#FAF8F5] hover:bg-[#F4E8EB] border border-[#DDD8CF] hover:border-[#6B1F32] text-xs font-medium text-[#1C1C1C] hover:text-[#6B1F32] rounded-full transition-colors cursor-pointer"
            >
              {sugg}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1F32] hover:bg-[#501725] text-white text-xs font-semibold rounded transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Volver a la portada</span>
        </button>
      </div>
    </div>
  );
};
