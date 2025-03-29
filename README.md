# VAmplify - Chrome Extension

![Amplify Logo](src/static/logo.png)

A simple Chrome extension that enhances your viewing experience on Viu.com by adding missing features and quality-of-life improvements. This extension is built using **Manifest V3**, **React**, and **TypeScript**.

## Features

### Current Features

- **Persistent Volume Control** - Remembers your preferred volume level across videos and sessions (no more deafening 100% volume starts!).
- **Playback Speed Options** - Adds additional playback speed controls (1x, 1.25x, 1.5x, 1.75x, 2x) beyond Viu's default options.
- **Picture in Picture Mode** - Adds ability to enable Picture in Picture Mode. `NOTE: Subtitles do not inherently work with PiP`. 

## Installation

1. Clone this repository:

   ```sh
   git clone https://github.com/drxc00/viu-amplify
   cd viu-amplify
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Build the extension:

   ```sh
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable `Developer mode`.
   - Click `Load unpacked` and select the `dist` folder.

### Usage

Once installed, the extension works automatically on Viu.com:

- Volume will persist between videos. The extension will automatically listen to volume changes and persist the value.
- Additional speed options will appear in the popup extension.

### Contributing

Contributions are welcome! Here's how you can help:

- Report bugs or suggest features by opening an issue.
- Submit a pull request with improvements.
- Spread the word to other Viu users.

## Disclaimer

This extension is not affiliated with Viu.com or its parent company. It simply enhances the existing website's functionality. Moreover, this extension is still in progress; stability is not ensured.
