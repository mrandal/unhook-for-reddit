if (typeof browser === "undefined") {
    var browser = chrome;
}

// Detect Android platform and apply mobile UI
(async () => {
    try {
        const platformInfo = await browser.runtime.getPlatformInfo();
        if (platformInfo.os === 'android') {
            document.body.classList.add('platform-android');
        }
    } catch (error) {
        console.log('Platform detection not available:', error);
    }
})();

const STORAGE_KEYS = [
    "hideHomeFeed",
    "hideGallery",
    "hideSubredditFeed",
    "hideCommunityHighlights",
    "hideSideBar",
    "hideGames",
    "hideComments",
    "hideUpvotes",
    "hideUpvoteCount",
    "hideRightSidebar",
    "hideRecentPosts",
    "hideSubredditInfo",
    "hidePopularCommunities",
    "hideSearch",
    "hideTrending",
    "hidePopular",
    "hideExplore",
    "hideCustomFeeds",
    "hideRecentSubreddits",
    "hideCommunities",
    "hideAll",
    "hideNotifications",
    "darkMode"
];

const LOCK_STORAGE_KEYS = [
    "lock_hideHomeFeed",
    "lock_hideGallery",
    "lock_hideSubredditFeed",
    "lock_hideCommunityHighlights",
    "lock_hideSideBar",
    "lock_hideGames",
    "lock_hideComments",
    "lock_hideUpvotes",
    "lock_hideUpvoteCount",
    "lock_hideRightSidebar",
    "lock_hideRecentPosts",
    "lock_hideSubredditInfo",
    "lock_hidePopularCommunities",
    "lock_hideSearch",
    "lock_hideTrending",
    "lock_hidePopular",
    "lock_hideExplore",
    "lock_hideCustomFeeds",
    "lock_hideRecentSubreddits",
    "lock_hideCommunities",
    "lock_hideAll",
    "lock_hideNotifications"
];


const getSettingDisplayName = (settingId) => {
    const displayNames = {
        hideHomeFeed: "Hide Home Feed",
        hideGallery: "Hide Gallery",
        hideSubredditFeed: "Hide Subreddit Feed",
        hideCommunityHighlights: "Hide Community Highlights",
        hideSideBar: "Hide Left Sidebar",
        hideGames: "Hide Games",
        hideComments: "Hide Comments",
        hideUpvotes: "Hide Upvotes",
        hideUpvoteCount: "Hide Upvote Count",
        hideRightSidebar: "Hide Right Sidebar",
        hideRecentPosts: "Hide Recent Posts",
        hideSubredditInfo: "Hide Subreddit Info",
        hidePopularCommunities: "Hide Popular Communities",
        hideSearch: "Hide Search",
        hideTrending: "Hide Trending Searches",
        hidePopular: "Hide Popular",
        hideExplore: "Hide Explore",
        hideCustomFeeds: "Hide Custom Feeds",
        hideRecentSubreddits: "Hide Recent Subreddits",
        hideCommunities: "Hide Communities",
        hideAll: "Hide r/All",
        hideNotifications: "Hide Notifications"
    };
    return displayNames[settingId] || settingId;
};

const darkMode = document.getElementById('darkMode');
const hideHomeFeed = document.getElementById('hideHomeFeed');
const hideGallery = document.getElementById('hideGallery');
const hideSubredditFeed = document.getElementById('hideSubredditFeed');
const hideCommunityHighlights = document.getElementById('hideCommunityHighlights');
const hideSideBar = document.getElementById('hideSideBar');
const hideGames = document.getElementById('hideGames');
const hideComments = document.getElementById('hideComments');
const hideUpvotes = document.getElementById('hideUpvotes');
const hideUpvoteCount = document.getElementById('hideUpvoteCount');
const hideRightSidebar = document.getElementById('hideRightSidebar');
const hideRecentPosts = document.getElementById('hideRecentPosts');
const hideSubredditInfo = document.getElementById('hideSubredditInfo');
const hidePopularCommunities = document.getElementById('hidePopularCommunities');
const hideSearch = document.getElementById('hideSearch');
const hideTrending = document.getElementById('hideTrending');
const hidePopular = document.getElementById('hidePopular');
const hideExplore = document.getElementById('hideExplore');
const hideCustomFeeds = document.getElementById('hideCustomFeeds');
const hideRecentSubreddits = document.getElementById('hideRecentSubreddits');
const hideCommunities = document.getElementById('hideCommunities');
const hideAll = document.getElementById('hideAll');
const hideNotifications = document.getElementById('hideNotifications');

const sidebarSubOptions = document.querySelectorAll('.sidebar-sub-option');
const searchSubOptions = document.querySelectorAll('.search-sub-option');
const rightSidebarSubOptions = document.querySelectorAll('.right-sidebar-sub-option');
const commentsSubOptions = document.querySelectorAll('.comments-sub-option');
const upvotesSubOptions = document.querySelectorAll('.upvotes-sub-option');

