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
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  results: AnimeRecommendation[];
  hasSearched: boolean;
}