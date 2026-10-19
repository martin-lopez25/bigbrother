/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { INITIAL_SUGGESTIONS } from '../data/suggestions';

interface SearchBarProps {
  currentQuery: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentQuery,
  onSearch,
  isLoading,
  compact = false,
}) => {
  const [inputValue, setInputValue] = useState(currentQuery);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className={`w-full ${compact ? 'max-w-4xl' : 'max-w-3xl'} mx-auto`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={`relative flex items-center bg-[#FFFFFF] border rounded-lg transition-all shadow-sm ${
            compact ? 'p-1 sm:p-1.5' : 'p-1.5 sm:p-2'
          } border-[#DDD8CF] focus-within:border-[#6B1F32] focus-within:ring-2 focus-within:ring-[#6B1F32]/10`}
        >
          {/* Magnifying Glass */}
          <div className="pl-3 sm:pl-4 pr-2 text-[#777777] flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-[#6B1F32] animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[#777777] group-focus-within:text-[#6B1F32] transition-colors" />
            )}
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="¿Qué está pasando en el mundo?"
            className="w-full py-2.5 sm:py-3 px-2 bg-transparent text-[#1C1C1C] placeholder-[#777777] text-sm sm:text-base font-sans focus:outline-none disabled:opacity-70"
          />

          {/* Clear button (X) */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              className="p-1.5 text-[#777777] hover:text-[#1C1C1C] hover:bg-[#F7F4EE] rounded-full transition-colors mr-1 sm:mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-[#6B1F32] hover:bg-[#501725] text-white text-xs sm:text-sm font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex-shrink-0 active:scale-[0.98]`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Sintetizando...</span>
              </>
            ) : (
              <>
                <span>Buscar</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Search Pills (only on non-compact or below search bar) */}
      {!compact && (
        <div className="mt-4 sm:mt-5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <span className="text-xs font-serif text-[#777777] flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-[#B99A5B]" />
              <span>Sugerencias:</span>
            </span>
            {INITIAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-white hover:bg-[#F7F2E7] border border-[#DDD8CF] hover:border-[#B99A5B] text-xs text-[#1C1C1C] rounded-full transition-all duration-150 shadow-2xs hover:text-[#6B1F32] cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
