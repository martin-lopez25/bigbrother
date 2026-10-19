import {
  BackendSearchResponse,
  PlatformCounts,
  PublicationItem,
  SearchResultData,
  SourcePlatform,
  SourceReference,
} from '../types';

const platformBySource: Record<string, SourcePlatform> = {
  news: 'web',
  hackernews: 'web',
  wikipedia: 'web',
  youtube: 'youtube',
  bilibili: 'bilibili',
  instagram: 'instagram',
  reddit: 'reddit',
  twitter: 'x',
  facebook: 'meta',
  xiaohongshu: 'otros',
};

const setupMessages: Record<string, string> = {
  instagram: 'Instagram Explore requiere OpenCLI, la extensión de Chrome y una sesión iniciada manualmente. El contenido es personalizado a esa cuenta.',
  reddit: 'Reddit no tiene búsqueda anónima disponible aquí. Requiere OpenCLI y una sesión iniciada en Chrome.',
  twitter: 'X requiere twitter-cli con credenciales locales o OpenCLI con una sesión de Chrome iniciada.',
  facebook: 'Facebook requiere OpenCLI y una sesión de Chrome iniciada manualmente.',
  xiaohongshu: 'XiaoHongShu requiere OpenCLI con una sesión de Chrome ya controlada por ti.',
};

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const PUBLIC_API_MODE = import.meta.env.VITE_PUBLIC_API_MODE === 'true';
const PUBLIC_SOURCES = 'news,hackernews,wikipedia,youtube,bilibili';
const LOCAL_SOURCES = `${PUBLIC_SOURCES},instagram,reddit,twitter,facebook,xiaohongshu`;

