export interface DeviceProfile {
  id: string;
  name: string;
  /** Logical screen width in CSS points (portrait). */
  width: number;
  /** Logical screen height in CSS points (portrait). */
  height: number;
  deviceScaleFactor: number;
  userAgent: string;
}

const MOBILE_SAFARI_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

export const deviceProfiles: DeviceProfile[] = [
  { id: "iphone-16-pro", name: "iPhone 16 Pro", width: 402, height: 874, deviceScaleFactor: 3, userAgent: MOBILE_SAFARI_USER_AGENT },
  { id: "iphone-16", name: "iPhone 16", width: 393, height: 852, deviceScaleFactor: 3, userAgent: MOBILE_SAFARI_USER_AGENT },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", width: 393, height: 852, deviceScaleFactor: 3, userAgent: MOBILE_SAFARI_USER_AGENT },
  { id: "iphone-14", name: "iPhone 14", width: 390, height: 844, deviceScaleFactor: 3, userAgent: MOBILE_SAFARI_USER_AGENT }
];

export const defaultDeviceName = deviceProfiles[0].name;

export function getDeviceProfile(name: string): DeviceProfile {
  return deviceProfiles.find((profile) => profile.name === name) ?? deviceProfiles[0];
}
