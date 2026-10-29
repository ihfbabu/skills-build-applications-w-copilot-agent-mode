import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

function loadActivities() {
  return getJson<Record<string, unknown>>('/api/activities');
}

export default function Activities() {
  return <CapabilityCard
    title="Activities"
    description="Track student activity minutes and points."
    loadData={loadActivities}
    resourceKey="activities"
    emptyMessage="No activities yet."
    renderItem={(activity, index) => <li key={String(activity._id ?? index)}>
      {String(activity.type ?? 'Activity')} - {String(activity.minutes ?? 0)} minutes - {String(activity.points ?? 0)} points
    </li>}
  />;
}
