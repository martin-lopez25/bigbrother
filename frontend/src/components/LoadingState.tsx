/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Newspaper, Video, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  query: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ query }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { label: 'Consultando los backends seleccionados...', icon: Newspaper },
    { label: 'Reuniendo resultados públicos disponibles...', icon: Video },
    { label: 'Calculando extractos y palabras clave localmente...', icon: MessageSquare },
    { label: 'Preparando enlaces y estados de las fuentes...', icon: ShieldCheck },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center animate-fade-in">
      {/* Editorial loader badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4E8EB] border border-[#6B1F32]/20 rounded-full text-xs font-semibold text-[#6B1F32] mb-6">
        <span className="w-2 h-2 rounded-full bg-[#6B1F32] animate-ping inline-block"></span>
        <span>Investigación en progreso</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1C1C1C] mb-2">
        Analizando fuentes sobre «{query}»
      </h2>
      <p className="text-sm text-[#777777] max-w-md mx-auto mb-8 font-sans">
        Consultando cada canal disponible. Las fuentes con sesión o herramientas ausentes se indicarán en los resultados.
      </p>

      {/* Progress Steps */}
      <div className="max-w-md mx-auto space-y-3 text-left bg-white border border-[#DDD8CF] p-5 rounded-lg shadow-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < stepIndex;
          const isCurrent = idx === stepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs p-2 rounded transition-all ${
                isCurrent
                  ? 'bg-[#FAF8F5] text-[#1C1C1C] font-semibold border-l-2 border-[#6B1F32]'
                  : isDone
                  ? 'text-[#356B52]'
                  : 'text-[#DDD8CF]'
              }`}
            >
              <div
                className={`p-1.5 rounded ${
                  isCurrent
                    ? 'bg-[#6B1F32] text-white animate-pulse'
                    : isDone
                    ? 'bg-[#EAF3EE] text-[#356B52]'
                    : 'bg-[#FAF8F5] text-[#DDD8CF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1">{step.label}</span>
              {isDone && <span className="text-[10px] font-bold text-[#356B52]">Listo</span>}
            </div>
          );
        })}
      </div>

      {/* Skeleton cards simulation */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto opacity-40">
        <div className="h-28 bg-[#E8E4DD] rounded-lg animate-pulse"></div>
        <div className="h-28 bg-[#E8E4DD] rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};
