import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStorageService } from './session-storage.service';

const isString = (value: unknown): value is string => typeof value === 'string';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    service = new SessionStorageService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('restores a saved value in a new app instance', () => {
    service.write('draft', 'saved');
    expect(new SessionStorageService().read('draft', isString)).toBe('saved');
  });

  it('rejects missing, malformed and incorrectly typed values', () => {
    expect(service.read('draft', isString)).toBeNull();
    sessionStorage.setItem('draft', '{broken');
    expect(service.read('draft', isString)).toBeNull();
    sessionStorage.setItem('draft', JSON.stringify(123));
    expect(service.read('draft', isString)).toBeNull();
  });

  it('uses the latest local value when writing to browser storage fails', () => {
    sessionStorage.setItem('draft', JSON.stringify('old'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    service.write('draft', 'new');
    expect(service.read('draft', isString)).toBe('new');
  });

  it('does not restore stale data when removal fails', () => {
    sessionStorage.setItem('draft', JSON.stringify('old'));
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    service.remove('draft');
    expect(service.read('draft', isString)).toBeNull();
    service.write('draft', 'new');
    expect(service.read('draft', isString)).toBe('new');
  });

  it('removes the persisted value for subsequent app instances', () => {
    service.write('draft', 'saved');
    service.remove('draft');
    expect(new SessionStorageService().read('draft', isString)).toBeNull();
  });

  it('returns an absent value when reading browser storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    expect(service.read('draft', isString)).toBeNull();
    service.write('draft', 'local');
    expect(service.read('draft', isString)).toBe('local');
  });
});
