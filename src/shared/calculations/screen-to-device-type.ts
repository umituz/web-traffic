/**
 * Screen to Device Type
 * @description Maps screen width to a device type classification
 */

import type { DeviceType } from '../../domains/shared/id-types';

export function classifyDeviceTypeByScreen(screenWidth: number | undefined): DeviceType | null {
  if (screenWidth === undefined) {
    return null;
  }
  if (screenWidth < MOBILE_SCREEN_MAX_PX) {
    return 'mobile';
  }
  if (screenWidth <= TABLET_SCREEN_MAX_PX) {
    return 'tablet';
  }
  return 'desktop';
}

const MOBILE_SCREEN_MAX_PX = 768;
const TABLET_SCREEN_MAX_PX = 1024;
