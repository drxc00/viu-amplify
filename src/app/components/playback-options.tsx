import { useState } from "react";
import { Button } from "./ui/button";

const options = [
  {
    label: "1x",
    value: 1,
  },
  {
    label: "1.25x",
    value: 1.25,
  },
  {
    label: "1.5x",
    value: 1.5,
  },
  {
    label: "1.75x",
    value: 1.75,
  },
  {
    label: "2x",
    value: 2,
  },
];

export function PlaybackOptions() {
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  const changeSpeed = (speed: number) => {
    /**
     * Send a message to the content script to change the playback speed
     * Uses the chrome.tabs API to get the active tab and send the message to a selected tab.
     * In this case the tab will be 0 (the active tab)
     */
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(
        tabs[0].id || 0,
        { type: "change-playback-speed", speed }, // send the speed to the content script
        (response) => {
          console.log("Response from content script:", response);
        }
      );
    });
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-lg text-white">
      <h2 className="text-sm font-semibold mb-3 text-zinc-300">
        Playback Speed
      </h2>
      <div className="flex flex-wrap justify-center gap-2 pb-2">
        {options.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              setSelectedSpeed(option.value);
              changeSpeed(option.value);
            }}
            className={`
              px-3 py-1 text-sm rounded-full transition-all duration-200
              ${
                selectedSpeed === option.value
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }
            `}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
