import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    resourceKey="leaderboard"
    emptyMessage="No leaderboard scores yet."
    renderItem={(entry, index) => <li key={String(entry.rank ?? index)}>
      {String(entry.rank ?? index + 1)}. {String(entry.teamName ?? 'Team')} - {String(entry.totalPoints ?? 0)} points
    </li>}
  />;
}
