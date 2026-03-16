import { useState, useCallback, useEffect, useMemo, KeyboardEvent } from "react";
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
import { ANILIST_API, SEARCH_QUERY, GET_ANIME_BY_ID_QUERY, STATUS_LABEL, FORMAT_LABEL, SEASON_LABEL } from './constants';
// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
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

  // const handleSelectAnime = useCallback((anime: Anime): void => {
  //   console.log(anime);
  // }, []);
  // console.log(handleSelectAnime);

  const handleSelectAnime = (anime: Anime): void => setSelected(anime);

  // 진격의 거인 예시 조회 (AniList ID: 16498)
  useEffect(() => {
    const fetchAttackOnTitan = async (): Promise<void> => {
      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query: GET_ANIME_BY_ID_QUERY, variables: { id: 16498 } }),
        });
        const data: AniListResponse = await res.json();
        /**
         * data 변수(= res.json()의 반환값)를 console.log로 찍어보면 AniListResponse type의 구조와 다르다.
         * 즉, 현재 응답값의 구조는 AniListResponse 타입과 맞지 않는다.

         * 그럼에도 Error가 발생하지 않는 이유는 아래와 같다.(실제 응답값의 구조가 AniListResponse와 달라도 컴파일 에러가 안 나는 이유)
         * 1. await res.json()의 반환 타입이 any이기 때문
         * 2. any는 어떤 타입에도 할당할 수 있도록 허용된다.
         * 3. 즉, TypeScript 입장에서는 네트워크에서 어떤 값이 올지 모르니 data: AniListResponse로 선언한 타입이겠거니 하고 믿는것이다.
         */
        console.group("진격의 거인 조회 예시");
        console.log(data);
        console.groupEnd();
        setResults([data.data.Media]);
        setSearched(true);
      } catch (e) {
        console.error("조회 실패:", e);
      }
    };
    fetchAttackOnTitan();
  }, []);

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
                <AnimeCard key={anime.id} anime={anime} onClick={handleSelectAnime} />
              ))}
            </div>
          </>
        )}
      </div>

      <Modal anime={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
