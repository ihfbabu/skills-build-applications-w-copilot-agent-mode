import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    resourceKey="teams"
    emptyMessage="No teams yet."
    renderItem={(team, index) => <li key={String(team._id ?? index)}>
      {String(team.name ?? 'Team')} ({String(team.mascot ?? 'No mascot')})
    </li>}
  />;
}
