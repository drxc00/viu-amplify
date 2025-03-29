import { isVODPage, getPersistedVolume, saveVolume } from "./utils";

(function () {
  /** IIFE */
  /**
   * This is the main function that handles the volume persistence.
   * It listens to the video element and applies volume persistence
   * by saving the value in local storage.
   * This script is injected on VOD pages which overrides the default volume (100 max).
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

  /** Fallback interval ID for polling video element changes */
  let fallbackIntervalId: number | null = null;

  function setupVolumeBarObserver() {
    /**
     * Observe volume bar changes to persist user preferences.
     * This is done by listening to the aria-valuenow attribute
     * of the volume bar element using a mutation observer.
     */
    const volumeBar = document.querySelector("#volume_bar");
    if (volumeBar && !volumeBar.hasAttribute("volume-observer-attached")) {
      // Mark this element as having an observer to avoid duplicate observers.
      volumeBar.setAttribute("volume-observer-attached", "true");
      // Observe the volume bar for changes.
      volumeBarObserver = new MutationObserver(() => {
        const volumeBarAriaValue = volumeBar.getAttribute("aria-valuenow");
        if (volumeBarAriaValue) {
          const volume = parseFloat(volumeBarAriaValue);
          if (!isNaN(volume)) {
            saveVolume(volume);
          }
        }
      });
      // Observe the volume bar for attribute changes.
      volumeBarObserver.observe(volumeBar, {
        attributes: true,
        attributeFilter: ["aria-valuenow"],
      });
    }
  }

  function initializeVolume(video: HTMLVideoElement) {
    /**
     * Initialize the volume on the video element.
     * Applies persisted volume and re-applies it when needed.
     */
    const setSafeVolume = () => {
      /**
       * Safe volume calculation.
       * Retrieve the persisted volume and ensure it is within a valid range (0 to 1).
       * If valid, apply it to the video element.
       */
      const volumePersist = getPersistedVolume();
      if (
        typeof volumePersist === "number" &&
        volumePersist >= 0 &&
        volumePersist <= 1
      ) {
        video.volume = volumePersist;
      }
    };

    // Immediately apply persisted volume.
    setSafeVolume();

    // Reapply volume when media is ready.
    video.addEventListener("loadedmetadata", setSafeVolume);
    video.addEventListener("canplay", setSafeVolume);
    video.addEventListener("playing", setSafeVolume);

    // Observe source changes in case the video element is reused.
    const srcObserver = new MutationObserver(() => {
      setSafeVolume();
    });
    srcObserver.observe(video, { attributes: true, attributeFilter: ["src"] });

    // Record the observers and event listeners for cleanup.
    videoObservers.push({
      observer: srcObserver,
      element: video,
      eventListeners: {
        loadedmetadata: setSafeVolume,
        canplay: setSafeVolume,
        playing: setSafeVolume,
      },
    });
  }

  function watchVideoAndVolumeElements() {
    /**
     * Observe for video element insertions.
     * Uses both a mutation observer and a fallback polling mechanism to catch
     * cases when a new video (like the actual content video replacing an initial warning)
     * is dynamically loaded.
     */
    // Mutation observer to catch DOM changes.
    pageObserver = new MutationObserver(() => {
      attachVolumeHandlerIfNeeded();
    });

    setupVolumeBarObserver();

    // Observe the entire document for added/removed nodes.
    pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Fallback: poll every second to catch video changes that might be missed.
    if (!fallbackIntervalId) {
      /**
       * The reason for this is that since VIU is built with nextjs,
       * I.e. react, the video element is not always present in the DOM
       * and is dynamically added/removed.
       * This is a workaround to ensure that we can still persist the volume
       * even if the video element is not present in the DOM.
       * This is not the best solution, but it works for now.
       * This is a fallback to ensure that we can still persist the volume
       */
      fallbackIntervalId = window.setInterval(() => {
        attachVolumeHandlerIfNeeded();
      }, 1000);
    }
  }

  function attachVolumeHandlerIfNeeded() {
    /**
     * Check for video elements using multiple selectors.
     * If a video element is found and doesn't have our volume handler attached,
     * initialize its volume persistence.
     */
    const videoSelectors = [
      "#bitmovinplayer-video-null",
      "#bitmovinplayer-video",
      "video",
    ];
    for (const selector of videoSelectors) {
      const videos = document.querySelectorAll(
        selector
      ) as NodeListOf<HTMLVideoElement>;
      videos.forEach((video) => {
        if (video && !video.hasAttribute("volume-handler-attached")) {
          video.setAttribute("volume-handler-attached", "true");
          initializeVolume(video);
        }
      });
    }
  }

  function cleanup() {
    /**
     * Cleanup all observers and event listeners.
     * This is important when the video element might be removed and added again.
     * This is important to avoid memory leaks and unnecessary processing.
     */

    // Disconnect the page observer to stop observing DOM changes.
    if (pageObserver) {
      pageObserver.disconnect();
      pageObserver = null;
    }

    // Disconnect the volume bar observer if it exists.
    if (volumeBarObserver) {
      volumeBarObserver.disconnect();
      volumeBarObserver = null;
    }

    // Clear the fallback interval if it exists.
    if (fallbackIntervalId) {
      clearInterval(fallbackIntervalId);
      fallbackIntervalId = null;
    }

    videoObservers.forEach(({ observer, element, eventListeners }) => {
      /**
       * Disconnect each video observer and remove event listeners.
       */
      observer.disconnect();
      if (element && eventListeners) {
        for (const [event, handler] of Object.entries(eventListeners)) {
          element.removeEventListener(event, handler);
        }
      }
      if (element) {
        element.removeAttribute("volume-handler-attached");
      }
    });

    // Clear the video observers array.
    videoObservers = [];

    /**
     * Remove the volume observer attribute from the volume bar.
     * This is important to avoid duplicate observers.
     */
    const volumeBar = document.querySelector("#volume_bar");
    if (volumeBar) {
      volumeBar.removeAttribute("volume-observer-attached");
    }
  }

  function changeSubtitleColor(color: string) {
    const subtitlesContainer = document.querySelector(
      ".bmpui-ui-viu-subtitle-overlay"
    ) as HTMLDivElement;

    if (subtitlesContainer) {
      // Function to apply color to all span elements
      const applyColor = () => {
        subtitlesContainer.querySelectorAll("span").forEach((span) => {
          span.style.color = color == "default" ? "" : color;
        });
      };

      // Apply color immediately to existing subtitles
      applyColor();

      // Observe for new subtitle changes
      const observer = new MutationObserver(() => {
        applyColor();
      });

      observer.observe(subtitlesContainer, {
        childList: true,
        subtree: true,
      });
    }
  }

  function changeSubtitleSize(size: string) {
    const subtitlesContainer = document.querySelector(
      ".bmpui-ui-viu-subtitle-overlay"
    ) as HTMLDivElement;

    if (subtitlesContainer) {
      // Function to apply color to all span elements
      const applySize = () => {
        subtitlesContainer.querySelectorAll("span").forEach((span) => {
          span.style.fontSize = size == "default" ? "" : size;
        });
      };

      // Apply color immediately to existing subtitles
      applySize();

      // Observe for new subtitle changes
      const observer = new MutationObserver(() => {
        applySize();
      });

      observer.observe(subtitlesContainer, {
        childList: true,
        subtree: true,
      });
    }
  }

  /**--------------------------------------------------------------------------------- */

  /** INVOKATIONS */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    /**
     * Listen to messages from the service worker.
     * Handles page renders and playback speed changes.
     */
    if (request.type === "page-rendered") {
      // Clean up previous handlers.
      cleanup();

      // Reinitialize the volume handler for the new page.
      if (isVODPage()) {
        watchVideoAndVolumeElements();
        sendResponse({ success: true });
      }
    } else if (request.type === "change-playback-speed" && isVODPage()) {
      /**
       * Change the playback speed of the video element.
       * Simply uses the playbackRate property of the video element.
       * This is done by sending a message from the popup to the content script.
       */
      const video = document.querySelector("video");
      if (video) video.playbackRate = request.speed;
      sendResponse({ success: true });
    } else if (request.type === "enable-pip" && isVODPage()) {
      /**
       * Enable Picture-in-Picture mode for the video element.
       * This is done by requesting Picture-in-Picture on the video element.
       * NOTE: Subtitles are not supported in Picture-in-Picture mode.
       * This is a limitation of the Picture-in-Picture API.
       */
      const video = document.querySelector("video");
      if (video) video.requestPictureInPicture();
      sendResponse({ success: true });
    } else if (request.type === "change-subtitle-color" && isVODPage()) {
      changeSubtitleColor(request.color);
      sendResponse({ success: true });
    } else if (request.type === "change-subtitle-size" && isVODPage()) {
      changeSubtitleSize(request.size);
      sendResponse({ success: true });
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    /**
     * Initial restoration attempt to ensure volume is restored when the page loads.
     */
    if (isVODPage()) {
      watchVideoAndVolumeElements();
    }
  });
})();
