/**
 * Volume Handler script for VIU
 * Listens to video audio changes and applies volume persistence
 * This is done by saving the value in local storagte.
 * This script is injected on VOD pages which overrieds the default volume (100 max)
 * ? NOTE: This is a work in progress. Although it works, there could still be bugs
 */

(function () {
  const VOD_PATTERN = /\/vod\/\d+\//;
  /**
   * We initialize the volume on the video element
   * Takes a video element and applies volume persistence
   */
  const initializeVolume = (video) => {
    const volumePersist =
      parseInt(localStorage.getItem("viu_volume")) / 100 || 0.5;

    /**
     * Safe volume calculation
     * It takes the current volume and ensures it is within a certain threshold
     * If it is not within the threshold, it sets the volume to the persisted value
     */
    const setSafeVolume = () => {
      if (Math.abs(video.volume - volumePersist) > 0.01) {
        video.volume = volumePersist;
      }
    };

    // Apply initial volume
    setSafeVolume();

    /**
     * Ensure volume is reset when the video source changes
     * Somewhat forces the volume to be reset based on the persisted value
     */
    video.addEventListener("loadedmetadata", setSafeVolume);
    video.addEventListener("canplay", setSafeVolume);

    // Observe source changes due to dynamic loading
    const srcObserver = new MutationObserver(() => {
      setTimeout(setSafeVolume, 300);
    });
    srcObserver.observe(video, { attributes: true, attributeFilter: ["src"] });

    /**
     * Observe volume bar changes to persist user preferences
     * This is done by listening to the aria-valuenow attribute
     * Of the volume bar element
     * We use a mutation observer to listen to these changes
     *
     * We use the window object to store the observer instead of the document object
     * To ensure that the observer is only created once
     */
    const volumeBar = document.querySelector("#volume_bar");
    if (volumeBar) {
      window.volumeBarObserver = new MutationObserver(() => {
        const volumeLevel =
          parseInt(volumeBar.getAttribute("aria-valuenow")) || 100;
        localStorage.setItem("viu_volume", volumeLevel.toString());
      });

      window.volumeBarObserver.observe(volumeBar, {
        attributes: true,
        attributeFilter: ["aria-valuenow"],
      });
    }
  };

  const restoreVolume = () => {
    // Disconnect any existing observers
    if (window.videoObserver) {
      window.videoObserver.disconnect();
    }
    if (window.volumeBarObserver) {
      window.volumeBarObserver.disconnect();
    }

    /**
     * Observer for when the video element appears
     * We use a mutation observer to listen to these changes
     * If a video is loaded and found, we initialize the volume
     */
    const observer = new MutationObserver(() => {
      const video =
        document.querySelector("#bitmovinplayer-video-null") ||
        document.querySelector("#bitmovinplayer-video");

      if (video) {
        observer.disconnect(); // Stop observing once found
        initializeVolume(video);
      }
    });

    /**
     * NOTE: We use document body not document or the video element because we want to observe the entire document
     * Since the VIU dynmically loads the video, we need to observe the entire document when a video element is loaded.
     */
    observer.observe(document.body, { childList: true, subtree: true });
  };

  /**
   * Listen to messages from the service worker
   * Basically a listener for when the page is rendered
   * Since VIU is a SPA, we need to listen to this message
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (
      request.type === "page-rendered" &&
      VOD_PATTERN.test(window.location.href)
    ) {
      restoreVolume();
      sendResponse({});
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    if (VOD_PATTERN.test(window.location.href)) {
      // Initial restoration attempt
      restoreVolume();
    }
  });

  /**
   * Restore volume on page reload
   * This is done to ensure that the volume is restored when the user refreshes the page
   */
  window.location.reload = () => {
    restoreVolume();
  };
})();
