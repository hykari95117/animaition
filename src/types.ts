export interface AnimeTitle {
  romaji: string | null;
  native: string | null;
  english: string | null;
}

export interface CoverImage {
  large: string;
  color: string | null;
}

export interface Studio {
  name: string;
}

export interface Studios {
  nodes: Studio[];
}

export type AnimeStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
export type AnimeFormat = "TV" | "TV_SHORT" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
export type AnimeSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: CoverImage;
  bannerImage: string | null;
  genres: string[];
  averageScore: number | null;
  episodes: number | null;
  status: AnimeStatus | null;
  season: AnimeSeason | null;
  seasonYear: number | null;
  description: string | null;
  studios: Studios;
  format: AnimeFormat | null;
  popularity?: number;
  trending?: number;
  favourites?: number;
}

export interface AniListResponse {
  data: {
    Page: {
      pageInfo: {
        total: number;
        currentPage: number;
        hasNextPage: boolean;
      };
      media: Anime[];
    };
  };
  errors?: { message: string }[];
}
