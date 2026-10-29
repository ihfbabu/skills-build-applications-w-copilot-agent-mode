import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

function loadLeaderboard() {
  return getJson<Record<string, unknown>>('/api/leaderboard');
}

export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    loadData={loadLeaderboard}
    resourceKey="leaderboard"
    emptyMessage="No leaderboard scores yet."
    renderItem={(entry, index) => <li key={String(entry.rank ?? index)}>
      {String(entry.rank ?? index + 1)}. {String(entry.teamName ?? 'Team')} - {String(entry.totalPoints ?? 0)} points
    </li>}
  />;
}
