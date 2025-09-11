if (typeof browser === "undefined") {
    var browser = chrome;
}

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

const LOCK_STORAGE_KEYS = [
    "lock_hideHomeFeed",
    "lock_hideSubredditFeed",
    "lock_hideSideBar",
    "lock_hideComments",
    "lock_hideRecentPosts",
    "lock_hideSearch",
    "lock_hideTrending",
    "lock_hidePopular",
    "lock_hideExplore",
    "lock_hideCustomFeeds",
    "lock_hideRecentSubreddits",
    "lock_hideCommunities",
    "lock_hideAll"
];

const OPTION_IDS = {
    hideHomeFeed: "hideHomeFeed",
    hideSubredditFeed: "hideSubredditFeed",
    hideSideBar: "hideSideBar",
    hideComments: "hideComments",
    hideRecentPosts: "hideRecentPosts",
    hideSearch: "hideSearch",
    hideTrending: "hideTrending",
    hidePopular: "hidePopular",
    hideExplore: "hideExplore",
    hideCustomFeeds: "hideCustomFeeds",
    hideRecentSubreddits: "hideRecentSubreddits",
    hideCommunities: "hideCommunities",
    hideAll: "hideAll",
    darkMode: "darkMode"
};

const getSettingDisplayName = (settingId) => {
    const displayNames = {
        hideHomeFeed: "Hide Home Feed",
        hideSubredditFeed: "Hide Subreddit Feed",
        hideSideBar: "Hide Left Sidebar",
        hideComments: "Hide Comments",
        hideRecentPosts: "Hide Recent Posts",
        hideSearch: "Hide Search",
        hideTrending: "Hide Trending Searches",
        hidePopular: "Hide Popular",
        hideExplore: "Hide Explore",
        hideCustomFeeds: "Hide Custom Feeds",
        hideRecentSubreddits: "Hide Recent Subreddits",
        hideCommunities: "Hide Communities",
        hideAll: "Hide r/All",
    };

    return displayNames[settingId] || settingId;
};

const darkMode = document.getElementById(OPTION_IDS.darkMode);
const hideHomeFeed = document.getElementById(OPTION_IDS.hideHomeFeed);
const hideSubredditFeed = document.getElementById(OPTION_IDS.hideSubredditFeed);
const hideSideBar = document.getElementById(OPTION_IDS.hideSideBar);
const hideComments = document.getElementById(OPTION_IDS.hideComments);
const hideRecentPosts = document.getElementById(OPTION_IDS.hideRecentPosts);
const hideSearch = document.getElementById(OPTION_IDS.hideSearch);
const hideTrending = document.getElementById(OPTION_IDS.hideTrending);
const hidePopular = document.getElementById(OPTION_IDS.hidePopular);
const hideExplore = document.getElementById(OPTION_IDS.hideExplore);
const hideCustomFeeds = document.getElementById(OPTION_IDS.hideCustomFeeds);
const hideRecentSubreddits = document.getElementById(OPTION_IDS.hideRecentSubreddits);
const hideCommunities = document.getElementById(OPTION_IDS.hideCommunities);
const hideAll = document.getElementById(OPTION_IDS.hideAll);

const sidebarSubOptions = document.querySelectorAll('.sidebar-sub-option');

const searchSubOptions = document.querySelectorAll('.search-sub-option');

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

const updateSearchSubOptions = () => {
    const isMainSearchHidden = hideSearch.checked;

    searchSubOptions.forEach(container => {
        if (isMainSearchHidden) {
            container.classList.add('disabled');
        } else {
            container.classList.remove('disabled');
        }
    });
};

const applyDarkMode = (isDark) => {
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
};

document.addEventListener("DOMContentLoaded", () => {
    browser.storage.sync.get(STORAGE_KEYS, (data = {}) => {
        darkMode.checked = data.darkMode || false;
        hideHomeFeed.checked = data.hideHomeFeed || false;
        hideSubredditFeed.checked = data.hideSubredditFeed || false;
        hideSideBar.checked = data.hideSideBar || false;
        hideComments.checked = data.hideComments || false;
        hideRecentPosts.checked = data.hideRecentPosts || false;
        hideSearch.checked = data.hideSearch || false;
        hideTrending.checked = data.hideTrending || false;
        hidePopular.checked = data.hidePopular || false;
        hideExplore.checked = data.hideExplore || false;
        hideCustomFeeds.checked = data.hideCustomFeeds || false;
        hideRecentSubreddits.checked = data.hideRecentSubreddits || false;
        hideCommunities.checked = data.hideCommunities || false;
        hideAll.checked = data.hideAll || false;

        applyDarkMode(darkMode.checked);
        updateSidebarSubOptions();
        updateSearchSubOptions();
    });
});

