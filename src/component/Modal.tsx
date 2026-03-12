interface ModalProps {
  anime: Anime | null;
  onClose: () => void;
}

const Modal = ({ anime, onClose }: ModalProps) => {
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

export default Modal;
