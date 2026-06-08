/**
 * DeviceInfo Value Object
 * @description Immutable device/browser/OS detection
 */

import type {
  BrowserInfo,
  DeviceType,
  OSInfo,
  ScreenSize,
} from '../../shared/id-types';
import { classifyDeviceTypeByScreen } from '../../../shared/calculations';

export type { BrowserInfo, DeviceType, OSInfo, ScreenSize };

export class DeviceInfo {
  private readonly browser: BrowserInfo;
  private readonly os: OSInfo;
  private readonly deviceType: DeviceType;
  private readonly screenSize: ScreenSize;

  private constructor(params: {
    browser: BrowserInfo;
    os: OSInfo;
    deviceType: DeviceType;
    screenSize: ScreenSize;
  }) {
    this.browser = { ...params.browser };
    this.os = { ...params.os };
    this.deviceType = params.deviceType;
    this.screenSize = { ...params.screenSize };
    Object.freeze(this);
  }

  static create(params: {
    browser: BrowserInfo;
    os: OSInfo;
    deviceType: DeviceType;
    screenSize: ScreenSize;
  }): DeviceInfo {
    return new DeviceInfo(params);
  }

  static fromUserAgent(userAgent: string, screenWidth?: number, screenHeight?: number): DeviceInfo {
    return new DeviceInfo({
      browser: parseBrowser(userAgent),
      os: parseOS(userAgent),
      deviceType: detectDeviceType(userAgent, screenWidth),
      screenSize: {
        width: screenWidth ?? null,
        height: screenHeight ?? null,
      },
    });
  }

  getBrowser(): BrowserInfo {
    return { ...this.browser };
  }

  getOS(): OSInfo {
    return { ...this.os };
  }

  getDeviceType(): DeviceType {
    return this.deviceType;
  }

  getScreenSize(): ScreenSize {
    return { ...this.screenSize };
  }

  isMobile(): boolean {
    return this.deviceType === 'mobile';
  }

  isTablet(): boolean {
    return this.deviceType === 'tablet';
  }

  isDesktop(): boolean {
    return this.deviceType === 'desktop';
  }

  toJSON() {
    return {
      browser: this.browser,
      os: this.os,
      deviceType: this.deviceType,
      screenSize: this.screenSize,
    };
  }
}

function parseBrowser(userAgent: string): BrowserInfo {
  const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
  if (edgeMatch) {
    return { name: 'Edge', version: edgeMatch[1] };
  }

  const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
  if (firefoxMatch) {
    return { name: 'Firefox', version: firefoxMatch[1] };
  }

  const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
  if (chromeMatch) {
    return { name: 'Chrome', version: chromeMatch[1] };
  }

  const safariMatch = userAgent.match(/Version\/(\d+\.\d+)/);
  if (safariMatch && userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return { name: 'Safari', version: safariMatch[1] };
  }

  return { name: null, version: null };
}

function parseOS(userAgent: string): OSInfo {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    const iosMatch = userAgent.match(/(?:iPhone|iPad|iPod)\s*(?:OS|CPU OS)\s*(\d+[._]\d+)/);
    return { name: 'iOS', version: iosMatch ? iosMatch[1].replace('_', '.') : null };
  }

  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) {
    return { name: 'Windows', version: windowsMatch[1] };
  }

  if (/Macintosh|Mac OS X/i.test(userAgent) && !/iPhone|iPad|iPod/i.test(userAgent)) {
    const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    return { name: 'macOS', version: macMatch ? macMatch[1].replace('_', '.') : null };
  }

  const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
  if (androidMatch) {
    return { name: 'Android', version: androidMatch[1] };
  }

  if (userAgent.includes('Linux')) {
    return { name: 'Linux', version: null };
  }

  return { name: null, version: null };
}

function detectDeviceType(userAgent: string, screenWidth?: number): DeviceType {
  if (/iPad/i.test(userAgent)) {
    return 'tablet';
  }

  const screenBased = classifyDeviceTypeByScreen(screenWidth);
  if (screenBased !== null) {
    return screenBased;
  }

  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return 'mobile';
  }

  return 'desktop';
}
