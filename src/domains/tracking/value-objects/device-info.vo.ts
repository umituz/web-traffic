/**
 * DeviceInfo Value Object
 * @description Immutable value object for device/browser information
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

export class DeviceInfo {
  private readonly browser: BrowserInfo;
  private readonly os: OSInfo;
  private readonly deviceType: DeviceType;
  private readonly screenWidth: number | null;
  private readonly screenHeight: number | null;

  constructor(params: {
    browser: BrowserInfo;
    os: OSInfo;
    deviceType: DeviceType;
    screenWidth: number | null;
    screenHeight: number | null;
  }) {
    this.browser = { ...params.browser };
    this.os = { ...params.os };
    this.deviceType = params.deviceType;
    this.screenWidth = params.screenWidth;
    this.screenHeight = params.screenHeight;
    Object.freeze(this);
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

  getScreenSize(): { width: number | null; height: number | null } {
    return {
      width: this.screenWidth,
      height: this.screenHeight,
    };
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
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
    };
  }

  static fromUserAgent(userAgent: string, screenWidth?: number): DeviceInfo {
    // Simple UA parsing (production would use ua-parser-js)
    const browser = parseBrowser(userAgent);
    const os = parseOS(userAgent);
    const deviceType = detectDeviceType(userAgent, screenWidth);

    return new DeviceInfo({
      browser,
      os,
      deviceType,
      screenWidth: screenWidth ?? null,
      screenHeight: null,
    });
  }
}

function parseBrowser(userAgent: string): BrowserInfo {
  const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
  if (chromeMatch) {
    return { name: 'Chrome', version: chromeMatch[1] };
  }

  const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
  if (firefoxMatch) {
    return { name: 'Firefox', version: firefoxMatch[1] };
  }

  const safariMatch = userAgent.match(/Safari\/(\d+\.\d+)/);
  if (safariMatch && !userAgent.includes('Chrome')) {
    return { name: 'Safari', version: safariMatch[1] };
  }

  const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
  if (edgeMatch) {
    return { name: 'Edge', version: edgeMatch[1] };
  }

  return { name: null, version: null };
}

function parseOS(userAgent: string): OSInfo {
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
  if (windowsMatch) {
    return { name: 'Windows', version: windowsMatch[1] };
  }

  const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+)/);
  if (macMatch) {
    return { name: 'macOS', version: macMatch[1].replace('_', '.') };
  }

  const iosMatch = userAgent.match(/iOS (\d+[._]\d+)/);
  if (iosMatch) {
    return { name: 'iOS', version: iosMatch[1].replace('_', '.') };
  }

  const androidMatch = userAgent.match(/Android (\d+\.\d+)/);
  if (androidMatch) {
    return { name: 'Android', version: androidMatch[1] };
  }

  const linuxMatch = userAgent.includes('Linux');
  if (linuxMatch) {
    return { name: 'Linux', version: null };
  }

  return { name: null, version: null };
}

function detectDeviceType(userAgent: string, screenWidth?: number): DeviceType {
  if (screenWidth) {
    if (screenWidth < 768) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
    return 'desktop';
  }

  const mobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  if (mobile) {
    return /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
  }

  return 'desktop';
}
