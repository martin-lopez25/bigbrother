/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Bookmark,
  Trash2,
  Search,
  Clock,
  ArrowRight,
  X,
  BookmarkCheck,
} from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchHistoryItem[];
  onSelectSearch: (query: string) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
  onToggleSave: (id: string) => void;
  initialTab?: 'history' | 'saved';
}

export const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectSearch,
  onRemoveItem,
  onClearHistory,
  onToggleSave,
  initialTab = 'history',
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>(initialTab);

  if (!isOpen) return null;

  const savedItems = history.filter((item) => item.isSaved);
  const itemsToDisplay = activeTab === 'history' ? history : savedItems;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#DDD8CF] w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E4DD] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#6B1F32]" />
            <h2 className="text-lg font-serif font-bold text-[#1C1C1C]">
              Registro de investigación
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-[#777777] hover:text-[#1C1C1C] rounded hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8E4DD] bg-[#FAF8F5] px-4 pt-2 gap-2 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-[#6B1F32] text-[#6B1F32]'
                : 'border-transparent text-[#777777] hover:text-[#1C1C1C]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial reciente ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'border-[#6B1F32] text-[#6B1F32]'
                : 'border-transparent text-[#777777] hover:text-[#1C1C1C]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Guardados en favoritos ({savedItems.length})</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-[#E8E4DD]">
          {itemsToDisplay.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-[#DDD8CF] mx-auto mb-2" />
              <p className="text-sm font-serif font-bold text-[#1C1C1C]">
                {activeTab === 'history'
                  ? 'No hay búsquedas recientes en esta sesión'
                  : 'Aún no has guardado ninguna búsqueda como favorita'}
              </p>
              <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
                {activeTab === 'history'
                  ? 'Las búsquedas que realices se registrarán aquí localmente para que puedas retomarlas fácilmente.'
                  : 'Pulsa el botón «Guardar» en la cabecera de cualquier resultado para conservarlo aquí.'}
              </p>
            </div>
          ) : (
            itemsToDisplay.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-white px-2 rounded transition-colors"
              >
                <div
                  onClick={() => {
                    onSelectSearch(item.query);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer flex items-center gap-3"
                >
                  <Search className="w-4 h-4 text-[#B99A5B] flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#1C1C1C] group-hover:text-[#6B1F32] transition-colors">
                      «{item.query}»
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#777777] mt-0.5">
                      <span>{item.timestamp}</span>
                      <span>·</span>
                      <span>{item.resultCount} resultados encontrados</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onToggleSave(item.id)}
                    title={item.isSaved ? 'Quitar de guardados' : 'Guardar en favoritos'}
                    className={`p-1.5 rounded hover:bg-[#FAF8F5] transition-colors ${
                      item.isSaved ? 'text-[#6B1F32]' : 'text-[#777777]'
                    }`}
                  >
                    {item.isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    title="Eliminar del registro"
                    className="p-1.5 text-[#777777] hover:text-[#85263E] rounded hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectSearch(item.query);
                      onClose();
                    }}
                    className="p-1.5 text-[#6B1F32] hover:bg-[#F4E8EB] rounded transition-colors ml-1"
                    title="Consultar resultados"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {activeTab === 'history' && history.length > 0 && (
          <div className="p-3.5 bg-white border-t border-[#E8E4DD] flex items-center justify-between text-xs text-[#777777]">
            <span>Almacenamiento local en tu navegador</span>
            <button
              onClick={onClearHistory}
              className="text-[#85263E] hover:underline font-medium"
            >
              Borrar todo el historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
