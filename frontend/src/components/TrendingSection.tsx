/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { INITIAL_SUGGESTIONS } from '../data/suggestions';

interface TrendingSectionProps {
  onSelectTopic: (query: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  onSelectTopic,
}) => {
  return (
    <section className="w-full mt-10 sm:mt-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#DDD8CF] pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#6B1F32]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B99A5B]">
              Búsquedas rápidas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1C1C1C] mt-0.5">
            Temas para explorar
          </h2>
        </div>
        <span className="text-xs text-[#777777] font-sans">
          Sugerencias de búsqueda; no son un ranking de tendencias.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_SUGGESTIONS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => onSelectTopic(topic)}
            className="bg-white border border-[#DDD8CF] hover:border-[#6B1F32] rounded-lg p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-sm"
          >
            <div className="flex items-start gap-3 text-left">
              <div className="p-2 rounded bg-[#FAF8F5] border border-[#E8E4DD] mt-0.5 group-hover:border-[#6B1F32]/30 transition-colors">
                <Compass className="w-4 h-4 text-[#6B1F32]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors leading-snug">
                  {topic}
                </h3>
                <p className="mt-1.5 text-xs text-[#777777] leading-relaxed font-sans">
                  Buscar en las fuentes activas y revisar los resultados originales.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E4DD] flex items-center justify-between text-xs text-[#6B1F32] font-semibold group-hover:text-[#501725]">
              <span>Buscar este tema</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
