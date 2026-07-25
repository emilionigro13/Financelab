export class Cache {
  private store = new Map<string, { data: unknown; expiry: number }>();

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.data as T;
  }

  set(key: string, data: unknown, ttlSeconds: number): void {
    this.store.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
  }
}