import { Injectable, computed, signal } from '@angular/core';

export type DeviceLayoutId = 'cc1-cc2-ccu' | 'm4g';

const STORAGE_KEY = 'capella:device-layout';

function loadDeviceLayoutId(): DeviceLayoutId {
  if (typeof localStorage === 'undefined') {
    return 'cc1-cc2-ccu';
  }
  return localStorage.getItem(STORAGE_KEY) === 'm4g' ? 'm4g' : 'cc1-cc2-ccu';
}

function saveDeviceLayoutId(id: DeviceLayoutId): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, id);
}

const deviceLayoutIdSignal = signal<DeviceLayoutId>(loadDeviceLayoutId());

/**
 * The user's selected device layout, read directly by key-position.utils.ts
 * (which resolves switch positions outside of Angular's DI graph).
 */
export const deviceLayoutId = deviceLayoutIdSignal.asReadonly();

@Injectable({ providedIn: 'root' })
export class DeviceLayoutService {
  readonly deviceLayoutId = deviceLayoutId;
  readonly showThumb3Switch = computed(
    () => deviceLayoutIdSignal() !== 'm4g',
  );

  setDeviceLayoutId(id: DeviceLayoutId): void {
    deviceLayoutIdSignal.set(id);
    saveDeviceLayoutId(id);
  }
}
