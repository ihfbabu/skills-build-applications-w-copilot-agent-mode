import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

function loadTeams() {
  return getJson<Record<string, unknown>>('/api/teams');
}

export default function Teams() {
  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    loadData={loadTeams}
    resourceKey="teams"
    emptyMessage="No teams yet."
    renderItem={(team, index) => <li key={String(team._id ?? index)}>
      {String(team.name ?? 'Team')} ({String(team.mascot ?? 'No mascot')})
    </li>}
  />;
}
