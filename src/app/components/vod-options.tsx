import { Layout } from "./layout";
import { SubtitleColor } from "./vod-options/subtitle-color";
import { PlaybackOptions } from "./vod-options/playback-options";
import { PictureInPictureMode } from "./vod-options/picture-in-picture";
import { SubtitleSize } from "./vod-options/subtitle-size";

export function VODOptions() {
  return (
    <Layout className="w-[300px]">
      <h2 className="text-xl text-center font-semibold text-primary">
        VOD Options
      </h2>
      <PlaybackOptions />
      <PictureInPictureMode />
      <SubtitleColor />
      <SubtitleSize />
      <p className="text-foreground/50 text-xs text-center italic">
        Persistent volume is automatically saved when you change it.
      </p>
    </Layout>
  );
}
