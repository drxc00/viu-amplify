import { useState } from "react";
import { PlaybackOptions } from "./components/playback-options";
import { Error } from "./components/error";
import { Layout } from "./components/layout";

type Pages = "vodOptions" | "home" | "invalid" | string;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Pages>("home");

  // Get the current url
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      if (!url?.includes("viu.com")) {
        // If the url does not contain viu.com, show an error message
        setCurrentPage("invalid");
      } else if (url.includes("vod")) {
        // If the url contains viu.com, show the home page
        setCurrentPage("vodOptions");
      }
    }
  });

  if (currentPage === "invalid") return <Error />;
  if (currentPage === "vodOptions") return <PlaybackOptions />;

  /** Default page */
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-primary text-xl font-bold">VAmplify</h1>
        <p className="text-foreground text-center">
          Start streaming now and let VAmplify enhance your viewing!
        </p>
      </div>
    </Layout>
  );
}
