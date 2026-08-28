import { getAppById } from './catalog';

// Basic sanitization: reject IDs with shell-dangerous characters
const SAFE_ID_PATTERN = /^[\w.\-]+$/;

export const validateAppIds = (appIds: string[]): string[] => {
  return appIds.filter((id) => {
    if (!id || !SAFE_ID_PATTERN.test(id)) {
      console.warn(`[validator] Rejected unsafe appId: ${id}`);
      return false;
    }
    // Try catalog lookup — if found, check verified flag
    const app = getAppById(id);
    if (app) {
      if (!app.verified) {
        console.warn(`[validator] Rejected unverified appId: ${id}`);
        return false;
      }
      return true;
    }
    // Not in catalog — allow anyway (user may have sent a valid winget ID directly)
    console.warn(`[validator] AppId not in catalog, allowing through: ${id}`);
    return true;
  });
};

