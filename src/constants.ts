export const ANILIST_API = "https://api.anilist.co/graphql";

export const SEARCH_QUERY = `
  query SearchAnime($search: String!, $page: Int) {
    Page(page: $page, perPage: 20) {
      pageInfo { total currentPage hasNextPage }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji native english }
        coverImage { large color }
        bannerImage
        genres
        averageScore
        episodes
        status
        season
        seasonYear
        description(asHtml: false)
        studios(isMain: true) { nodes { name } }
        format
      }
    }
  }
`;

export const STATUS_LABEL: Record<AnimeStatus, string> = {
  FINISHED: "완결",
  RELEASING: "방영중",
  NOT_YET_RELEASED: "방영예정",
  CANCELLED: "취소",
  HIATUS: "휴재",
};

export const FORMAT_LABEL: Record<AnimeFormat, string> = {
  TV: "TV",
  TV_SHORT: "TV단편",
  MOVIE: "극장판",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "스페셜",
};

export const SEASON_LABEL: Record<AnimeSeason, string> = {
  WINTER: "겨울",
  SPRING: "봄",
  SUMMER: "여름",
  FALL: "가을",
};
