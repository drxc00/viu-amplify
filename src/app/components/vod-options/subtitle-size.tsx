import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const SUBTITLE_SIZES = [
  { value: "default", label: "Default" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export function SubtitleSize() {
  const [selectedSize, setSelectedSize] = useState("medium");

  // Load saved size on component mount
  useEffect(() => {
    const savedSize = localStorage.getItem("subtitleSize") || "medium";
    setSelectedSize(savedSize);
  }, []);

  const changeSubtitleSize = (size: string) => {
    // Save to localStorage
    localStorage.setItem("subtitleSize", size);

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "change-subtitle-size", size },
          (response) => {
            console.log("Response from content script:", response);
          }
        );
      }
    });

    setSelectedSize(size);
  };

  return (
    <div className="p-4 bg-foreground/10 rounded-lg border border-foreground/40 w-full">
      <div className="mb-2 text-sm font-medium text-foreground">
        Subtitle Size
      </div>

      <div className="flex justify-between gap-2">
        {SUBTITLE_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => changeSubtitleSize(size.value)}
            className={twMerge(
              "flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200",
              selectedSize === size.value
                ? "bg-primary text-background"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}
