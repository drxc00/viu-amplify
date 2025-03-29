import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

export function PlaybackOptions() {
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  // Load saved speed on component mount
  useEffect(() => {
    const savedSpeed = parseFloat(localStorage.getItem("playbackSpeed") || "1");
    setSelectedSpeed(savedSpeed);
  }, []);

  const changeSpeed = (speed: number) => {
    // Save to localStorage
    localStorage.setItem("playbackSpeed", speed.toString());

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "change-playback-speed", speed },
          (response) => {
            console.log("Response from content script:", response);
          }
        );
      }
    });

    setSelectedSpeed(speed);
  };

  return (
    <div className="p-4 bg-foreground/10 rounded-lg border border-foreground/40 w-full">
      <div className="mb-2 text-sm font-medium text-foreground">Playback Speed</div>

      <div className="flex justify-between gap-1 mb-1">
        {SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => changeSpeed(speed)}
            className={twMerge(
              "flex-1 py-1 text-sm rounded-lg transition-all duration-200",
              selectedSpeed === speed
                ? "bg-primary text-background"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
