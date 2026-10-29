import { useEffect, useState, type ReactNode } from 'react';

type ApiItem = Record<string, unknown>;
type ResourceState =
  | { status: 'loading' }
  | { status: 'success'; items: ApiItem[] }
  | { status: 'error'; message: string };

type Props = {
  title: string;
  description: string;
  loadData: () => Promise<Record<string, unknown>>;
  resourceKey: string;
  emptyMessage: string;
  renderItem: (item: ApiItem, index: number) => ReactNode;
};

export function CapabilityCard({ title, description, loadData, resourceKey, emptyMessage, renderItem }: Props) {
  const [state, setState] = useState<ResourceState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loadData()
      .then((response) => {
        const items = response[resourceKey];
        if (!Array.isArray(items)) throw new Error(`The response did not include ${resourceKey}`);
        if (!cancelled) setState({ status: 'success', items: items as ApiItem[] });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });
    return () => { cancelled = true; };
  }, [loadData, resourceKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
    {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
    {state.status === 'success' && state.items.length === 0 && <p role="status">{emptyMessage}</p>}
    {state.status === 'success' && state.items.length > 0 && <ul>
      {state.items.map((item, index) => renderItem(item, index))}
    </ul>}
  </div></section>;
}
