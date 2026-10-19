/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Compass,
  TrendingUp,
  History,
  Bookmark,
  Menu,
  X,
  User,
  Info,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  activeView: 'home' | 'explore' | 'trending' | 'history' | 'saved';
  onNavigate: (view: 'home' | 'explore' | 'trending' | 'history' | 'saved') => void;
  historyCount: number;
  savedCount: number;
  onOpenInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  historyCount,
  savedCount,
  onOpenInfoModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'home' | 'explore' | 'trending' | 'history' | 'saved') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#E8E4DD] transition-all">
      {/* Top micro-bar: Editorial context indicator */}
      <div className="bg-[#1C1C1C] text-[#F7F4EE] px-4 py-1 text-[11px] flex items-center justify-between font-sans tracking-wide">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B99A5B] inline-block animate-pulse"></span>
          <span>Buscador editorial · fuentes públicas</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[#E8E4DD]/80">
          <span>Resultados según canales disponibles</span>
          <span>·</span>
          <span>Edición digital</span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Tagline */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={`${import.meta.env.BASE_URL}logo.jpg`}
                alt=""
                aria-hidden="true"
                className="w-11 h-11 flex-none rounded-full bg-black object-contain"
              />
              <span className="text-xl sm:text-2xl font-serif font-black tracking-tight text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors">
                BIGBROTHER
              </span>
            </div>
            <div className="hidden md:block pl-3 border-l border-[#DDD8CF]">
              <p className="text-xs text-[#777777] font-sans italic tracking-wide">
                La información, en perspectiva
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                activeView === 'home'
                  ? 'text-[#6B1F32] border-b-2 border-[#6B1F32]'
                  : 'text-[#1C1C1C] hover:text-[#6B1F32]'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                activeView === 'explore'
                  ? 'text-[#6B1F32] border-b-2 border-[#6B1F32]'
                  : 'text-[#1C1C1C] hover:text-[#6B1F32]'
              }`}
            >
              Explorar
            </button>
            <button
              onClick={() => handleNavClick('trending')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                activeView === 'trending'
                  ? 'text-[#6B1F32] border-b-2 border-[#6B1F32]'
                  : 'text-[#1C1C1C] hover:text-[#6B1F32]'
              }`}
            >
              Temas
            </button>
            <button
              onClick={() => handleNavClick('history')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'history'
                  ? 'text-[#6B1F32] border-b-2 border-[#6B1F32]'
                  : 'text-[#1C1C1C] hover:text-[#6B1F32]'
              }`}
            >
              <span>Historial</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#E8E4DD] text-[#1C1C1C] text-[10px] font-bold rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('saved')}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 ${
                activeView === 'saved'
                  ? 'text-[#6B1F32] border-b-2 border-[#6B1F32]'
                  : 'text-[#1C1C1C] hover:text-[#6B1F32]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Guardados</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#6B1F32] text-white text-[10px] font-bold rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right utility actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Editorial principles modal trigger */}
            <button
              onClick={onOpenInfoModal}
              title="Metodología y principios editoriales"
              className="p-2 text-[#777777] hover:text-[#6B1F32] hover:bg-[#E8E4DD]/60 rounded-full transition-colors flex items-center gap-1 text-xs"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline font-sans text-[11px] font-medium">Metodología</span>
            </button>

            {/* Profile icon (visual/decorative per specification) */}
            <button
              onClick={onOpenInfoModal}
              aria-label="Perfil de lector"
              className="w-8 h-8 rounded-full border border-[#DDD8CF] bg-white flex items-center justify-center text-[#1C1C1C] hover:border-[#6B1F32] hover:text-[#6B1F32] transition-colors shadow-xs"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú de navegación"
                className="p-2 text-[#1C1C1C] hover:text-[#6B1F32] hover:bg-[#E8E4DD]/60 rounded-md transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E8E4DD] space-y-2 animate-fade-in bg-[#FAF8F5] px-2 rounded-b-lg mb-2 shadow-sm">
            <div className="px-3 pb-2 text-[11px] text-[#777777] font-serif italic border-b border-[#E8E4DD]">
              La información, en perspectiva
            </div>
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-between ${
                activeView === 'home'
                  ? 'bg-[#6B1F32] text-white'
                  : 'text-[#1C1C1C] hover:bg-[#E8E4DD]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Inicio / Buscador</span>
              </div>
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeView === 'explore'
                  ? 'bg-[#6B1F32] text-white'
                  : 'text-[#1C1C1C] hover:bg-[#E8E4DD]/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorar fuentes</span>
            </button>
            <button
              onClick={() => handleNavClick('trending')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeView === 'trending'
                  ? 'bg-[#6B1F32] text-white'
                  : 'text-[#1C1C1C] hover:bg-[#E8E4DD]/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Temas para explorar</span>
            </button>
            <button
              onClick={() => handleNavClick('history')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-between ${
                activeView === 'history'
                  ? 'bg-[#6B1F32] text-white'
                  : 'text-[#1C1C1C] hover:bg-[#E8E4DD]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>Historial de búsquedas</span>
              </div>
              {historyCount > 0 && (
                <span className="px-2 py-0.5 bg-[#DDD8CF] text-[#1C1C1C] text-xs font-bold rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('saved')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-between ${
                activeView === 'saved'
                  ? 'bg-[#6B1F32] text-white'
                  : 'text-[#1C1C1C] hover:bg-[#E8E4DD]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span>Artículos y búsquedas guardadas</span>
              </div>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 bg-[#6B1F32] text-white text-xs font-bold rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
