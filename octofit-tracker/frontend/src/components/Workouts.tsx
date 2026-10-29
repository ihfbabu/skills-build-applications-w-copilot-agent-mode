import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    resourceKey="suggestions"
    emptyMessage="No workout suggestions yet."
    renderItem={(workout, index) => <li key={String(workout._id ?? index)}>
      {String(workout.title ?? 'Workout')} - {String(workout.focus ?? 'General fitness')}: {String(workout.reason ?? '')}
    </li>}
  />;
}
