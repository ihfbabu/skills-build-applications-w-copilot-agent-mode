import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return <CapabilityCard
    title="Activities"
    description="Track student activity minutes and points."
    endpoint="/api/activities"
    resourceKey="activities"
    emptyMessage="No activities yet."
    renderItem={(activity, index) => <li key={String(activity._id ?? index)}>
      {String(activity.type ?? 'Activity')} - {String(activity.minutes ?? 0)} minutes - {String(activity.points ?? 0)} points
    </li>}
  />;
}
