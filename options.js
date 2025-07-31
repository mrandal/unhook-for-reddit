// Ensure browser API is available
if (typeof browser === "undefined") {
    var browser = chrome;
}

// Constants for storage keys and option IDs
const STORAGE_KEYS = [
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

const OPTION_IDS = {
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

const hideHomeFeed = document.getElementById(OPTION_IDS.hideHomeFeed);
const hideSubredditFeed = document.getElementById(OPTION_IDS.hideSubredditFeed);
const hideSideBar = document.getElementById(OPTION_IDS.hideSideBar);
const hideComments = document.getElementById(OPTION_IDS.hideComments);
const hideRecentPosts = document.getElementById(OPTION_IDS.hideRecentPosts);
const hideTrending = document.getElementById(OPTION_IDS.hideTrending);
const hidePopular = document.getElementById(OPTION_IDS.hidePopular);
const hideExplore = document.getElementById(OPTION_IDS.hideExplore);
const hideCustomFeeds = document.getElementById(OPTION_IDS.hideCustomFeeds);
const hideRecentSubreddits = document.getElementById(OPTION_IDS.hideRecentSubreddits);
const hideCommunities = document.getElementById(OPTION_IDS.hideCommunities);

// Get sidebar sub-option containers for enabling/disabling
const sidebarSubOptions = document.querySelectorAll('.sidebar-sub-option');

// Function to update sidebar sub-options state
const updateSidebarSubOptions = () => {
    const isMainSidebarHidden = hideSideBar.checked;

    sidebarSubOptions.forEach(container => {
        if (isMainSidebarHidden) {
            container.classList.add('disabled');
        } else {
            container.classList.remove('disabled');
        }
    });
};

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
        hidePopular.checked = data.hidePopular || false;
        hideExplore.checked = data.hideExplore || false;
        hideCustomFeeds.checked = data.hideCustomFeeds || false;
        hideRecentSubreddits.checked = data.hideRecentSubreddits || false;
        hideCommunities.checked = data.hideCommunities || false;

        // Update sidebar sub-options state
        updateSidebarSubOptions();
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
        hideTrending: hideTrending.checked,
        hidePopular: hidePopular.checked,
        hideExplore: hideExplore.checked,
        hideCustomFeeds: hideCustomFeeds.checked,
        hideRecentSubreddits: hideRecentSubreddits.checked,
        hideCommunities: hideCommunities.checked
    };

    console.log('Saving settings:', settings);

    browser.storage.sync.set(settings).then(() => {
        console.log('Settings saved successfully');
    }).catch((error) => {
        console.error('Error saving settings:', error);
    });
};

// Special handler for sidebar toggle that also updates sub-options
const handleSidebarToggle = () => {
    updateSidebarSubOptions();
    saveSettings();
};

// Add event listeners for auto-save
hideHomeFeed.addEventListener('change', saveSettings);
hideSubredditFeed.addEventListener('change', saveSettings);
hideSideBar.addEventListener('change', handleSidebarToggle); // Special handler for sidebar
hideComments.addEventListener('change', saveSettings);
hideRecentPosts.addEventListener('change', saveSettings);
hideTrending.addEventListener('change', saveSettings);
hidePopular.addEventListener('change', saveSettings);
hideExplore.addEventListener('change', saveSettings);
hideCustomFeeds.addEventListener('change', saveSettings);
hideRecentSubreddits.addEventListener('change', saveSettings);
hideCommunities.addEventListener('change', saveSettings);
