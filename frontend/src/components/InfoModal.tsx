/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Shield, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#DDD8CF] w-full max-w-xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8E4DD] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="" aria-hidden="true" className="w-8 h-8 rounded-full bg-black object-contain" />
            <span className="text-xl font-serif font-black text-[#1C1C1C]">BIGBROTHER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B1F32]"></span>
            <span className="text-xs text-[#777777] font-serif italic pl-2 border-l border-[#DDD8CF]">
              Principios editoriales
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-[#777777] hover:text-[#1C1C1C] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#1C1C1C] leading-relaxed">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1C1C1C] mb-1.5">
              La información, en perspectiva
            </h3>
            <p className="text-[#777777] font-sans">
              BIGBROTHER reúne resultados de los canales disponibles en Agent Reach y presenta extractos, cifras detectadas y enlaces originales. La síntesis es extractiva; no verifica afirmaciones de forma independiente.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#E8E4DD]">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#F4E8EB] text-[#6B1F32] mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-[#1C1C1C] font-semibold">Enlaces de origen</strong>
                <p className="text-[#777777] text-xs">
                  Cada resultado conserva un enlace a su fuente. Las referencias sirven para abrir material relacionado; no certifican su veracidad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#FAF8F5] border border-[#DDD8CF] text-[#B99A5B] mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-[#1C1C1C] font-semibold">Canales y requisitos</strong>
                <p className="text-[#777777] text-xs">
                  Prensa web y YouTube pueden consultarse sin sesión. X, Instagram y Facebook dependen de un backend compatible y una sesión local autorizada.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#EAF3EE] text-[#356B52] mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-[#1C1C1C] font-semibold">Límites de la síntesis</strong>
                <p className="text-[#777777] text-xs">
                  Los extractos no se clasifican como hechos verificados, opiniones ni posturas; abre las fuentes originales para contrastarlos.
                </p>
              </div>
            </div>
          </div>

          {/* Method note */}
          <div className="bg-[#FAF8F5] border border-[#E8E4DD] p-3 rounded text-[11px] text-[#777777] space-y-1">
              <span className="font-semibold text-[#1C1C1C] block">Privacidad y disponibilidad:</span>
            <p>
              La consulta se envía a los proveedores seleccionados. El dashboard no guarda contraseñas ni inicia sesiones; las fuentes sociales dependen de sesiones que controla el usuario.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E4DD] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#6B1F32] hover:bg-[#501725] text-white text-xs font-semibold rounded transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
