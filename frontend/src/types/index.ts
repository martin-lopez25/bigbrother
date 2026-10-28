/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlatformType = 'all' | 'web' | 'youtube' | 'instagram' | 'meta' | 'x' | 'bilibili' | 'reddit' | 'otros';

export type ContentClassification = 'hecho' | 'opinion' | 'por_confirmar' | 'analisis' | 'extracto';
export type SourcePlatform = Exclude<PlatformType, 'all'>;

export interface BackendSourceStatus {
  name: string;
  status: 'pending' | 'ok' | 'error' | 'setup_required';
  count: number;
  error?: string;
}

export interface BackendSearchResult {
  id: string;
  source: string;
  sourceKey: string;
  title: string;
  url: string;
  domain: string;
  publisher?: string;
  excerpt: string;
  publishedAt?: string | null;
  points?: number | null;
  views?: number | null;
  videoId?: string;
}

export interface BackendSearchResponse {
  query: string;
  queriedAt: string;
  results: BackendSearchResult[];
  sources: Record<string, BackendSourceStatus>;
  summary: string;
  keywords: string[];
  facts: string[];
}

export interface SourceReference {
  id: string;
  citationIndex: number;
  name: string;
  platform: SourcePlatform;
  title: string;
  date: string;
  url: string;
  type: string;
  authorOrOutlet: string;
  reputation: 'Oficial' | 'Medio verificado' | 'Especialista' | 'Comunidad' | 'No evaluada';
}

export interface PublicationItem {
  id: string;
  platform: SourcePlatform;
  title: string;
  summary: string;
  sourceName: string;
  authorHandle?: string;
  publishedAt: string;
  sortDate?: string;
  url: string;
  imageUrl?: string;
  contentType: 'noticia' | 'opinion' | 'video' | 'social' | 'investigacion';
  tags: string[];
  citationNumber: number;
  videoId?: string;
  duration?: string; // For YouTube
  metrics?: {
    reposts?: number;
    likes?: number;
    views?: number;
    comments?: number;
  };
  postType?: 'Reel' | 'Carrusel' | 'Foto' | 'Post'; // For Instagram
}

export interface KeyFinding {
  id: string;
  text: string;
  citations: number[];
  category: ContentClassification;
}

export interface Perspective {
  title: string;
  stance: string;
  sources: string[];
  citations: number[];
}

export interface UnconfirmedPoint {
  claim: string;
  status: 'En verificación' | 'Datos insuficientes' | 'Versiones contradictorias';
  note: string;
  citations: number[];
}

export interface SummaryData {
  overview: string;
  keyPoints: KeyFinding[];
  context: string;
  perspectives: Perspective[];
  unconfirmed: UnconfirmedPoint[];
}

export interface PlatformCounts {
  all: number;
  web: number;
  youtube: number;
  instagram: number;
  meta?: number;
  x: number;
  bilibili?: number;
  reddit?: number;
  otros: number;
}

export interface SearchResultData {
  query: string;
  timestamp: string;
  totalResults: number;
  platformDistribution: PlatformCounts;
  summary: SummaryData;
  items: PublicationItem[];
  sources: SourceReference[];
  methodology: {
    step: number;
    title: string;
    description: string;
  }[];
  sourceStatuses?: Record<string, BackendSourceStatus>;
  sourceDiversity: {
    independentOutlets: number;
    distinctDomains?: number;
    platformCount: number;
    diversityRating: 'Alta' | 'Equilibrada' | 'En desarrollo';
    summaryNote: string;
  };
}

export interface MorningSummarySnapshot {
  videoId: string;
  summary: string;
  transcriptLength: number;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  isSaved?: boolean;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  volumeLabel: string;
  iconName: string;
  query: string;
}
