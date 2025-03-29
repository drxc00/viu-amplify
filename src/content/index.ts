import { isVODPage, getPersistedVolume, saveVolume } from "./utils";

(function () {
  /** IIFE */
  /**
   * This is the main function that handles the volume persistence
   * It listens to the video element and applies volume persistence
   * This is done by saving the value in local storage
   * This script is injected on VOD pages which overrides the default volume (100 max)
   */

  /** Global observer for page changes */
  let pageObserver: MutationObserver | null = null;

  /** Global observer for video changes */
  let videoObservers: {
    observer: MutationObserver;
    element: HTMLVideoElement;
    eventListeners: Record<string, EventListener>;
  }[] = [];

  /** Global observer for volume bar changes */
  let volumeBarObserver: MutationObserver | null = null;

  /**
   * Observe volume bar changes to persist user preferences
   * This is done by listening to the aria-valuenow attribute
   * Of the volume bar element
   * We use a mutation observer to listen to these changes
   */
  function setupVolumeBarObserver() {
    const volumeBar = document.querySelector("#volume_bar");
    if (volumeBar && !volumeBar.hasAttribute("volume-observer-attached")) {
      /** Mark this element as having an observer to avoid duplicate observers */
      volumeBar.setAttribute("volume-observer-attached", "true");

      volumeBarObserver = new MutationObserver(() => {
        const volumeLevel =
          parseInt(volumeBar.getAttribute("aria-valuenow") || "100") || 100;
        saveVolume(volumeLevel);
      });

      volumeBarObserver.observe(volumeBar, {
        attributes: true,
        attributeFilter: ["aria-valuenow"],
      });
    }
  }

  /**
   * We initialize the volume on the video element
   * Takes a video element and applies volume persistence
   *
   * Morever, this function also listens to the volume bar changes
   * This is done by listening to the aria-valuenow attribute
   * Of the volume bar element
   * We use a mutation observer to listen to these changes
   * This is done to ensure that the volume is persisted
   * This is done by saving the value in local storage
   */
  function initializeVolume(video: HTMLVideoElement) {
    const volumePersist = getPersistedVolume();

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

    /** Apply the persisted volume */
    setSafeVolume();

    /**
     * Ensure volume is reset when the video source changes
     * Somewhat forces the volume to be reset based on the persisted value
     */
    video.addEventListener("loadedmetadata", setSafeVolume);
    video.addEventListener("canplay", setSafeVolume);

    /** Observe source changes due to dynamic loading */
    const srcObserver = new MutationObserver(() => {
      setTimeout(setSafeVolume, 300);
    });
    srcObserver.observe(video, { attributes: true, attributeFilter: ["src"] });

    /** Add video observer to the list for cleanup */
    videoObservers.push({
      observer: srcObserver,
      element: video,
      eventListeners: {
        loadedmetadata: setSafeVolume,
        canplay: setSafeVolume,
      },
    });

    /** Listen to volume bar changes */
    setupVolumeBarObserver();
  }

  function watchVideoAndVolumeElements() {
    /**
     * Observer for when the video element appears
     * We use a mutation observer to listen to these changes
     * If a video is loaded and found, we initialize the volume
     */
    pageObserver = new MutationObserver(() => {
      const video: HTMLVideoElement =
        document.querySelector("#bitmovinplayer-video-null") ||
        (document.querySelector("#bitmovinplayer-video") as HTMLVideoElement);

      if (video && !video.hasAttribute("volume-handler-attached")) {
        /**
         * We check if the video element has the attribute volume-handler-attached
         * This is to ensure that we do not attach the volume handler multiple times
         */
        video.setAttribute("volume-handler-attached", "true");
        initializeVolume(video);
      }

      /** We then always check for volume bar changes */
      setupVolumeBarObserver();
    });

    /**
     * NOTE: We use document body not document or the video element because we want to observe the entire document
     * Since the VIU dynmically loads the video, we need to observe the entire document when a video element is loaded.
     */
    pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ["aria-valuenow"],
    });
  }

  /**
   * Cleanup function to remove all observers and event listeners
   * This is done to ensure that we do not have multiple observers and event listeners
   * This is important because the video element may be removed and added again
   * And we do not want to have multiple observers and event listeners
   */
  function cleanup() {
    // Disconnect page observer
    if (pageObserver) {
      pageObserver.disconnect();
      pageObserver = null;
    }

    // Disconnect volume bar observer
    if (volumeBarObserver) {
      volumeBarObserver.disconnect();
      volumeBarObserver = null;
    }

    // Clean up video-specific observers and event listeners
    videoObservers.forEach(({ observer, element, eventListeners }) => {
      observer.disconnect();

      // Remove event listeners
      if (element && eventListeners) {
        for (const [event, handler] of Object.entries(eventListeners)) {
          element.removeEventListener(event, handler);
        }
      }

      // Remove attributes
      if (element) {
        element.removeAttribute("volume-handler-attached");
      }
    });

    videoObservers = [];

    // Clean up volume bar attribute
    const volumeBar = document.querySelector("#volume_bar");
    if (volumeBar) {
      volumeBar.removeAttribute("volume-observer-attached");
    }
  }

  /**
   * Listen to messages from the service worker
   * Every this helps with the communication between the actual pop up and the content script
   *
   * What this listens to:
   * 1. PAGE RENDERS (page-rendered): This is sent when the page is fully rendered
   * 2. PLAYBACK REQUEST CHANGE (change-playback-speed): This is sent when the user changes the playback speed
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "page-rendered") {
      // Clean up previous handlers
      cleanup();

      if (isVODPage()) {
        watchVideoAndVolumeElements();
        sendResponse({ success: true });
      }
    } else if (request.type === "change-playback-speed" && isVODPage()) {
      const video = document.querySelector("video");
      if (video) video.playbackRate = request.speed;
      sendResponse({ success: true });
    }
  });

  /**
   * This is the initial restoration attempt
   * This is done to ensure that the volume is restored when the user first loads the page
   * Reason: When the user first loads the page on a VOD page, the volume state is lost. As such, we need to restore it
   * This is done by listening to the DOMContentLoaded event
   * This event is fired when the initial HTML document has been completely loaded and parsed
   * without waiting for stylesheets, images, and subframes to finish loading
   * This is important because the video element may not be available yet
   * So we need to wait for the DOM to be fully loaded before we can access it
   */
  document.addEventListener("DOMContentLoaded", () => {
    if (isVODPage()) {
      // Initial restoration attempt
      watchVideoAndVolumeElements();
    }
  });

  /**
   * Restore volume on page reload
   * This is done to ensure that the volume is restored when the user refreshes the page
   * Reason: When the user refreshes the page on a VOD page, the volume state is lost. As such, we need to restore it
   */
  window.location.reload = () => {
    if (isVODPage()) {
      watchVideoAndVolumeElements();
    }
  };
})();
