import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Anime, AniListResponse } from '../types';
import { ANILIST_API, GET_RANKING_QUERY } from '../constants';
import Modal from './Modal';

interface Tab {
  sort: string;
  label: string;
  metric: (a: Anime) => string;
  metricLabel: string;
}

const TABS: Tab[] = [
  {
    sort: "SCORE_DESC",
    label: "평점순",
    metricLabel: "평점",
    metric: (a) => a.averageScore ? `${a.averageScore}점` : "-",
  },
  {
    sort: "POPULARITY_DESC",
    label: "인기순",
    metricLabel: "리스트 수",
    metric: (a) => a.popularity ? a.popularity.toLocaleString() : "-",
  },
  {
    sort: "TRENDING_DESC",
    label: "트렌딩",
    metricLabel: "트렌드",
    metric: (a) => a.trending ? a.trending.toLocaleString() : "-",
  },
  {
    sort: "FAVOURITES_DESC",
    label: "즐겨찾기",
    metricLabel: "즐겨찾기",
    metric: (a) => a.favourites ? a.favourites.toLocaleString() : "-",
  },
  {
    sort: "START_DATE_DESC",
    label: "최신순",
    metricLabel: "방영연도",
    metric: (a) => a.seasonYear ? `${a.seasonYear}년` : "-",
  },
];

const RankingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeSort, setActiveSort] = useState<string>(TABS[0].sort);
  const [cache, setCache] = useState<Record<string, Anime[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Anime | null>(null);

  const activeTab = TABS.find(t => t.sort === activeSort)!;
  const animes = cache[activeSort] ?? [];

  useEffect(() => {
    if (cache[activeSort]) return;
    const fetchRanking = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: GET_RANKING_QUERY, variables: { sort: [activeSort] } }),
        });
        const data: AniListResponse = await res.json();
        setCache(prev => ({ ...prev, [activeSort]: data.data.Page.media }));
      } catch (e) {
        console.error("랭킹 조회 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [activeSort]);

  return (
    <div className="ranking-page">
      <div className="ranking-page__header">
        <button className="watchlist-page__back" onClick={() => navigate(-1)}>← 뒤로</button>
        <h2 className="watchlist-page__title">랭킹</h2>
      </div>

      <div className="ranking-page__tabs">
        {TABS.map(tab => (
          <button
            key={tab.sort}
            className={`ranking-page__tab${activeSort === tab.sort ? " ranking-page__tab--active" : ""}`}
            onClick={() => setActiveSort(tab.sort)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="watchlist-page__empty">불러오는 중...</div>
      ) : (
        <div className="ranking-page__list">
          {animes.map((anime, idx) => {
            const title = anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
            return (
              <div key={anime.id} className="ranking-item" onClick={() => setSelected(anime)}>
                <span className="ranking-item__num">{idx + 1}</span>
                <img className="ranking-item__img" src={anime.coverImage.large} alt={title} />
                <div className="ranking-item__info">
                  <p className="ranking-item__title">{title}</p>
                  <p className="ranking-item__native">{anime.title.native}</p>
                </div>
                <div className="ranking-item__metric">
                  <span className="ranking-item__metric-label">{activeTab.metricLabel}</span>
                  <span className="ranking-item__metric-value">{activeTab.metric(anime)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal anime={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default RankingPage;
