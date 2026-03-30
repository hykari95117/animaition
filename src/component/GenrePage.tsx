import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Anime, AniListResponse } from '../types';
import { ANILIST_API, GET_GENRE_ANIME_QUERY, GENRE_LIST } from '../constants';
import Modal from './Modal';

const ITEMS_PER_PAGE = 5;

const GenrePage = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [cache, setCache] = useState<Record<string, Anime[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [hasNextMap, setHasNextMap] = useState<Record<string, boolean>>({});
  const [pageMap, setPageMap] = useState<Record<string, number>>({});
  const [carouselIdxMap, setCarouselIdxMap] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Anime | null>(null);

  const trackRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // fetch 중복 호출 방지용 ref (state 업데이트 비동기 때문에 ref로 관리)
  const isFetchingRef = useRef<Record<string, boolean>>({});

  const fetchPage = (genre: string, page: number): void => {
    if (isFetchingRef.current[genre]) return;
    isFetchingRef.current[genre] = true;
    setLoadingMap(prev => ({ ...prev, [genre]: true }));

    fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: GET_GENRE_ANIME_QUERY, variables: { genre, page } }),
    })
      .then(res => res.json())
      .then((data: AniListResponse) => {
        setCache(prev => ({ ...prev, [genre]: [...(prev[genre] ?? []), ...data.data.Page.media] }));
        setHasNextMap(prev => ({ ...prev, [genre]: data.data.Page.pageInfo.hasNextPage }));
        setPageMap(prev => ({ ...prev, [genre]: page }));
      })
      .catch(e => console.error("장르 조회 실패:", e))
      .finally(() => {
        isFetchingRef.current[genre] = false;
        setLoadingMap(prev => ({ ...prev, [genre]: false }));
      });
  };

  const toggleGenre = (genre: string): void => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
      return;
    }
    setSelectedGenres(prev => [...prev, genre]);
    if (!cache[genre]) {
      fetchPage(genre, 1);
    }
  };

  const handleScroll = (genre: string): void => {
    const el = trackRefs.current[genre];
    if (!el || isFetchingRef.current[genre] || !hasNextMap[genre]) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 150) {
      fetchPage(genre, (pageMap[genre] ?? 1) + 1);
    }
  };

  const handleNav = (genre: string, direction: "prev" | "next"): void => {
    const el = trackRefs.current[genre];
    if (!el) return;
    const current = carouselIdxMap[genre] ?? 0;
    const total = cache[genre]?.length ?? 0;
    const newIdx = direction === "prev"
      ? Math.max(0, current - ITEMS_PER_PAGE)
      : Math.min(total - ITEMS_PER_PAGE, current + ITEMS_PER_PAGE);
    setCarouselIdxMap(prev => ({ ...prev, [genre]: newIdx }));
    el.scrollTo({ left: newIdx * (el.clientWidth + 12) / ITEMS_PER_PAGE, behavior: "smooth" });
  };

  return (
    <div className="genre-page">
      <div className="watchlist-page__header">
        <button className="watchlist-page__back" onClick={() => navigate(-1)}>← 뒤로</button>
        <h2 className="watchlist-page__title">장르별 탐색</h2>
      </div>

      <div className="genre-page__chips">
        {GENRE_LIST.map(genre => (
          <button
            key={genre}
            className={`genre-chip${selectedGenres.includes(genre) ? " genre-chip--active" : ""}`}
            onClick={() => toggleGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      {selectedGenres.length === 0 ? (
        <div className="watchlist-page__empty">장르를 선택하면 역대 평점 Top 20 애니를 보여줘요</div>
      ) : (
        <div className="genre-page__sections">
          {selectedGenres.map(genre => {
            const animes = cache[genre] ?? [];
            const isInitialLoading = loadingMap[genre] && animes.length === 0;
            const isLoadingMore = loadingMap[genre] && animes.length > 0;
            const idx = carouselIdxMap[genre] ?? 0;

            return (
              <div key={genre} className="genre-section">
                <div className="genre-section__header">
                  <span className="genre-section__name">{genre}</span>
                  <span className="genre-section__sub">
                    평점순 {animes.length}개{hasNextMap[genre] ? "+" : ""}
                  </span>
                </div>

                {isInitialLoading ? (
                  <div className="genre-section__loading">불러오는 중...</div>
                ) : (
                  <div className="genre-carousel">
                    <button
                      className="ranking-carousel__arrow"
                      onClick={() => handleNav(genre, "prev")}
                      disabled={idx === 0}
                    >‹</button>
                    <div
                      className="genre-carousel__track"
                      ref={el => { trackRefs.current[genre] = el; }}
                      onScroll={() => handleScroll(genre)}
                    >
                      {animes.map(anime => {
                        const title = anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
                        return (
                          <div key={anime.id} className="genre-carousel__item" onClick={() => setSelected(anime)}>
                            <div className="genre-carousel__img-wrap">
                              <img className="genre-carousel__img" src={anime.coverImage.large} alt={title} />
                              {anime.averageScore && (
                                <span className="genre-carousel__score">{anime.averageScore}</span>
                              )}
                            </div>
                            <p className="genre-carousel__title">{title}</p>
                          </div>
                        );
                      })}
                      {isLoadingMore && (
                        <div className="genre-carousel__item genre-carousel__item--loading">
                          <div className="genre-carousel__img-wrap genre-carousel__img-wrap--skeleton" />
                          <p className="genre-carousel__title genre-carousel__title--skeleton" />
                        </div>
                      )}
                    </div>
                    <button
                      className="ranking-carousel__arrow"
                      onClick={() => handleNav(genre, "next")}
                      disabled={idx + ITEMS_PER_PAGE >= animes.length}
                    >›</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal anime={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default GenrePage;
