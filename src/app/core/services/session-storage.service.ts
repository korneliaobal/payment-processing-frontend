import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  private readonly fallback = new Map<string, unknown>();

  read<T>(key: string, validate: (value: unknown) => value is T): T | null {
    if (this.fallback.has(key)) {
      const value = this.fallback.get(key);
      return validate(value) ? value : null;
    }

    let value: unknown;
    try {
      value = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    } catch {
      return null;
    }
    return validate(value) ? value : null;
  }

  write<T>(key: string, value: T): void {
    this.fallback.set(key, value);
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }

  remove(key: string): void {
    this.fallback.set(key, null);
    try {
      sessionStorage.removeItem(key);
    } catch {
      return;
    }
  }
}
