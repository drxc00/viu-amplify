export const VOD_PATTERN = /\/vod\/\d+\//;
export const VOLUME_STORAGE_KEY = "viu_volume";

function isVODPage() {
  return (
    VOD_PATTERN.test(window.location.href) ||
    window.location.href.includes("/vod/") // Fallback for other VOD pages
  );
}

// Get the persisted volume value from storage
function getPersistedVolume() {
  return (
    parseInt(localStorage.getItem(VOLUME_STORAGE_KEY) || "50") / 100 || 0.5
  );
}

function saveVolume(volumeLevel: number) {
    localStorage.setItem(VOLUME_STORAGE_KEY, volumeLevel.toString());
  }

export { isVODPage, getPersistedVolume, saveVolume };
