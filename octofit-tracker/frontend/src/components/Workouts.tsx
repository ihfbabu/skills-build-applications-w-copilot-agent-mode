import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

function loadWorkoutSuggestions() {
  return getJson<Record<string, unknown>>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
}

export default function Workouts() {
  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadData={loadWorkoutSuggestions}
    resourceKey="suggestions"
    emptyMessage="No workout suggestions yet."
    renderItem={(workout, index) => <li key={String(workout._id ?? index)}>
      {String(workout.title ?? 'Workout')} - {String(workout.focus ?? 'General fitness')}: {String(workout.reason ?? '')}
    </li>}
  />;
}
