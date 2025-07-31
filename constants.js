// Centralized constants for element selectors, storage keys, and IDs

// Storage keys for settings
export const STORAGE_KEYS = [
  "hideHomeFeed",
  "hideSubredditFeed",
  "hideSideBar",
  "hideComments",
  "hideRecentPosts",
  "hideTrending",
  "hidePopular",
  "hideExplore",
  "hideCustomFeeds",
  "hideRecentSubreddits",
  "hideCommunities"
];

// Element selectors and IDs for hiding
export const SELECTORS = {
  homeFeed: "shreddit-feed",
  subredditFeed: "shreddit-feed",
  comments: "shreddit-comment",
  recentPosts: "recent-posts",
  trending: "#reddit-trending-searches-partial-container",
  leftSidebar: "#left-sidebar",
  rightSidebar: "#right-sidebar-container",
  popular: "#popular-posts, [id='popular-posts'], li[id='popular-posts']",
  explore: "#explore, [id='explore'], li[id='explore']",
  customFeeds: "[data-testid='custom-feeds'], [id*='custom'], [id*='feeds']",
  recentSubreddits: "[data-testid='recent-subreddits'], [id*='recent'], [id*='subreddit']",
  communities: "[data-testid='communities'], [id*='communities'], [id*='community']"
};

// Option element IDs (for options.js)
export const OPTION_IDS = {
  hideHomeFeed: "hideHomeFeed",
  hideSubredditFeed: "hideSubredditFeed",
  hideSideBar: "hideSideBar",
  hideComments: "hideComments",
  hideRecentPosts: "hideRecentPosts",
  hideTrending: "hideTrending",
  hidePopular: "hidePopular",
  hideExplore: "hideExplore",
  hideCustomFeeds: "hideCustomFeeds",
  hideRecentSubreddits: "hideRecentSubreddits",
  hideCommunities: "hideCommunities"
};