/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  TrendingUp,
  Bookmark,
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  Copy,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

import {
  PlatformType,
  SearchResultData,
  SearchHistoryItem,
  PublicationItem,
  SourceReference,
} from './types';

import { INITIAL_SUGGESTIONS, PRIMARY_SEARCH_QUERY } from './data/suggestions';
import { API_BASE_URL, searchDashboard } from './data/searchApi';

import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SourceFilters } from './components/SourceFilters';
import { ResultsHeader } from './components/ResultsHeader';
import { NewsSummary } from './components/NewsSummary';
import { CoverageOverview } from './components/CoverageOverview';
import { PublicationsList } from './components/PublicationsList';
import { SourcesPanel } from './components/SourcesPanel';
import { TrendingSection } from './components/TrendingSection';
import { SearchHistoryModal } from './components/SearchHistoryModal';
import { ArticleModal } from './components/ArticleModal';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import { InfoModal } from './components/InfoModal';
import { Footer } from './components/Footer';

export default function App() {
  const isStaticPreview = window.location.hostname.endsWith('.github.io') && !API_BASE_URL;

  // Navigation & state
  const [activeNavView, setActiveNavView] = useState<
    'home' | 'explore' | 'trending' | 'history' | 'saved'
  >('home');
  const [searchState, setSearchState] = useState<
    'idle' | 'loading' | 'results' | 'empty' | 'error'
  >('idle');
  const [currentQuery, setCurrentQuery] = useState(PRIMARY_SEARCH_QUERY);
  const [resultsData, setResultsData] = useState<SearchResultData | null>(null);
  const [searchError, setSearchError] = useState('');
  const searchController = useRef<AbortController | null>(null);

  // Filters & sorting
  const [activeFilter, setActiveFilter] = useState<PlatformType>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'coverage'>('relevance');

  // Modals & popups
  const [activeArticleModal, setActiveArticleModal] = useState<
    PublicationItem | SourceReference | null
  >(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyModalTab, setHistoryModalTab] = useState<'history' | 'saved'>('history');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Highlighted citation from clicks on [1], [2]
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('success');

  // Search history state persisted in localStorage
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('bigbrother_search_history')
        ?? localStorage.getItem('pulso_search_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bigbrother_search_history', JSON.stringify(history));
    } catch {
      // Ignore in private storage sandbox
    }
  }, [history]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Query only the backends exposed by the local Agent Reach dashboard API.
  const handlePerformSearch = async (queryToSearch: string) => {
    if (isStaticPreview) {
      showToast('Las búsquedas requieren el servidor local de BIGBROTHER.', 'warning');
      return;
    }
    if (!queryToSearch.trim()) return;

    const trimmedQuery = queryToSearch.trim();
    setCurrentQuery(trimmedQuery);
    setSearchState('loading');
    setSearchError('');
    setActiveNavView('home');
    setHighlightedCitation(null);
    setActiveFilter('all');
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;

    try {
      const data = await searchDashboard(trimmedQuery, controller.signal);
      if (controller.signal.aborted) return;
      setResultsData(data);
      setSearchState('results');

      setHistory((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.query.toLowerCase() === trimmedQuery.toLowerCase()
        );
        const newItem: SearchHistoryItem = {
          id: `hist-${Date.now()}`,
          query: trimmedQuery,
          timestamp: 'Hace un momento',
          resultCount: data.totalResults,
          isSaved: existingIndex >= 0 ? prev[existingIndex].isSaved : false,
        };
        const withoutDuplicate = prev.filter(
          (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
        );
        return [newItem, ...withoutDuplicate].slice(0, 20);
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      setSearchError(error instanceof Error ? error.message : 'No fue posible consultar las fuentes.');
      setSearchState('error');
    } finally {
      if (searchController.current === controller) searchController.current = null;
    }
  };

  useEffect(() => {
    if (!isStaticPreview) void handlePerformSearch(PRIMARY_SEARCH_QUERY);
    return () => searchController.current?.abort();
  }, []);

  // Reset to initial home port
  const handleResetHome = () => {
    searchController.current?.abort();
    searchController.current = null;
    setSearchState('idle');
    setCurrentQuery('');
    setResultsData(null);
    setActiveNavView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Citation click handler [1], [2]
  const handleCitationClick = (citationNumber: number) => {
    setHighlightedCitation(citationNumber);
    showToast(`Mostrando fuente [${citationNumber}]`, 'info');

    // Smooth scroll to Fuentes Consultadas
    const element = document.getElementById(`fuente-${citationNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const panel = document.getElementById('fuentes-consultadas');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Copy Summary to clipboard
  const handleCopySummary = () => {
    if (!resultsData) return;
    const summaryText = `«${resultsData.query}» — Síntesis de BIGBROTHER\n\n${resultsData.summary.overview}\n\nLo más importante:\n${resultsData.summary.keyPoints
      .map((k) => `• ${k.text}`)
      .join('\n')}\n\nFuentes consultadas: ${resultsData.sources.map((s) => s.name).join(', ')}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      showToast('Síntesis editorial copiada al portapapeles', 'success');
    } else {
      showToast('Texto preparado para copiar', 'info');
    }
  };

  // Share search
  const handleShare = () => {
    if (!resultsData) return;
    if (navigator.share) {
      navigator
        .share({
          title: `BIGBROTHER: ${resultsData.query}`,
          text: `Síntesis editorial sobre ${resultsData.query}`,
          url: window.location.href,
        })
        .catch(() => {
          // User cancelled or ignored
        });
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast('Enlace de búsqueda copiado al portapapeles', 'success');
      } else {
        showToast('Enlace generado para compartir', 'info');
      }
    }
  };

  // Toggle save search in history/bookmarks
  const handleToggleCurrentSave = () => {
    if (!currentQuery) return;
    setHistory((prev) =>
      prev.map((item) => {
        if (item.query.toLowerCase() === currentQuery.toLowerCase()) {
          const nextSaved = !item.isSaved;
          showToast(
            nextSaved
              ? 'Búsqueda guardada en favoritos'
              : 'Búsqueda retirada de guardados',
            'success'
          );
          return { ...item, isSaved: nextSaved };
        }
        return item;
      })
    );
  };

  const isCurrentSaved = Boolean(
    history.find(
      (h) => h.query.toLowerCase() === currentQuery.toLowerCase() && h.isSaved
    )
  );

  const handleToggleSaveById = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSaved: !item.isSaved } : item))
    );
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Registro eliminado del historial', 'info');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    showToast('Historial completo eliminado', 'info');
  };

  // Navigation controller
  const handleNavigation = (view: 'home' | 'explore' | 'trending' | 'history' | 'saved') => {
    setActiveNavView(view);
    if (view === 'history') {
      setHistoryModalTab('history');
      setIsHistoryModalOpen(true);
    } else if (view === 'saved') {
      setHistoryModalTab('saved');
      setIsHistoryModalOpen(true);
    } else if (view === 'home' && searchState !== 'idle') {
      handleResetHome();
    } else if (view === 'trending' || view === 'explore') {
      // Scroll to trending or switch view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const savedCount = history.filter((h) => h.isSaved).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#1C1C1C]">
      {/* 1. Header & Navigation */}
      <Header
        activeView={activeNavView}
        onNavigate={handleNavigation}
        historyCount={history.length}
        savedCount={savedCount}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If user is exploring 'trending' without an active search */}
        {activeNavView === 'trending' && searchState === 'idle' ? (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B99A5B]">
                Módulo Editorial
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#1C1C1C] mt-1">
                Temas para explorar
              </h1>
              <p className="text-sm text-[#777777] mt-1">
                Explora los temas más consultados en noticias digitales, videos y debates sociales.
              </p>
            </div>
            <SearchBar
              currentQuery={currentQuery}
              onSearch={handlePerformSearch}
              isLoading={false}
            />
            <TrendingSection onSelectTopic={handlePerformSearch} />
          </div>
        ) : searchState === 'idle' ? (
          /* ============================================================ */
          /* INITIAL STATE (Hero Editorial + SearchBar + Suggestions)      */
          /* ============================================================ */
          <div className="w-full space-y-10 sm:space-y-14">
            {/* Hero Editorial Header */}
            <div className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] border border-[#DDD8CF] rounded-full text-xs text-[#6B1F32] font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B99A5B]"></span>
                <span>Buscador y sintetizador editorial</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[#1C1C1C] leading-tight">
                Entiende lo que está pasando
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[#777777] font-sans max-w-2xl mx-auto leading-relaxed">
                Busca un tema y compara resultados públicos de las fuentes activas, con extractos y enlaces para revisar cada publicación original.
              </p>
            </div>

            {/* Central Search Bar with Suggestions */}
            <div className="pt-2">
              <SearchBar
                currentQuery={currentQuery}
                onSearch={handlePerformSearch}
                isLoading={false}
              />
              {isStaticPreview && (
                <p className="mt-3 text-center text-xs text-[#777777]">
                  Previsualización pública: las búsquedas requieren el servidor local de BIGBROTHER.
                </p>
              )}
            </div>

            {/* Platform Scope Pills */}
            <div className="max-w-2xl mx-auto pt-2">
              <div className="bg-white/80 border border-[#DDD8CF] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#6B1F32]" />
                  <div>
                    <h3 className="text-xs font-bold font-serif text-[#1C1C1C]">
                      Fuentes y canales disponibles
                    </h3>
                      <p className="text-[11px] text-[#777777]">
                      Prensa web · YouTube · Bilibili · redes con sesión configurada
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="text-xs font-semibold text-[#6B1F32] hover:text-[#501725] transition-colors whitespace-nowrap"
                >
                  Conocer metodología →
                </button>
              </div>
            </div>

            {/* En conversación / Trending Section */}
            <TrendingSection onSelectTopic={handlePerformSearch} />
          </div>
        ) : searchState === 'loading' ? (
          /* ============================================================ */
          /* LOADING STATE                                                */
          /* ============================================================ */
          <LoadingState query={currentQuery} />
        ) : searchState === 'error' ? (
          /* ============================================================ */
          /* ERROR STATE                                                  */
          /* ============================================================ */
          <div className="max-w-md mx-auto py-16 text-center bg-white border border-[#DDD8CF] p-6 rounded-lg my-8">
            <AlertCircle className="w-10 h-10 text-[#85263E] mx-auto mb-3" />
            <h2 className="text-xl font-serif font-bold text-[#1C1C1C]">
              Ocurrió un error temporal
            </h2>
            <p className="text-xs text-[#777777] mt-2 mb-6">
              {searchError || 'No fue posible consultar las fuentes disponibles en este momento.'}
            </p>
            <button
              onClick={() => handlePerformSearch(currentQuery || 'Economía mexicana')}
              className="px-4 py-2 bg-[#6B1F32] text-white text-xs font-semibold rounded hover:bg-[#501725] transition-colors"
            >
              Reintentar búsqueda
            </button>
          </div>
        ) : searchState === 'results' && resultsData ? (
          /* ============================================================ */
          /* RESULTS STATE                                                */
          /* ============================================================ */
          <div className="w-full space-y-8 animate-fade-in">
            {/* Top Compact Search Bar with quick re-search capability */}
            <div className="pb-2">
              <SearchBar
                currentQuery={currentQuery}
                onSearch={handlePerformSearch}
                isLoading={false}
                compact
              />
            </div>

            {/* Results Title, Meta, and Sort Dropdown */}
            <ResultsHeader
              query={resultsData.query}
              timestamp={resultsData.timestamp}
              totalResults={resultsData.totalResults}
              filteredCount={
                activeFilter === 'all'
                  ? resultsData.totalResults
                  : (resultsData.platformDistribution[activeFilter] ?? 0)
              }
              activeFilter={activeFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              isSaved={isCurrentSaved}
              onToggleSave={handleToggleCurrentSave}
              onCopySummary={handleCopySummary}
              onShare={handleShare}
            />

            {/* Source Filters Bar */}
            <div className="sticky top-18 sm:top-20 z-30 bg-[#F7F4EE]/95 backdrop-blur-xs py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <SourceFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={resultsData.platformDistribution}
              />
            </div>

            {resultsData.sourceStatuses && Object.values(resultsData.sourceStatuses).some((source) => source.status === 'setup_required' || source.status === 'error') && (
              <div className="bg-white border border-[#DDD8CF] rounded-md px-4 py-3 text-xs text-[#555555]">
                <p className="font-semibold text-[#1C1C1C] mb-1">Estado de las fuentes</p>
                <ul className="space-y-1">
                  {Object.values(resultsData.sourceStatuses)
                    .filter((source) => source.status === 'setup_required' || source.status === 'error')
                    .map((source) => (
                      <li key={source.name}>
                        <span className="font-medium">{source.name}:</span> {source.error || 'No disponible'}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* General Editorial Synthesis: «En pocas palabras» */}
            <NewsSummary
              summary={resultsData.summary}
              onCitationClick={handleCitationClick}
            />

            {/* Coverage Distribution Indicator */}
            <CoverageOverview
              distribution={resultsData.platformDistribution}
              activeFilter={activeFilter}
              onSelectPlatform={setActiveFilter}
              diversity={resultsData.sourceDiversity}
            />

            {/* Differentiated Publication Cards */}
            <PublicationsList
              items={[...resultsData.items].sort((left, right) => {
                if (sortBy === 'date') {
                  return new Date(right.sortDate ?? 0).getTime() - new Date(left.sortDate ?? 0).getTime();
                }
                if (sortBy === 'coverage') {
                  return (right.metrics?.views ?? right.metrics?.likes ?? 0) - (left.metrics?.views ?? left.metrics?.likes ?? 0);
                }
                return 0;
              })}
              activeFilter={activeFilter}
              onOpenArticle={(item) => setActiveArticleModal(item)}
              onCitationClick={handleCitationClick}
            />

            {/* Fuentes Consultadas & Trazabilidad (How it was built) */}
            <SourcesPanel
              sources={resultsData.sources}
              methodology={resultsData.methodology}
              highlightedCitation={highlightedCitation}
            />

            {/* Back to top or new search prompt */}
            <div className="pt-6 border-t border-[#DDD8CF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
              <span>¿Deseas consultar otro tema de interés?</span>
              <div className="flex gap-2">
                <button
                  onClick={handleResetHome}
                  className="px-3 py-1.5 bg-white border border-[#DDD8CF] hover:border-[#6B1F32] rounded text-[#1C1C1C] transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Nueva búsqueda</span>
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3 py-1.5 bg-[#6B1F32] text-white rounded hover:bg-[#501725] transition-colors"
                >
                  Volver arriba ↑
                </button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            query={currentQuery}
            onReset={handleResetHome}
            onSelectSuggestion={handlePerformSearch}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigation}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
      />

      {/* Article Reader Modal (Simulated preview) */}
      {activeArticleModal && (
        <ArticleModal
          item={activeArticleModal}
          onClose={() => setActiveArticleModal(null)}
        />
      )}

      {/* History & Bookmarks Drawer/Modal */}
      <SearchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelectSearch={handlePerformSearch}
        onRemoveItem={handleRemoveHistoryItem}
        onClearHistory={handleClearAllHistory}
        onToggleSave={handleToggleSaveById}
        initialTab={historyModalTab}
      />

      {/* Methodology & Editorial Principles Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
