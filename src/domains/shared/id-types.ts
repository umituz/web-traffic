/**
 * Value Object Types
 * @description Shared type definitions
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export interface BrowserInfo {
  readonly name: string | null;
  readonly version: string | null;
}

export interface OSInfo {
  readonly name: string | null;
  readonly version: string | null;
}

export interface ScreenSize {
  readonly width: number | null;
  readonly height: number | null;
}
