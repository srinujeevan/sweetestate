import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Area = 'local' | 'session';

/**
 * SSR-safe wrapper around Web Storage. Every access is guarded: storage can be
 * missing during prerendering or throw in private windows.
 */
@Injectable({ providedIn: 'root' })
export class BrowserStorage {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getJson<T>(key: string, area: Area = 'local'): T | null {
    const raw = this.get(key, area);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJson(key: string, value: unknown, area: Area = 'local'): boolean {
    return this.set(key, JSON.stringify(value), area);
  }

  get(key: string, area: Area = 'local'): string | null {
    try {
      return this.store(area)?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  set(key: string, value: string, area: Area = 'local'): boolean {
    try {
      const s = this.store(area);
      if (!s) return false;
      s.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string, area: Area = 'local'): void {
    try {
      this.store(area)?.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  private store(area: Area): Storage | null {
    if (!this.isBrowser) return null;
    return area === 'local' ? window.localStorage : window.sessionStorage;
  }
}
