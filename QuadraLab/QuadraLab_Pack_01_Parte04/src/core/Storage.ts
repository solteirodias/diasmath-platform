export class SafeStorage {
  constructor(private readonly namespace: string) {}

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.fullKey(key), JSON.stringify(value));
    } catch {
      // O laboratório continua funcionando mesmo sem armazenamento local.
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.fullKey(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.fullKey(key));
    } catch {
      // Sem ação.
    }
  }

  private fullKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
}
