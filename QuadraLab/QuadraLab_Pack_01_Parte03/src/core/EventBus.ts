type Listener<T> = (payload: T) => void;

export class EventBus<Events extends object> {
  private readonly listeners = new Map<keyof Events, Set<Listener<unknown>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const set = this.listeners.get(event) ?? new Set<Listener<unknown>>();
    set.add(listener as Listener<unknown>);
    this.listeners.set(event, set);

    return () => {
      set.delete(listener as Listener<unknown>);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      (listener as Listener<Events[K]>)(payload);
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
