(function () {
  const VOD_PATTERN = /\/vod\/\d+\//;
  /**
   * This function is used to change the playback speed of the video
   * It takes the speed as a parameter and applies it to the video element
   * ? NOTE: Currently, this is not persistent. Maybe in the future persistency will be added
   */

  const changePlaybackSpeed = (speed) => {
    const video =
      document.querySelector("#bitmovinplayer-video-null") ||
      document.querySelector("#bitmovinplayer-video");
    if (video) {
      video.playbackRate = speed;
    }
  };

  /**
   * Listens for messages from the popup script
   * If the message is to change the playback speed, it calls the changePlaybackSpeed function
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "change-playback-speed") {
      console.log("recieved playback speed change");
      changePlaybackSpeed(request.speed);
      sendResponse({});
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (VOD_PATTERN.test(window.location.href)) {
      // Initial restoration attempt
      changePlaybackSpeed(1);
    }
  });
})();
