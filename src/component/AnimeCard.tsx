import ScoreBadge from './ScoreBadge';
import { FORMAT_LABEL } from '../constants';

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
}

const AnimeCard = ({ anime, onClick }: AnimeCardProps) => {
  const title =
    anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown";
  const accent = anime.coverImage.color ?? "#6366f1";

  return (
    <div
      className="anime-card"
      onClick={() => onClick?.(anime)}
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
      <div className="anime-card__actions">
        <button className="anime-card__btn anime-card__btn--want" title="보고 싶어요">♥</button>
        <button className="anime-card__btn anime-card__btn--watched" title="봤어요">✔</button>
      </div>
    </div>
  );
}

export default AnimeCard;
