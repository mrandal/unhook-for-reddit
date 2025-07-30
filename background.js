if (typeof browser === "undefined") {
  var browser = chrome;
}

const redirectMap = [
  "instagram.com",
  "x.com",
  "twitter.com",
  // "linkedin.com"
];

const redirectUrl = "https://codeforces.com/profile/mrandal";

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    return { redirectUrl };
  },
  {
    urls: redirectMap.map(domain => `*://${domain}/*`),
    types: ["main_frame"]
  },
  ["blocking"]
);
