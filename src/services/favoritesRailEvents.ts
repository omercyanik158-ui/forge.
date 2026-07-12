type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeFavoritesRailChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyFavoritesRailChange(): void {
  for (const listener of listeners) listener();
}
