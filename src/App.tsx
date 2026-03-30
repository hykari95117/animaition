import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
// ─── Components ───────────────────────────────────────────────────────────────
import ScoreBadge from "./component/ScoreBadge";
import AnimeCard from "./component/AnimeCard";
import Modal from "./component/Modal";
import WatchListPage from "./component/WatchListPage";
import RankingPage from "./component/RankingPage";
import GenrePage from "./component/GenrePage";
// ─── type ───────────────────────────────────────────────────────────────
/**
  * 타입'만' 가져올 때는 import type을 명시해 컴파일러가 해당 코드를 최종 javascript 결과물에서 제거하도록 한다.
  * why?
  * 타입/인터페이스는 런타임에 존재하지 않는 컴파일 전용 정보이기에 Vite가 일반 import로는 못 찾는 경우가 있다.
  * import type을 쓰면 번들러에게 "이건 타입만 가져오는 거야"라고 명시해줘서 정상 동작한다.
  */
import type { Anime, AniListResponse, AnimeStatus, AnimeFormat, AnimeSeason } from './types';
import "./App.css";
// ─── Constants ────────────────────────────────────────────────────────────────
import { ANILIST_API, SEARCH_QUERY, GET_TOP_ANIME_QUERY, STATUS_LABEL, FORMAT_LABEL, SEASON_LABEL } from './constants';
// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  // 검색 내용
  const [query, setQuery] = useState<string>("");
  // 검색 결과
  const [results, setResults] = useState<Anime[]>([]);
  // 검색 결과 조회 중 표시
  const [loading, setLoading] = useState<boolean>(false);
  // 검색 중 오류 발생 여부
  const [error, setError] = useState<string | null>(null);
  // 애니메이션 목록 중 선택한 것(클릭한 것))
  const [selected, setSelected] = useState<Anime | null>(null);
  // 검색 했는지 안 했는지
  const [searched, setSearched] = useState<boolean>(false);
  // 랭킹 TOP 10 애니
  const [topAnimes, setTopAnimes] = useState<Anime[]>([]);
  // 캐러셀 2~10위 시작 인덱스 (rest 배열 기준)
  const [carouselIdx, setCarouselIdx] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement>(null);
  // AnimeCard 컴포넌트 클릭 시 호출되는 함수
  // useCallback - 함수 자체를 메모이제이션, 함수를 반환
  // useMemo - 계산 결과값을 메모이제이션, 값을 반환
  const handleSelectAnime = useCallback((anime: Anime): void => {
    setSelected(anime)
  }, []);

  useEffect(() => {
    const fetchTopAnime = async (): Promise<void> => {
      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: GET_TOP_ANIME_QUERY }),
        });
        const data: AniListResponse = await res.json();
        setTopAnimes(data.data.Page.media);
      } catch (e) {
        console.error("랭킹 조회 실패:", e);
      }
    };
    fetchTopAnime();
  }, []);

  // 캐러셀 인덱스 변경 시 smooth scroll
  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    // 아이템 1개 + gap(12px)의 이동 폭: (clientWidth + 12) / 3
    el.scrollTo({ left: carouselIdx * (el.clientWidth + 12) / 3, behavior: "smooth" });
  }, [carouselIdx]);

  // 검색
  const search = useCallback(async (q: string): Promise<void> => {
    if (!q.trim()) {
      return;
    }
    setLoading(true); setError(null); setSearched(true);
    try {
      const res = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: q, page: 1 } }),
      });
      const data: AniListResponse = await res.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      setResults(data.data.Page.media);
    } catch {
      setError("검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 검색 input 칸에서 Enter key 입력 시 발생
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") search(query);
  };

  return (
    <div className="app">
      <div className="top-right-buttons">
        <button className="top-btn" onClick={() => navigate("/")}>HOME</button>
        <button className="top-btn" onClick={() => navigate("/ranking")}>🏆 랭킹</button>
        <button className="top-btn" onClick={() => navigate("/genre")}>🎭 장르</button>
        <button className="top-btn" onClick={() => navigate("/liked")}>👍 좋아요</button>
        <button className="top-btn top-btn--watched" onClick={() => navigate("/watched")}>
          <span>✔</span> <span className="top-btn__label">봤어요</span>
        </button>
      </div>
      <Routes>
        <Route path="/" element={
          <>
            <div className="header">
              <div className="header__label">Anime Search</div>
              <h1 className="header__title">어떤 애니 찾아?</h1>
              <p className="header__subtitle">AniList 기반 애니메이션 검색 · 상세정보 확인</p>
            </div>
            {!searched && topAnimes.length > 0 && (() => {
              const first = topAnimes[0];
              const rest = topAnimes.slice(1);
              return (
                <>
                  <div
                    className="top-ranked-banner"
                    style={{ "--accent": first.coverImage.color ?? "#6366f1" } as React.CSSProperties}
                    onClick={() => setSelected(first)}
                  >
                    <div
                      className="top-ranked-banner__bg"
                      style={{ backgroundImage: `url(${first.bannerImage ?? first.coverImage.large})` }}
                    />
                    <div className="top-ranked-banner__overlay" />
                    <div className="top-ranked-banner__content">
                      <span className="top-ranked-banner__label">지금 가장 핫한 애니</span>
                      <p className="top-ranked-banner__title">
                        {first.title.english ?? first.title.romaji ?? first.title.native}
                      </p>
                    </div>
                  </div>
                  {rest.length > 0 && (
                    <div className="ranking-carousel">
                      <p className="ranking-carousel__heading">TOP 10</p>
                      <div className="ranking-carousel__nav">
                        <button
                          className="ranking-carousel__arrow"
                          onClick={() => setCarouselIdx(i => Math.max(0, i - 3))}
                          disabled={carouselIdx === 0}
                        >‹</button>
                        <div className="ranking-carousel__track" ref={trackRef}>
                          {rest.map((anime, idx) => {
                            const rank = idx + 2;
                            const title = anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
                            return (
                              <div key={anime.id} className="ranking-carousel__item" onClick={() => setSelected(anime)}>
                                <div
                                  className="ranking-carousel__img-wrap"
                                  style={{ backgroundImage: `url(${anime.bannerImage ?? anime.coverImage.large})` }}
                                >
                                  <div className="ranking-carousel__overlay" />
                                  <span className="ranking-carousel__rank-num">{rank}</span>
                                  <div className="ranking-carousel__content">
                                    <span className="ranking-carousel__rank-label">{rank}위</span>
                                    <p className="ranking-carousel__title">{title}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          className="ranking-carousel__arrow"
                          onClick={() => setCarouselIdx(i => Math.min(rest.length - 3, i + 3))}
                          disabled={carouselIdx + 3 >= rest.length}
                        >›</button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
              {searched && !loading && results.length === 0 && !error && (
                <div className="empty-no-results">검색 결과가 없어요 😢</div>
              )}
              {results.length > 0 && (
                <>
                  <div className="results__count">{results.length}개의 결과</div>
                  <div className="results__grid">
                    {results.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} onClick={handleSelectAnime} />
                    ))}
                  </div>
                </>
              )}
            </div>
            <Modal anime={selected} onClose={() => setSelected(null)} />
          </>
        } />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/genre" element={<GenrePage />} />
        <Route path="/liked" element={<WatchListPage type="liked" />} />
        <Route path="/watched" element={<WatchListPage type="watched" />} />
      </Routes>
    </div>
  );
}