const updateSubOptions = (subOptions, isHidden) => {
    subOptions.forEach(container => {
        container.classList.toggle('disabled', isHidden);
    });
};

const applyDarkMode = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
};

document.addEventListener("DOMContentLoaded", () => {
    browser.storage.sync.get(STORAGE_KEYS, (data = {}) => {
        darkMode.checked = data.darkMode || false;
        hideHomeFeed.checked = data.hideHomeFeed || false;
        hideGallery.checked = data.hideGallery || false;
        hideSubredditFeed.checked = data.hideSubredditFeed || false;
        hideCommunityHighlights.checked = data.hideCommunityHighlights || false;
        hideSideBar.checked = data.hideSideBar || false;
        hideGames.checked = data.hideGames || false;
        hideComments.checked = data.hideComments || false;
        hideUpvotes.checked = data.hideUpvotes || false;
        hideUpvoteCount.checked = data.hideUpvoteCount || false;
        hideRightSidebar.checked = data.hideRightSidebar || false;
        hideRecentPosts.checked = data.hideRecentPosts || false;
        hideSubredditInfo.checked = data.hideSubredditInfo || false;
        hidePopularCommunities.checked = data.hidePopularCommunities || false;
        hideSearch.checked = data.hideSearch || false;
        hideTrending.checked = data.hideTrending || false;
        hidePopular.checked = data.hidePopular || false;
        hideExplore.checked = data.hideExplore || false;
        hideCustomFeeds.checked = data.hideCustomFeeds || false;
        hideRecentSubreddits.checked = data.hideRecentSubreddits || false;
        hideCommunities.checked = data.hideCommunities || false;
        hideAll.checked = data.hideAll || false;
        hideNotifications.checked = data.hideNotifications || false;

        applyDarkMode(darkMode.checked);
        updateSubOptions(sidebarSubOptions, hideSideBar.checked);
        updateSubOptions(searchSubOptions, hideSearch.checked);
        updateSubOptions(rightSidebarSubOptions, hideRightSidebar.checked);
        updateSubOptions(commentsSubOptions, hideComments.checked);
        updateSubOptions(upvotesSubOptions, hideUpvotes.checked);
    });
});

const saveSettings = () => {
    const settings = {
        darkMode: darkMode.checked,
        hideHomeFeed: hideHomeFeed.checked,
        hideGallery: hideGallery.checked,
        hideSubredditFeed: hideSubredditFeed.checked,
        hideCommunityHighlights: hideCommunityHighlights.checked,
        hideSideBar: hideSideBar.checked,
        hideGames: hideGames.checked,
        hideComments: hideComments.checked,
        hideUpvotes: hideUpvotes.checked,
        hideUpvoteCount: hideUpvoteCount.checked,
        hideRightSidebar: hideRightSidebar.checked,
        hideRecentPosts: hideRecentPosts.checked,
        hideSubredditInfo: hideSubredditInfo.checked,
        hidePopularCommunities: hidePopularCommunities.checked,
        hideSearch: hideSearch.checked,
        hideTrending: hideTrending.checked,
        hidePopular: hidePopular.checked,
        hideExplore: hideExplore.checked,
        hideCustomFeeds: hideCustomFeeds.checked,
        hideRecentSubreddits: hideRecentSubreddits.checked,
        hideCommunities: hideCommunities.checked,
        hideAll: hideAll.checked,
        hideNotifications: hideNotifications.checked
    };
    browser.storage.sync.set(settings).catch((error) => {
        console.error('Error saving settings:', error);
    });
};

const handleSidebarToggle = () => {
    updateSubOptions(sidebarSubOptions, hideSideBar.checked);
    saveSettings();
};

const handleSearchToggle = () => {
    updateSubOptions(searchSubOptions, hideSearch.checked);
    saveSettings();
};

const handleRightSidebarToggle = () => {
    updateSubOptions(rightSidebarSubOptions, hideRightSidebar.checked);
    saveSettings();
};

const handleCommentsToggle = () => {
    updateSubOptions(commentsSubOptions, hideComments.checked);
    saveSettings();
};

const handleUpvotesToggle = () => {
    updateSubOptions(upvotesSubOptions, hideUpvotes.checked);
    saveSettings();
};

const handleDarkModeToggle = () => {
    applyDarkMode(darkMode.checked);
    saveSettings();
};

darkMode.addEventListener('change', handleDarkModeToggle);

[hideHomeFeed, hideGallery, hideSubredditFeed, hideCommunityHighlights, hideGames, hideUpvoteCount, hideRecentPosts, hideSubredditInfo, hidePopularCommunities, hideTrending, hidePopular, hideExplore, hideCustomFeeds, hideRecentSubreddits, hideCommunities, hideAll, hideNotifications].forEach(setting => {
    setting.addEventListener('change', saveSettings);
});

hideSideBar.addEventListener('change', handleSidebarToggle);
hideSearch.addEventListener('change', handleSearchToggle);
hideRightSidebar.addEventListener('change', handleRightSidebarToggle);
hideComments.addEventListener('change', handleCommentsToggle);
hideUpvotes.addEventListener('change', handleUpvotesToggle);

