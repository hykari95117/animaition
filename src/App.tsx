import { useState, useCallback, KeyboardEvent } from "react";
import "./App.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnimeTitle {
  romaji: string | null;
  native: string | null;
  english: string | null;
}

interface CoverImage {
  large: string;
  color: string | null;
}

interface Studio {
  name: string;
}

interface Studios {
  nodes: Studio[];
}

type AnimeStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
type AnimeFormat = "TV" | "TV_SHORT" | "MOVIE" | "OVA" | "ONA" | "SPECIAL";
type AnimeSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

interface Anime {
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
}

interface AniListResponse {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const ANILIST_API = "https://api.anilist.co/graphql";

const SEARCH_QUERY = `
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

const STATUS_LABEL: Record<AnimeStatus, string> = {
  FINISHED: "완결",
  RELEASING: "방영중",
  NOT_YET_RELEASED: "방영예정",
  CANCELLED: "취소",
  HIATUS: "휴재",
};

const FORMAT_LABEL: Record<AnimeFormat, string> = {
  TV: "TV",
  TV_SHORT: "TV단편",
  MOVIE: "극장판",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "스페셜",
};

const SEASON_LABEL: Record<AnimeSeason, string> = {
  WINTER: "겨울",
  SPRING: "봄",
  SUMMER: "여름",
  FALL: "가을",
};

// ─── Components ───────────────────────────────────────────────────────────────

interface ScoreBadgeProps {
  score: number | null;
}

function ScoreBadge({ score }: ScoreBadgeProps) {
  if (!score) return null;
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171";
  return (
    <span className="score-badge" style={{ background: color }}>
      ★ {score}
    </span>
  );
}

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
}

function AnimeCard({ anime, onClick }: AnimeCardProps) {
  const title =
    anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
  const accent = anime.coverImage.color ?? "#6366f1";

  return (
    <div
      className="anime-card"
      onClick={() => onClick(anime)}
      style={{
        "--accent": accent,
        "--accent-shadow": `${accent}33`,
        "--accent-light": `${accent}22`,
      } as React.CSSProperties}
    >
      <div className="anime-card__image-wrap">
        <img className="anime-card__image" src={anime.coverImage.large} alt={title} />
        <div className="anime-card__gradient" />
        <div className="anime-card__score-wrap">
          <ScoreBadge score={anime.averageScore} />
        </div>
        {anime.status === "RELEASING" && (
          <div className="anime-card__on-air">방영중</div>
        )}
      </div>
      <div className="anime-card__info">
        <div className="anime-card__title">{title}</div>
        <div className="anime-card__tags">
          {anime.genres.slice(0, 2).map((g) => (
            <span key={g} className="tag-genre">{g}</span>
          ))}
          {anime.format && (
            <span className="tag-format">{FORMAT_LABEL[anime.format]}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  anime: Anime | null;
  onClose: () => void;
}

function Modal({ anime, onClose }: ModalProps) {
  if (!anime) return null;

  const title = anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
  const accent = anime.coverImage.color ?? "#6366f1";
  const studio = anime.studios?.nodes?.[0]?.name;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          "--accent": accent,
          "--accent-border": `${accent}44`,
          "--accent-shadow": `${accent}22`,
          "--accent-light": `${accent}22`,
        } as React.CSSProperties}
      >
        {anime.bannerImage && (
          <div className="modal__banner">
            <img className="modal__banner-img" src={anime.bannerImage} alt="" />
            <div className="modal__banner-gradient" />
          </div>
        )}
        <div className="modal__body">
          <img className="modal__cover" src={anime.coverImage.large} alt={title} />
          <div className="modal__details">
            <div className="modal__title">{title}</div>
            {anime.title.native && (
              <div className="modal__native">{anime.title.native}</div>
            )}
            <div className="modal__badges">
              <ScoreBadge score={anime.averageScore} />
              {anime.status && (
                <span className="modal__badge-status">
                  {STATUS_LABEL[anime.status]}
                </span>
              )}
              {anime.format && (
                <span className="modal__badge-format">
                  {FORMAT_LABEL[anime.format]}
                </span>
              )}
            </div>
            <div className="modal__meta">
              {anime.episodes && (
                <div>
                  <div className="modal__meta-label">에피소드</div>
                  <div className="modal__meta-value">{anime.episodes}화</div>
                </div>
              )}
              {anime.seasonYear && (
                <div>
                  <div className="modal__meta-label">방영 시기</div>
                  <div className="modal__meta-value">
                    {anime.seasonYear} {anime.season ? SEASON_LABEL[anime.season] : ""}
                  </div>
                </div>
              )}
              {studio && (
                <div>
                  <div className="modal__meta-label">제작사</div>
                  <div className="modal__meta-value">{studio}</div>
                </div>
              )}
            </div>
            <div className="modal__genres">
              {anime.genres.map((g) => (
                <span key={g} className="modal__genre-tag">{g}</span>
              ))}
            </div>
          </div>
        </div>
        {anime.description && (
          <div className="modal__desc-section">
            <div className="modal__divider" />
            <div className="modal__description">
              {anime.description.replace(/<[^>]*>/g, "").slice(0, 400)}
              {anime.description.length > 400 ? "..." : ""}
            </div>
          </div>
        )}
        <div className="modal__link-section">
          <a
            className="modal__link"
            href={`https://anilist.co/anime/${anime.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            AniList에서 보기 →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Anime | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const search = useCallback(async (q: string): Promise<void> => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: q, page: 1 } }),
      });
      const data: AniListResponse = await res.json();
      if (data.errors) throw new Error(data.errors[0].message);
      setResults(data.data.Page.media);
    } catch {
      setError("검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") search(query);
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header__label">Anime Search</div>
        <h1 className="header__title">어떤 애니 찾아?</h1>
        <p className="header__subtitle">AniList 기반 애니메이션 검색 · 상세정보 확인</p>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="제목을 입력하세요 (한글/영어/일어)"
        />
        <button
          className="search-button"
          onClick={() => search(query)}
          disabled={loading}
        >
          {loading ? "..." : "검색"}
        </button>
      </div>

      <div className="results">
        {error && <div className="empty-error">{error}</div>}
        {!searched && !loading && (
          <div className="empty-hint">검색어를 입력하고 Enter를 눌러보세요</div>
        )}
        {searched && !loading && results.length === 0 && !error && (
          <div className="empty-no-results">검색 결과가 없어요 😢</div>
        )}
        {results.length > 0 && (
          <>
            <div className="results__count">{results.length}개의 결과</div>
            <div className="results__grid">
              {results.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} onClick={setSelected} />
              ))}
            </div>
          </>
        )}
      </div>

      <Modal anime={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
