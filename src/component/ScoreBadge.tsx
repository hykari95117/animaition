interface ScoreBadgeProps {
  score: number | null;
}

const ScoreBadge = ({ score }: ScoreBadgeProps): JSX.Element | null => {
  if (!score) return null;
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171";
  return (
    <span className="score-badge" style={{ background: color }}>
      ★ {score}
    </span>
  );
};

export default ScoreBadge;
