export type DeviceArchitecture = 'arm64' | 'arm32' | 'unknown';

export interface ArchitectureDetection {
  architecture: DeviceArchitecture;
  label: string;
  source: 'browser hints' | 'browser user agent' | 'unavailable';
}

export function classifyArchitecture(value: string | null | undefined): DeviceArchitecture {
  const normalized = value?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';

  if (/(arm64|aarch64|armv8a|armv8|aarch64)/.test(normalized)) {
    return 'arm64';
  }

  if (/(arm32|armv7|armv6|armeabi|armhf)/.test(normalized)) {
    return 'arm32';
  }

  return 'unknown';
}

interface UserAgentDataLike {
  architecture?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; bitness?: string }>;
}

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: UserAgentDataLike;
}

export async function detectDeviceArchitecture(
  browserNavigator: NavigatorWithUserAgentData = navigator,
): Promise<ArchitectureDetection> {
  const hints = browserNavigator.userAgentData;

  if (hints) {
    try {
      const highEntropy = await hints.getHighEntropyValues?.(['architecture', 'bitness']);
      const hintValue = highEntropy?.architecture || hints.architecture;
      const hintArchitecture = classifyArchitecture(hintValue);

      if (hintArchitecture !== 'unknown') {
        return {
          architecture: hintArchitecture,
          label: hintArchitecture === 'arm64' ? 'ARM64 / ARMv8-A' : 'ARM32 / ARMv7-A',
          source: 'browser hints',
        };
      }
    } catch {
      // Browser hints may be restricted; try the user agent without collecting anything.
    }
  }

  const userAgentArchitecture = classifyArchitecture(browserNavigator.userAgent);
  if (userAgentArchitecture !== 'unknown') {
    return {
      architecture: userAgentArchitecture,
      label: userAgentArchitecture === 'arm64' ? 'ARM64 / ARMv8-A' : 'ARM32 / ARMv7-A',
      source: 'browser user agent',
    };
  }

  return {
    architecture: 'unknown',
    label: 'Not available from this browser',
    source: 'unavailable',
  };
}