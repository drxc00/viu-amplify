import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const COLORS = [
  { label: "Default", value: "default" },
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
  { label: "Yellow", value: "yellow" },
  { label: "Purple", value: "purple" },
];

export function SubtitleColor() {
  const [selectedColor, setSelectedColor] = useState("default");

  // Load saved color on component mount
  useEffect(() => {
    const savedColor = localStorage.getItem("subtitleColor") || "default";
    setSelectedColor(savedColor);
  }, []);

  const changeSubtitleColor = (color: string) => {
    // Save to localStorage
    localStorage.setItem("subtitleColor", color);

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "change-subtitle-color", color },
          (response) => {
            console.log("Response from content script:", response);
          }
        );
      }
    });

    setSelectedColor(color);
  };

  return (
    <div className="p-4 bg-foreground/10 rounded-lg border border-foreground/40 w-full">
      <div className="mb-2 text-sm font-medium text-foreground">
        Subtitle Color
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => changeSubtitleColor(color.value)}
            className={twMerge(
              "px-2 py-1 text-xs rounded-lg transition-all duration-200",
              selectedColor === color.value
                ? "bg-primary text-background"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              color.value === "red" &&
                selectedColor !== color.value &&
                "border-l-2 border-red-500",
              color.value === "green" &&
                selectedColor !== color.value &&
                "border-l-2 border-green-500",
              color.value === "blue" &&
                selectedColor !== color.value &&
                "border-l-2 border-blue-500",
              color.value === "yellow" &&
                selectedColor !== color.value &&
                "border-l-2 border-yellow-500",
              color.value === "purple" &&
                selectedColor !== color.value &&
                "border-l-2 border-purple-500"
            )}
          >
            {color.label}
          </button>
        ))}
      </div>
    </div>
  );
}
