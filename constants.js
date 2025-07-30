// Centralized constants for element selectors, storage keys, and IDs

// Storage keys for settings
export const STORAGE_KEYS = [
  "hideHomeFeed",
  "hideSubredditFeed",
  "hideSideBar",
  "hideComments",
  "hideRecentPosts",
  "hideTrending"
];

// Element selectors and IDs for hiding
export const SELECTORS = {
  homeFeed: "shreddit-feed",
  subredditFeed: "shreddit-feed",
  comments: "shreddit-comment",
  recentPosts: "recent-posts",
  trending: "#reddit-trending-searches-partial-container",
  leftSidebar: "#left-sidebar",
  rightSidebar: "#right-sidebar-container"
};

// Option element IDs (for options.js)
export const OPTION_IDS = {
  hideHomeFeed: "hideHomeFeed",
  hideSubredditFeed: "hideSubredditFeed",
  hideSideBar: "hideSideBar",
  hideComments: "hideComments",
  hideRecentPosts: "hideRecentPosts",
  hideTrending: "hideTrending"
};