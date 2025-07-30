import { STORAGE_KEYS, OPTION_IDS } from "./constants.js";

// Ensure browser API is available
if (typeof browser === "undefined") {
    var browser = chrome;
}

const hideHomeFeed = document.getElementById(OPTION_IDS.hideHomeFeed);
const hideSubredditFeed = document.getElementById(OPTION_IDS.hideSubredditFeed);
const hideSideBar = document.getElementById(OPTION_IDS.hideSideBar);
const hideComments = document.getElementById(OPTION_IDS.hideComments);
const hideRecentPosts = document.getElementById(OPTION_IDS.hideRecentPosts);
const hideTrending = document.getElementById(OPTION_IDS.hideTrending);

// Load settings on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log('Loading settings...');
    browser.storage.sync.get(STORAGE_KEYS, (data = {}) => {
        console.log('Loaded data:', data);
        hideHomeFeed.checked = data.hideHomeFeed || false;
        hideSubredditFeed.checked = data.hideSubredditFeed || false;
        hideSideBar.checked = data.hideSideBar || false;
        hideComments.checked = data.hideComments || false;
        hideRecentPosts.checked = data.hideRecentPosts || false;
        hideTrending.checked = data.hideTrending || false;
    });
});

// Auto-save when any toggle is changed
const saveSettings = () => {
    const settings = {
        hideHomeFeed: hideHomeFeed.checked,
        hideSubredditFeed: hideSubredditFeed.checked,
        hideSideBar: hideSideBar.checked,
        hideComments: hideComments.checked,
        hideRecentPosts: hideRecentPosts.checked,
        hideTrending: hideTrending.checked
    };

    console.log('Saving settings:', settings);

    browser.storage.sync.set(settings).then(() => {
        console.log('Settings saved successfully');
    }).catch((error) => {
        console.error('Error saving settings:', error);
    });
};

// Add event listeners for auto-save
hideHomeFeed.addEventListener('change', saveSettings);
hideSubredditFeed.addEventListener('change', saveSettings);
hideSideBar.addEventListener('change', saveSettings);
hideComments.addEventListener('change', saveSettings);
hideRecentPosts.addEventListener('change', saveSettings);
hideTrending.addEventListener('change', saveSettings);
