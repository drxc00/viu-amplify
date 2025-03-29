import { useState } from "react";
import { Button } from "./ui/button";
import { Layout } from "./layout";
import { twMerge } from "tailwind-merge";

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
  const [selectedSpeed, setSelectedSpeed] = useState(
    parseFloat(localStorage.getItem("playbackSpeed") || "1")
  );

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

      // Save to popup state
      localStorage.setItem("playbackSpeed", speed.toString());
    });
  };

  return (
    <Layout className="w-[200px]">
      <h2 className="text-xl text-center font-semibold text-primary">
        Playback Speed
      </h2>
      <div className="w-full flex flex-col justify-center gap-2 p-4 bg-foreground/10 rounded-lg border border-foreground/40">
        {options.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              setSelectedSpeed(option.value);
              changeSpeed(option.value);
            }}
            className={twMerge(
              "px-3 py-1 text-sm rounded-full transition-all duration-200",
              selectedSpeed === option.value
                ? "bg-primary text-background"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Layout>
  );
}
