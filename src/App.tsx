import { useState, useCallback, KeyboardEvent } from "react";
// ─── Components ───────────────────────────────────────────────────────────────
import ScoreBadge from "./component/ScoreBadge";
import AnimeCard from "./component/AnimeCard";
import Modal from "./component/Modal";
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
import { ANILIST_API, SEARCH_QUERY, STATUS_LABEL,FORMAT_LABEL, SEASON_LABEL } from './constants';
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