const addImmediateLockUpdates = () => {
    const settings = [
        hideHomeFeed, hideGallery, hideSubredditFeed, hideCommunityHighlights, hideSideBar, hideGames, hideComments, hideUpvotes, hideUpvoteCount,
        hideRightSidebar, hideRecentPosts, hideSubredditInfo, hidePopularCommunities, hideSearch, hideTrending, hidePopular, hideExplore,
        hideCustomFeeds, hideRecentSubreddits, hideCommunities, hideAll, hideNotifications
    ];

    settings.forEach(setting => {
        setting.addEventListener('change', () => {
            const lockButton = document.querySelector(`[data-setting="${setting.id}"]`);
            if (lockButton) {
                const isLocked = lockButton.classList.contains('state-locked');
                updateLockButtonState(lockButton, setting.id, setting.checked, isLocked);
            }
        });
    });
};

const lockButtons = document.querySelectorAll('.lock-button');

const updateLockButtonState = (button, settingId, isEnabled, isLocked) => {
    const container = button.closest('.toggle-container');
    const icon = button.querySelector('.lock-icon');

    button.classList.remove('state-null', 'state-enabled', 'state-locked');
    container.classList.remove('locked');

    if (isLocked) {
        button.classList.add('state-locked', 'locked');
        container.classList.add('locked');
        button.title = 'Setting permanently locked - reinstall extension to unlock';
        icon.src = 'assets/lock-icon-red.png';
    } else if (isEnabled) {
        button.classList.add('state-enabled');
        button.title = 'Click to permanently lock this setting';
        icon.src = 'assets/lock-icon-green.png';
    } else {
        button.classList.add('state-null');
        button.title = 'Click to permanently lock this setting';
        icon.src = 'assets/lock-icon-white.png';
    }
};

const handleLockButtonClick = async (button, settingId) => {
    const isEnabled = document.getElementById(settingId).checked;
    const isLocked = button.classList.contains('state-locked');
    if (isLocked) return;
    if (!isEnabled) {
        alert('You can only lock a setting when it is enabled (toggled on).');
        return;
    }
    showConfirmModal(settingId, button);
};

const showConfirmModal = (settingId, lockButton) => {
    const modal = document.getElementById('confirmModal');
    const settingNameSpan = document.getElementById('confirmSettingName');
    settingNameSpan.textContent = getSettingDisplayName(settingId);
    modal.classList.add('show');
    modal.dataset.lockButton = lockButton.dataset.setting;

    const cancelBtn = document.getElementById('cancelLockBtn');
    const confirmBtn = document.getElementById('confirmLockBtn');
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));

    document.getElementById('cancelLockBtn').addEventListener('click', () => hideConfirmModal());
    document.getElementById('confirmLockBtn').addEventListener('click', () => confirmLockAction(modal));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideConfirmModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) hideConfirmModal();
    });
};

const hideConfirmModal = () => {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
};

const confirmLockAction = async (modal) => {
    const settingId = modal.dataset.lockButton;
    const lockButton = document.querySelector(`[data-setting="${settingId}"]`);
    try {
        await browser.storage.sync.set({ [`lock_${settingId}`]: true });
        updateLockButtonState(lockButton, settingId, true, true);
        const toggle = document.getElementById(settingId);
        toggle.disabled = true;
        toggle.checked = true;
    } catch (error) {
        console.error('Failed to lock setting:', error);
    } finally {
        hideConfirmModal();
    }
};

const initializeLockButtons = async () => {
    try {
        const lockData = await browser.storage.sync.get(LOCK_STORAGE_KEYS);
        lockButtons.forEach(button => {
            const settingId = button.getAttribute('data-setting');
            const isEnabled = document.getElementById(settingId).checked;
            const isLocked = lockData[`lock_${settingId}`] || false;

            updateLockButtonState(button, settingId, isEnabled, isLocked);
            button.addEventListener('click', () => handleLockButtonClick(button, settingId));

            if (isLocked) {
                const toggle = document.getElementById(settingId);
                toggle.disabled = true;
                toggle.checked = true;
            }
        });
    } catch (error) {
        console.error('Error initializing lock buttons:', error);
    }
};

const updateAllLockButtonStates = async () => {
    try {
        const lockData = await browser.storage.sync.get(LOCK_STORAGE_KEYS);
        lockButtons.forEach(button => {
            const settingId = button.getAttribute('data-setting');
            const isEnabled = document.getElementById(settingId).checked;
            const isLocked = lockData[`lock_${settingId}`] || false;
            updateLockButtonState(button, settingId, isEnabled, isLocked);
        });
    } catch (error) {
        console.error('Error updating lock button states:', error);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        initializeLockButtons();
        addImmediateLockUpdates();
    }, 100);
});

const originalSaveSettings = saveSettings;
const wrappedSaveSettings = () => {
    originalSaveSettings();
    setTimeout(() => updateAllLockButtonStates(), 50);
};
saveSettings = wrappedSaveSettings;