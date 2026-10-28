import React from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import type { MorningSummarySnapshot } from '../types';

interface MorningSummaryCardProps {
  result: MorningSummarySnapshot;
}

const cleanMarkdown = (summary: string) => summary.split(/\r?\n/).map((line) => {
  const heading = line.match(/^#{1,6}\s*(.*)$/);
  if (!heading) return line;

  const title = heading[1].trim();
  const numberedTitle = title.match(/^(\d+)\.?\s*(.*)$/);
  if (numberedTitle) {
    return `**${numberedTitle[1]}${numberedTitle[2] ? `. ${numberedTitle[2]}` : ''}**`;
  }
  return `**${title}**`;
}).join('\n');

const renderInlineMarkdown = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });

const renderSummary = (summary: string) => cleanMarkdown(summary).split(/\r?\n/).map((line, index) => {
  if (!line.trim()) return <div key={index} className="h-3" />;
  if (/^-{3,}$/.test(line.trim())) return <hr key={index} className="my-2 border-[#E8E4DD]" />;

  const boldHeading = line.match(/^\*\*(.+)\*\*$/);
  if (boldHeading) {
    return (
      <h3 key={index} className="mt-4 text-sm font-bold text-[#1C1C1C] first:mt-0">
        {boldHeading[1]}
      </h3>
    );
  }

  const bullet = line.match(/^\s*[-*]\s+(.+)$/);
  if (bullet) {
    return (
      <p key={index} className="pl-4 text-sm leading-6 text-[#444444]">
        <span className="-ml-4 mr-2" aria-hidden="true">•</span>
        {renderInlineMarkdown(bullet[1])}
      </p>
    );
  }

  return <p key={index} className="text-sm leading-6 text-[#444444]">{renderInlineMarkdown(line)}</p>;
});

export const MorningSummaryCard: React.FC<MorningSummaryCardProps> = ({ result }) => {
  const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(result.videoId)}`;
  const generatedAt = new Date(result.createdAt);
  const dateLabel = Number.isNaN(generatedAt.getTime())
    ? result.createdAt
    : new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(generatedAt);

  const downloadSummary = () => {
    const markdown = [
      '**Resumen de la mañanera**',
      `Fecha: ${dateLabel}`,
      `Video: ${videoUrl}`,
      '',
      cleanMarkdown(result.summary),
      '',
    ].join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    const filenameDate = Number.isNaN(generatedAt.getTime())
      ? new Date().toISOString().slice(0, 10)
      : generatedAt.toISOString().slice(0, 10);
    anchor.download = `resumen-mananera-${filenameDate}.md`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <article className="mx-auto max-w-4xl overflow-hidden rounded-md border border-[#DDD8CF] bg-white shadow-sm">
      <div className="p-5 sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E8E4DD] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B99A5B]">
              Edición de la mañanera
            </span>
            <h2 className="mt-1 text-xl font-serif font-black text-[#1C1C1C]">
              Resumen del video
            </h2>
            <p className="mt-1 text-xs text-[#777777]">{dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={downloadSummary}
            title="Descargar resumen en Markdown"
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#DDD8CF] text-[#6B1F32] transition hover:border-[#6B1F32] hover:bg-[#F4E8EB]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Descargar resumen</span>
          </button>
        </header>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#777777]">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Transcripción: {result.transcriptLength.toLocaleString('es-MX')} caracteres</span>
        </div>
        <section className="mt-5 space-y-1" aria-label="Síntesis de la mañanera">
          {renderSummary(result.summary)}
        </section>
      </div>

      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        className="mx-5 mb-5 grid max-w-xl grid-cols-[140px_minmax(0,1fr)] items-center gap-3 rounded-md border border-[#DDD8CF] bg-[#FAF8F5] p-3 transition hover:border-[#6B1F32] sm:mx-7 sm:mb-7 sm:grid-cols-[180px_minmax(0,1fr)]"
      >
        <img
          src={`https://i.ytimg.com/vi/${encodeURIComponent(result.videoId)}/hqdefault.jpg`}
          alt="Miniatura horizontal del video de la mañanera"
          className="aspect-video w-full rounded-sm bg-[#1C1C1C] object-cover"
        />
        <span className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#B99A5B]">
            Video de origen
          </span>
          <span className="mt-1 block text-sm font-semibold text-[#1C1C1C]">
            Ver video en YouTube
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#6B1F32]">
            Abrir enlace <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </a>
    </article>
  );
};