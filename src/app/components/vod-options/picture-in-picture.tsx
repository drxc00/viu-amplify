import { PictureInPicture } from "lucide-react";
import { Button } from "../ui/button";

export function PictureInPictureMode() {
  const enablePiP = () => {
    /**
     * Send a message to the content script to enable picture in picture mode
     * Uses the chrome.tabs API to get the active tab and send the message to a selected tab.
     * In this case the tab will be 0 (the active tab)
     */
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(
        tabs[0].id || 0,
        { type: "enable-pip" },
        (response) => {
          console.log("Response from content script:", response);
        }
      );
    });
  };
  return (
    <div className="w-full flex flex-col justify-center gap-2 p-4 bg-foreground/10 rounded-lg border border-foreground/40">
      <Button
        className="flex items-center gap-2 w-full justify-center"
        onClick={enablePiP}
      >
        <PictureInPicture className="w-4 h-4" />
        <span>Picture in picture Mode</span>
      </Button>
      <p className="text-foreground/50 text-xs text-center italic">
        Note: Subtitles are not supported in Picture-in-Picture mode.
      </p>
    </div>
  );
}
