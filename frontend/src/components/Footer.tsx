/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'explore' | 'trending' | 'history' | 'saved') => void;
  onOpenInfoModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenInfoModal }) => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E8E4DD] mt-16 sm:mt-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-[#E8E4DD]">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="" aria-hidden="true" className="w-9 h-9 flex-none rounded-full bg-black object-contain" />
              <span className="text-2xl font-serif font-black tracking-tight text-[#1C1C1C]">
                BIGBROTHER
              </span>
            </div>
            <p className="text-xs text-[#777777] font-serif italic max-w-sm">
              La información, en perspectiva. Consulta canales disponibles y revisa los extractos junto a sus fuentes originales.
            </p>
            <div className="pt-1">
              <span className="inline-block text-[11px] font-sans px-2.5 py-1 bg-[#FAF8F5] text-[#6B1F32] border border-[#E8E4DD] rounded">
                Frontend editorial interactivo · React + TypeScript
              </span>
            </div>
          </div>

          {/* Quick navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] mb-3">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-[#777777]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#6B1F32] transition-colors"
                >
                  Inicio / Buscador central
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('trending')}
                  className="hover:text-[#6B1F32] transition-colors"
                >
                  Temas para explorar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('history')}
                  className="hover:text-[#6B1F32] transition-colors"
                >
                  Historial de búsquedas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('saved')}
                  className="hover:text-[#6B1F32] transition-colors"
                >
                  Búsquedas guardadas
                </button>
              </li>
            </ul>
          </div>

          {/* Methodology & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] mb-3">
              Transparencia
            </h4>
            <ul className="space-y-2 text-xs text-[#777777]">
              <li>
                <button
                  onClick={onOpenInfoModal}
                  className="hover:text-[#6B1F32] transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-[#356B52]" />
                  <span>Criterios de trazabilidad</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenInfoModal}
                  className="hover:text-[#6B1F32] transition-colors"
                >
                  Diversidad de fuentes
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenInfoModal}
                  className="hover:text-[#6B1F32] transition-colors"
                >
                  Estado de los canales
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777777]">
          <p>© {new Date().getFullYear()} BIGBROTHER.</p>
          <p className="text-[11px] text-center sm:text-right">
            Diseño editorial para ordenador, laptop y dispositivo móvil.
          </p>
        </div>
      </div>
    </footer>
  );
};
