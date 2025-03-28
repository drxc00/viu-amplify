export {};

declare global {
  interface Window {
    volumeBarObserver?: MutationObserver;
    videoObserver?: MutationObserver;
  }
}
