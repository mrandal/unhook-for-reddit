/*
---------------------------------
CONSTANTS USED FOR STORAGE AND SELECTORS
---------------------------------
Unfortunately browser extensions can't import from other files (unless we use webpack), 
  so we keep a master list here. Constants should be updated here first, then copied to
  the top of content.js and options.js. 
*/

const STORAGE_KEYS = [
  "hideHomeFeed",
  "hideSubredditFeed",
  "hideSideBar",
  "hideComments",
  "hideRecentPosts",
  "hideSearch",
  "hideTrending",
  "hidePopular",
  "hideExplore",
  "hideCustomFeeds",
  "hideRecentSubreddits",
  "hideCommunities",
  "hideAll",
  "darkMode"
];

const SELECTORS = {
  homeFeed: "shreddit-feed",
  subredditFeed: "shreddit-feed",
  comments: "shreddit-comment",
  recentPosts: "recent-posts",
  search: "reddit-search-large",
  trending: "#reddit-trending-searches-partial-container",
  trendingLabel: "div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center",
  trendingContainer: "div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border",
  leftSidebar: "#left-sidebar",
  popular: "#popular-posts",
  explore: "#explore-communities",
  customFeeds: "#multireddits_section",
  recentSubreddits: "reddit-recent-pages",
  communities: "#communities_section",
  all: "#all-posts"
};

const SHADOW_DOM_SELECTORS = {
  search: "reddit-search-large",
  sidebar: "reddit-sidebar-nav",
  leftTop: "left-nav-top-section"
};

const ELEMENTS_TO_SHADOW_DOM = {
  trending: "search",
  trendingLabel: "search",
  trendingContainer: "search",
  leftSidebar: "sidebar",
  popular: "sidebar",
  explore: "sidebar",
  customFeeds: "sidebar",
  recentSubreddits: "sidebar",
  communities: "sidebar",
  all: "sidebar"
};