function localizeSourceError(sourceKey: string, status: string, error?: string): string | undefined {
  if (status === 'setup_required') {
    return setupMessages[sourceKey] || 'Este canal requiere configuración local antes de buscar.';
  }
  if (status === 'error') {
    return `El backend de ${sourceKey} no respondió. Revisa su estado con agent-reach doctor --json.`;
  }
  return error;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function citationFor(text: string, results: BackendSearchResponse['results']): number[] {
  const words = new Set(
    text.toLocaleLowerCase('es').match(/[\p{L}\p{N}]{5,}/gu) ?? [],
  );
  if (!words.size) return results.length ? [1] : [];

  let bestIndex = 0;
  let bestScore = 0;
  results.forEach((result, index) => {
    const sourceWords = new Set(
      `${result.title} ${result.excerpt}`.toLocaleLowerCase('es').match(/[\p{L}\p{N}]{5,}/gu) ?? [],
    );
    const score = [...words].filter((word) => sourceWords.has(word)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return results.length ? [bestIndex + 1] : [];
}

export function adaptSearchResponse(response: BackendSearchResponse): SearchResultData {
  const sourceReferences: SourceReference[] = response.results.map((result, index) => ({
    id: result.id,
    citationIndex: index + 1,
    name: result.source,
    platform: platformBySource[result.sourceKey] ?? 'otros',
    title: result.title,
    date: formatDate(result.publishedAt),
    url: result.url,
    type: 'Resultado público de búsqueda',
    authorOrOutlet: result.publisher || result.domain,
    reputation: 'No evaluada',
  }));

  const items: PublicationItem[] = response.results.map((result, index) => ({
    id: result.id,
    platform: platformBySource[result.sourceKey] ?? 'otros',
    title: result.title,
    summary: result.excerpt || result.title,
    sourceName: result.publisher || result.source,
    authorHandle: result.publisher,
    publishedAt: formatDate(result.publishedAt),
    sortDate: result.publishedAt ?? undefined,
    url: result.url,
    contentType: result.sourceKey === 'youtube' || result.sourceKey === 'bilibili'
      ? 'video'
      : result.sourceKey === 'instagram' || result.sourceKey === 'reddit'
        ? 'social'
        : 'noticia',
    tags: [result.source],
    citationNumber: index + 1,
    videoId: result.videoId,
    metrics: result.views != null ? { views: result.views } : undefined,
  }));

  const summaryLines = response.summary
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[•*-]\s*/, '').trim())
    .filter(Boolean);
  const summaryPoints = summaryLines.map((text, index) => ({
    id: `extract-${index + 1}`,
    text,
    citations: citationFor(text, response.results),
    category: 'extracto' as const,
  }));

  const counts: PlatformCounts = {
    all: items.length,
    web: items.filter((item) => item.platform === 'web').length,
    youtube: items.filter((item) => item.platform === 'youtube').length,
    instagram: items.filter((item) => item.platform === 'instagram').length,
    meta: items.filter((item) => item.platform === 'meta').length,
    x: items.filter((item) => item.platform === 'x').length,
    bilibili: items.filter((item) => item.platform === 'bilibili').length,
    reddit: items.filter((item) => item.platform === 'reddit').length,
    otros: items.filter((item) => item.platform === 'otros').length,
  };

  const activePlatforms = new Set(items.map((item) => item.platform));
  const distinctDomains = new Set(response.results.map((result) => result.domain).filter(Boolean)).size;
  const activeSources = Object.values(response.sources).filter((source) => source.status === 'ok');
  const sourceStatuses = Object.fromEntries(
    Object.entries(response.sources).map(([key, source]) => [
      key,
      { ...source, error: localizeSourceError(key, source.status, source.error) },
    ]),
  );
  const timestamp = new Date(response.queriedAt);

  return {
    query: response.query,
    timestamp: Number.isNaN(timestamp.getTime())
      ? 'Consulta reciente'
      : new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp),
    totalResults: items.length,
    platformDistribution: counts,
    summary: {
      overview: `Se recopilaron ${items.length} resultados de ${activeSources.length} fuentes disponibles. La síntesis siguiente selecciona fragmentos; no verifica afirmaciones de forma independiente.`,
      keyPoints: summaryPoints,
      context: `Consulta: «${response.query}». Abre cada publicación para leer el contexto completo y contrastar la información original.`,
      perspectives: [],
      unconfirmed: [],
    },
    items,
    sources: sourceReferences,
    methodology: [
      {
        step: 1,
        title: 'Consulta de fuentes',
        description: `${activeSources.map((source) => `${source.name}: ${source.count}`).join(' · ') || 'Ninguna fuente respondió.'}`,
      },
      {
        step: 2,
        title: 'Resultados públicos',
        description: 'Se combinaron y deduplicaron enlaces devueltos por los backends disponibles.',
      },
      {
        step: 3,
        title: 'Síntesis local',
        description: 'Los extractos se seleccionan con reglas locales; no se usa un modelo generativo.',
      },
      {
        step: 4,
        title: 'Revisión en la fuente original',
        description: 'Consulta los enlaces originales antes de considerar una afirmación confirmada.',
      },
    ],
    sourceStatuses,
    sourceDiversity: {
      independentOutlets: distinctDomains,
      distinctDomains,
      platformCount: activePlatforms.size,
      diversityRating: activePlatforms.size >= 4 ? 'Alta' : activePlatforms.size >= 2 ? 'Equilibrada' : 'En desarrollo',
      summaryNote: 'Se cuentan dominios y plataformas; no se evalúa independencia ni reputación editorial.',
    },
  };
}

export async function searchDashboard(query: string, signal?: AbortSignal): Promise<SearchResultData> {
  const params = new URLSearchParams({
    q: query,
    sources: PUBLIC_API_MODE ? PUBLIC_SOURCES : LOCAL_SOURCES,
  });
  const response = await fetch(`${API_BASE_URL}/api/search?${params}`, { signal });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(
      'El servidor de búsqueda no está disponible. Comprueba la URL de la API y vuelve a intentarlo.',
    );
  }
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo completar la búsqueda.');
  }
  return adaptSearchResponse(payload as BackendSearchResponse);
}