const saveSettings = () => {
    const settings = {
        darkMode: darkMode.checked,
        hideHomeFeed: hideHomeFeed.checked,
        hideSubredditFeed: hideSubredditFeed.checked,
        hideSideBar: hideSideBar.checked,
        hideComments: hideComments.checked,
        hideRecentPosts: hideRecentPosts.checked,
        hideSearch: hideSearch.checked,
        hideTrending: hideTrending.checked,
        hidePopular: hidePopular.checked,
        hideExplore: hideExplore.checked,
        hideCustomFeeds: hideCustomFeeds.checked,
        hideRecentSubreddits: hideRecentSubreddits.checked,
        hideCommunities: hideCommunities.checked,
        hideAll: hideAll.checked,
    };

    browser.storage.sync.set(settings).catch((error) => {
        console.error('Error saving settings:', error);
    });
};

const handleSidebarToggle = () => {
    updateSidebarSubOptions();
    saveSettings();
};

const handleSearchToggle = () => {
    updateSearchSubOptions();
    saveSettings();
};

const handleDarkModeToggle = () => {
    applyDarkMode(darkMode.checked);
    saveSettings();
};

darkMode.addEventListener('change', handleDarkModeToggle); // Special handler for dark mode
hideHomeFeed.addEventListener('change', saveSettings);
hideSubredditFeed.addEventListener('change', saveSettings);
hideSideBar.addEventListener('change', handleSidebarToggle); // Special handler for sidebar
hideComments.addEventListener('change', saveSettings);
hideRecentPosts.addEventListener('change', saveSettings);
hideSearch.addEventListener('change', handleSearchToggle); // Special handler for search
hideTrending.addEventListener('change', saveSettings);
hidePopular.addEventListener('change', saveSettings);
hideExplore.addEventListener('change', saveSettings);
hideCustomFeeds.addEventListener('change', saveSettings);
hideRecentSubreddits.addEventListener('change', saveSettings);
hideCommunities.addEventListener('change', saveSettings);
hideAll.addEventListener('change', saveSettings);

const addImmediateLockUpdates = () => {
    const settings = [
        hideHomeFeed, hideSubredditFeed, hideSideBar, hideComments,
        hideRecentPosts, hideSearch, hideTrending, hidePopular, hideExplore,
        hideCustomFeeds, hideRecentSubreddits, hideCommunities, hideAll
    ];

    settings.forEach(setting => {
        setting.addEventListener('change', () => {
            const settingId = setting.id;
            const lockButton = document.querySelector(`[data-setting="${settingId}"]`);

            if (lockButton) {
                const isEnabled = setting.checked;
                const isLocked = lockButton.classList.contains('state-locked');
                updateLockButtonState(lockButton, settingId, isEnabled, isLocked);
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
    if (isLocked) {
        return;
    }
    if (!isEnabled) {
        try {
            alert('You can only lock a setting when it is enabled (toggled on).');
        } catch (e) {
            console.log('Alert blocked by browser, continuing with functionality');
        }
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
    const newCancelBtn = document.getElementById('cancelLockBtn');
    const newConfirmBtn = document.getElementById('confirmLockBtn');
    newCancelBtn.addEventListener('click', () => hideConfirmModal());
    newConfirmBtn.addEventListener('click', () => confirmLockAction(modal));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideConfirmModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            hideConfirmModal();
        }
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
        const lockKey = `lock_${settingId}`;
        await browser.storage.sync.set({ [lockKey]: true });
        updateLockButtonState(lockButton, settingId, true, true);
        const toggle = document.getElementById(settingId);
        toggle.disabled = true;
        toggle.checked = true;
        hideConfirmModal();
    } catch (error) {
        console.error('Failed to lock setting:', error);
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
saveSettings = () => {
    originalSaveSettings();
    setTimeout(() => {
        updateAllLockButtonStates();
    }, 50);
};