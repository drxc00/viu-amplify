/**
 * Modern websites are dynamic, in short, SPAs.
 * This can be difficult to handle with basic web navigation events.
 * As such we need some custom implementations
 *
 * Credits to for the inspiration: https://medium.com/@softvar/making-chrome-extension-smart-by-supporting-spa-websites-1f76593637e8
 * ? STATUS: a bit Unstable but working
 */

(function () {
  let tabId: number, currentUrl: string; // Declare globally

  /**
   * Debounce utility to prevent rapid, repeated message sending
   * Since we are sending messages to the content script, we need to debounce it
   */
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction<T extends any[]>(...args: T) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Send a message to the content script when the page is rendered
   * This function is reused when the URL changes
   */
  const sendPageRenderedMessage = debounce((tabId: number) => {
    try {
      chrome.tabs.sendMessage(tabId, { type: "page-rendered" }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
      });
    } catch (error) {
      console.error("Error sending page rendered message:", error);
    }
  }, 300);

  chrome.webRequest.onCompleted.addListener(
    function (details) {
      /**
       * We parse the URL information from the details
       * This will return all web requests
       * We then check if the URL is the same as the current URL
       *
       * VIU is built with nextjs, we can verify this with the path having /_next/ in it
       * Unlike the implmentation in the inspired medium article, we cannot use the pathname
       * So we simply compare the hostname
       */
      const parsedUrl = new URL(details.url);
      if (currentUrl && currentUrl.indexOf(parsedUrl.hostname) > -1 && tabId) {
        sendPageRenderedMessage(tabId);
      }
    },
    { urls: ["*://www.viu.com/*"] }
  );

  /**
   * Since VIU is built with nextjs, files are heavily cached when the page is rendered
   * This means we need to check if the URL is the same as the current URL
   * This will simply make sure that if there are no files downloaded from the server, then we still send the message
   * When the URL changes.
   */
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes("viu.com")) {
      tabId = details.tabId;
      currentUrl = details.url;
      sendPageRenderedMessage(tabId);
    }
  });

  /**
   * Preload the content script on VOD pages
   * This will help when the user freshly visits the site and the script is not injected yet
   * During development, I have noticed that when the script is not loaded since we haven't visited any VOD pages
   * It does not apply the volume persistence.
   * After testing it is proven to be cuased by the content script being loaded only when the user visits a VOD page with a hard refresh
   * Given that the application is created using react (next), its SPAs' behavior causes the script to not load when doing client redirects to VOD
   * As such we perform a pre-load of the script on VOD pages
   */
  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes("/vod/")) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["background.js"],
      });
    }
  });
})();
