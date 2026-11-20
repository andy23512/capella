import { TestBed } from '@angular/core/testing';
import { DeviceLayoutService, deviceLayoutId } from './device-layout.service';

const KEY = 'capella:device-layout';

describe('DeviceLayoutService', () => {
  let service: DeviceLayoutService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(DeviceLayoutService);
    // the selection is module-wide, so start every test from the same place
    service.setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  afterEach(() => {
    service.setDeviceLayoutId('cc1-cc2-ccu');
    localStorage.clear();
  });

  it('shows the thumb switch for the CC1/CC2/CCU layout', () => {
    expect(service.deviceLayoutId()).toBe('cc1-cc2-ccu');
    expect(service.showThumb3Switch()).toBeTrue();
  });

  it('hides the thumb switch for the Master Forge layout', () => {
    service.setDeviceLayoutId('m4g');
    expect(service.deviceLayoutId()).toBe('m4g');
    expect(service.showThumb3Switch()).toBeFalse();
  });

  it('shares the selection with code that reads it outside Angular', () => {
    service.setDeviceLayoutId('m4g');
    expect(deviceLayoutId()).toBe('m4g');
    service.setDeviceLayoutId('cc1-cc2-ccu');
    expect(deviceLayoutId()).toBe('cc1-cc2-ccu');
  });

  it('saves the selection', () => {
    service.setDeviceLayoutId('m4g');
    expect(localStorage.getItem(KEY)).toBe('m4g');
    service.setDeviceLayoutId('cc1-cc2-ccu');
    expect(localStorage.getItem(KEY)).toBe('cc1-cc2-ccu');
  });
});
