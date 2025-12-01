
export interface AnimeRecommendation {
  title: string;
  romajiTitle: string;
  year: string;
  studio: string;
  genres: string[];
  format: string;
  synopsis: string;
  reason: string;
  imageUrl: string;
  sourceUrl: string; // MyAnimeList or AniList link
  score: string; // e.g. "8.5/10" or "85%"
}

export type SearchMode = 'strict' | 'creative';

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  results: AnimeRecommendation[];
  hasSearched: boolean;
}
