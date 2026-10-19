/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  ExternalLink,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PublicationItem, SourceReference } from '../types';
import {
  InternetLogo,
  YouTubeLogo,
  InstagramLogo,
  MetaLogo,
  XLogo,
} from './PlatformIcons';

interface ArticleModalProps {
  item: PublicationItem | SourceReference | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const isPublication = 'contentType' in item;
  const platform = item.platform;

  const getPlatformIcon = () => {
    switch (platform) {
      case 'web':
        return (
          <div className="flex items-center gap-1">
            <InternetLogo className="w-4 h-4 text-[#6B1F32]" />
          </div>
        );
      case 'youtube':
        return (
          <div className="flex items-center gap-1">
            <YouTubeLogo className="w-4 h-4 text-[#E50914]" />
            <InternetLogo className="w-3 h-3 text-[#777777]" />
          </div>
        );
      case 'instagram':
        return (
          <div className="flex items-center gap-1">
            <InstagramLogo className="w-4 h-4 text-[#C13584]" />
            <MetaLogo className="w-3 h-3 text-[#0668E1]" />
            <InternetLogo className="w-3 h-3 text-[#777777]" />
          </div>
        );
      case 'meta':
        return (
          <div className="flex items-center gap-1">
            <MetaLogo className="w-4 h-4 text-[#0668E1]" />
            <InternetLogo className="w-3 h-3 text-[#777777]" />
          </div>
        );
      case 'bilibili':
        return <span className="text-xs font-black text-[#C13584]">Bilibili</span>;
      case 'reddit':
        return <span className="text-xs font-black text-[#D05A2A]">Reddit</span>;
      case 'otros':
        return <InternetLogo className="w-4 h-4 text-[#777777]" />;
      case 'x':
        return (
          <div className="flex items-center gap-1">
            <XLogo className="w-4 h-4 text-[#1C1C1C]" />
            <InternetLogo className="w-3 h-3 text-[#777777]" />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <InternetLogo className="w-4 h-4 text-[#6B1F32]" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1C]/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#DDD8CF] w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E4DD] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-white border border-[#E8E4DD]">
              {getPlatformIcon()}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B99A5B]">
                {platform === 'web'
                  ? 'Artículo de prensa'
                  : platform === 'youtube'
                  ? 'Video de canal de análisis'
                  : platform === 'x'
                  ? 'Publicación en X'
                  : platform === 'instagram'
                  ? 'Instagram Explore'
                  : platform === 'meta'
                  ? 'Publicación de Facebook'
                  : platform === 'reddit'
                  ? 'Discusión de Reddit'
                  : platform === 'bilibili'
                  ? 'Video de Bilibili'
                  : 'Resultado web'}
              </span>
              <h3 className="text-xs font-bold text-[#1C1C1C]">
                {'sourceName' in item ? item.sourceName : item.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="Cerrar vista"
              className="p-1.5 text-[#777777] hover:text-[#1C1C1C] rounded hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-4">
          {/* Source and summary method */}
          <div className="bg-[#FAF8F5] border-l-3 border-[#B99A5B] p-3 text-xs text-[#777777] rounded-r">
            <span className="font-semibold text-[#1C1C1C]">Extracto disponible:</span>{' '}
            Abre el enlace original para leer el contexto completo. La fuente no ha sido verificada editorialmente.
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-serif font-black text-[#1C1C1C] leading-snug">
            {item.title}
          </h1>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#777777] border-y border-[#E8E4DD] py-2.5 font-sans">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{'publishedAt' in item ? item.publishedAt : item.date}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#777777]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Origen enlazado</span>
            </span>
          </div>

          {/* Image if available */}
          {isPublication && (item as PublicationItem).imageUrl && (
            <div className="w-full h-52 sm:h-64 rounded-md overflow-hidden bg-[#E8E4DD]">
              <img
                src={(item as PublicationItem).imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Summary / Content text */}
          <div className="space-y-3 font-serif text-sm sm:text-base text-[#1C1C1C] leading-relaxed">
            <p>
              {isPublication
                ? (item as PublicationItem).summary
                : 'Enlace de origen de uno o más extractos. Abre la fuente para revisar el contenido original.'}
            </p>
            <p className="text-xs font-sans text-[#777777]">
              Esta vista muestra el extracto devuelto por la fuente. El dashboard no afirma que sea el texto completo.
            </p>
          </div>

          {/* Tags */}
          {isPublication && (item as PublicationItem).tags && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {(item as PublicationItem).tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[#FAF8F5] text-[#777777] px-2.5 py-0.5 rounded border border-[#E8E4DD]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E4DD] flex items-center justify-between text-xs">
          <span className="text-[#777777] font-mono truncate max-w-[240px] sm:max-w-md">
            {item.url}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-[#6B1F32] hover:bg-[#501725] text-white font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Abrir fuente</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
