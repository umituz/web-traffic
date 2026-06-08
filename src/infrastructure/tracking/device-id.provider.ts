/**
 * Device ID Provider
 * @description Single responsibility: persistent device identifier management
 */

import { DeviceId } from '../../domains/tracking/value-objects/device-id.vo';
import { createSafeStorage, type Storage } from '../../shared/safe-storage';
import { DEVICE_ID_STORAGE_KEY } from '../../shared/config';

export class DeviceIdProvider {
  constructor(private readonly storage: Storage = createSafeStorage()) {}

  getOrCreate(): DeviceId {
    const existing = this.storage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) {
      try {
        return DeviceId.of(existing);
      } catch {
        // Stored value corrupted - fall through to generate
      }
    }

    const generated = DeviceId.generate();
    try {
      this.storage.setItem(DEVICE_ID_STORAGE_KEY, generated.toString());
    } catch (error) {
      throw new Error(
        `Failed to persist device id: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
    return generated;
  }
}
