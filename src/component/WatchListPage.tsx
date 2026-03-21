import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Anime } from '../types';
import { ANILIST_API, GET_ANIME_BY_IDS_QUERY } from '../constants';

interface WatchListPageProps {
  type: "liked" | "watched";
}

const WatchListPage = ({ type }: WatchListPageProps): JSX.Element => {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const storageKey = type === "liked" ? "likedAnimes" : "watchedAnimes";
  const pageTitle = type === "liked" ? "👍 좋아요" : "✔ 봤어요";

  useEffect(() => {
    const ids: number[] = JSON.parse(localStorage.getItem(storageKey) ?? "[]");

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAnimes = async (): Promise<void> => {
      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: GET_ANIME_BY_IDS_QUERY, variables: { ids } }),
        });
        const data = await res.json();
        setAnimes(data.data.Page.media);
      } catch (e) {
        console.error("조회 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [storageKey]);

  return (
    <div className="watchlist-page">
      <div className="watchlist-page__header">
        <button className="watchlist-page__back" onClick={() => navigate(-1)}>← 뒤로</button>
        <h2 className="watchlist-page__title">{pageTitle}</h2>
      </div>
      {loading ? (
        <div className="watchlist-page__empty">불러오는 중...</div>
      ) : (
        <div className="watchlist-page__list">
          {animes.length === 0 ? (
            <div className="watchlist-page__empty">목록이 비어있어요</div>
          ) : (
            animes.map((anime) => {
              const title = anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
              return (
                <div key={anime.id} className="watchlist-item">
                  <div className="watchlist-item__left">
                    <img className="watchlist-item__image" src={anime.coverImage.large} alt={title} />
                    <span className="watchlist-item__title">{title}</span>
                  </div>
                  <div className="watchlist-item__genres">
                    {anime.genres.map((g) => (
                      <span key={g} className="watchlist-item__genre">{g}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default WatchListPage;
