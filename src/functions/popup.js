(function () {
  let currentlySelected = null;

  // Get buttons
  const buttons = document.querySelectorAll(".speed-button");
  // Function to handle speed selection
  function changeSpeed(speed, button) {
    // Send message to content script
    chrome.runtime.sendMessage({ type: "change-playback-speed", speed });

    // Remove highlight from previously selected button
    if (currentlySelected) {
      currentlySelected.classList.remove("selected");
    }

    // Highlight the current button
    button.classList.add("selected");
    currentlySelected = button;
  }

  // Add event listeners to all buttons
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const speed = parseFloat(button.dataset.speed); // Read speed from data attribute
      changeSpeed(speed, button);
    });
  });

  const playbackOptions = document.querySelector(".playback-options");

  // Hiding the buttons if the page is not a VOD
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      if (!tabs[0].url.includes("viu.com")) {
        const description = document.querySelector(".description");
        description.textContent = "Not a Viu page. Please visit VIU.com.";
      }

      if (!tabs[0].url.includes("/vod/")) {
        playbackOptions.style.display = "none";
        const nonVodText = document.querySelector("#non-vod-text");
        nonVodText.style.display = "block";
      } else {
        playbackOptions.style.display = "block";
        const nonVodText = document.querySelector("#non-vod-text");
        nonVodText.style.display = "none";
      }
    } else {
      playbackOptions.style.display = "none";
    }
  });
})();
