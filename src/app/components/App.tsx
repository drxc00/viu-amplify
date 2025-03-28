import { useState } from "react";
import { Button } from "./ui/button";
import { PlaybackOptions } from "./playback-options";
import { Features } from "./features";
import { FileWarningIcon } from "lucide-react";

type Pages = "playback" | "home" | "features" | "invalid" | string;

const pages = [
  {
    label: "Home",
    value: "home",
  },
  {
    label: "Playback Options",
    value: "playback",
  },
  {
    label: "Features",
    value: "features",
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Pages>("home");

  // Get the current url
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      if (!url?.includes("viu.com")) {
        // If the url does not contain viu.com, show an error message
        setCurrentPage("invalid");
      }
    }
  });

  if (currentPage === "invalid") {
    return (
      <main className="bg-zinc-950 w-[200px] h-[200px] p-4 flex flex-col items-center justify-center">
        <FileWarningIcon className="w-8 h-8 text-amber-500" />
        <h1 className="text-amber-500 text-xl font-bold mb-2">
          Viu Amplify Error
        </h1>
        <p className="text-zinc-300 text-center">
          You are not watching on Viu. Please visit Viu.com to use Viu Amplify
        </p>
      </main>
    );
  }

  return (
    <main className="bg-zinc-950 w-[400px] h-[300px] p-4 flex flex-col">
      {currentPage === "home" && (
        <>
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-amber-500 text-2xl font-bold mb-2">
              Viu Amplify
            </h1>
            <p className="text-zinc-300 text-center">
              Amplify your Viu streaming experience with quality of life
              features.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-grow">
            {pages.map((page) => (
              <Button
                key={page.value}
                onClick={() => setCurrentPage(page.value as string)}
                className={`
                w-full py-3 text-md font-semibold rounded-lg transition-all duration-200
                ${
                  page.value === currentPage
                    ? "bg-amber-600 text-zinc-950"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }
              `}
              >
                {page.label}
              </Button>
            ))}
          </div>
        </>
      )}

      {currentPage !== "home" && (
        <div className="flex flex-col gap-3 flex-grow">
          <Button
            onClick={() => setCurrentPage("home")}
            className="
              w-full py-3 text-md font-semibold rounded-lg
              bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white
            "
          >
            Back to Home
          </Button>

          {currentPage === "playback" && <PlaybackOptions />}
          {currentPage === "features" && <Features />}
        </div>
      )}
    </main>
  );
}
