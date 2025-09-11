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

// Lock state storage keys
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

// Function to get user-friendly setting names
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

// Get sidebar sub-option containers for enabling/disabling
const sidebarSubOptions = document.querySelectorAll('.sidebar-sub-option');

// Get search sub-option containers for enabling/disabling
const searchSubOptions = document.querySelectorAll('.search-sub-option');

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

// Function to update search sub-options state
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

// Function to apply dark mode
const applyDarkMode = (isDark) => {
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
};

// Load settings on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log('Loading settings...');
    browser.storage.sync.get(STORAGE_KEYS, (data = {}) => {
        console.log('Loaded data:', data);
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

        // Apply dark mode immediately
        applyDarkMode(darkMode.checked);

        // Update sidebar sub-options state
        updateSidebarSubOptions();

        // Update search sub-options state
        updateSearchSubOptions();
    });
});

// Auto-save when any toggle is changed
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

// Special handler for search toggle that also updates sub-options
const handleSearchToggle = () => {
    updateSearchSubOptions();
    saveSettings();
};

// Special handler for dark mode toggle that also applies the theme
const handleDarkModeToggle = () => {
    applyDarkMode(darkMode.checked);
    saveSettings();
};

// Add event listeners for auto-save
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

// Add immediate lock button state updates for each setting
const addImmediateLockUpdates = () => {
    const settings = [
        hideHomeFeed, hideSubredditFeed, hideSideBar, hideComments,
        hideRecentPosts, hideSearch, hideTrending, hidePopular, hideExplore,
        hideCustomFeeds, hideRecentSubreddits, hideCommunities, hideAll
    ];

    settings.forEach(setting => {
        setting.addEventListener('change', () => {
            // Find the corresponding lock button
            const settingId = setting.id;
            const lockButton = document.querySelector(`[data-setting="${settingId}"]`);

            if (lockButton) {
                // Update the lock button state immediately
                const isEnabled = setting.checked;
                const isLocked = lockButton.classList.contains('state-locked');
                console.log(`Setting ${settingId} changed to ${isEnabled}, updating lock button state`);
                updateLockButtonState(lockButton, settingId, isEnabled, isLocked);
            }
        });
    });
};

// Lock button functionality
const lockButtons = document.querySelectorAll('.lock-button');

// Function to update lock button state
const updateLockButtonState = (button, settingId, isEnabled, isLocked) => {
    const container = button.closest('.toggle-container');
    const icon = button.querySelector('.lock-icon');

    // Remove all state classes
    button.classList.remove('state-null', 'state-enabled', 'state-locked');
    container.classList.remove('locked');

    if (isLocked) {
        button.classList.add('state-locked', 'locked');
        container.classList.add('locked');
        button.title = 'Setting permanently locked - reinstall extension to unlock';
        icon.src = 'assets/lock-icon-red.png';
        console.log(`Lock button for ${settingId} set to LOCKED state (red)`);
    } else if (isEnabled) {
        button.classList.add('state-enabled');
        button.title = 'Click to permanently lock this setting';
        icon.src = 'assets/lock-icon-green.png';
        console.log(`Lock button for ${settingId} set to ENABLED state (green)`);
    } else {
        button.classList.add('state-null');
        button.title = 'Click to permanently lock this setting';
        icon.src = 'assets/lock-icon-white.png';
        console.log(`Lock button for ${settingId} set to NULL state (white)`);
    }
};

// Function to handle lock button clicks
const handleLockButtonClick = async (button, settingId) => {
    const isEnabled = document.getElementById(settingId).checked;
    const isLocked = button.classList.contains('state-locked');

    if (isLocked) {
        // Already locked, do nothing
        return;
    }

    if (!isEnabled) {
        // Try to show alert, but don't block functionality if it fails
        try {
            alert('You can only lock a setting when it is enabled (toggled on).');
        } catch (e) {
            console.log('Alert blocked by browser, continuing with functionality');
        }
        return;
    }

    // Show custom confirmation modal
    showConfirmModal(settingId, button);
};

// Custom confirmation modal functions
const showConfirmModal = (settingId, lockButton) => {
    const modal = document.getElementById('confirmModal');
    const settingNameSpan = document.getElementById('confirmSettingName');

    // Set the user-friendly setting name in the modal
    settingNameSpan.textContent = getSettingDisplayName(settingId);

    // Show the modal
    modal.classList.add('show');

    // Store the lock button reference for later use
    modal.dataset.lockButton = lockButton.dataset.setting;

    // Add event listeners for the modal buttons
    const cancelBtn = document.getElementById('cancelLockBtn');
    const confirmBtn = document.getElementById('confirmLockBtn');

    // Remove existing listeners to prevent duplicates
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));

    // Get fresh references after cloning
    const newCancelBtn = document.getElementById('cancelLockBtn');
    const newConfirmBtn = document.getElementById('confirmLockBtn');

    // Add new event listeners
    newCancelBtn.addEventListener('click', () => hideConfirmModal());
    newConfirmBtn.addEventListener('click', () => confirmLockAction(modal));

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideConfirmModal();
        }
    });

    // Close modal with Escape key
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
        // Lock the setting
        const lockKey = `lock_${settingId}`;
        await browser.storage.sync.set({ [lockKey]: true });

        // Update UI
        updateLockButtonState(lockButton, settingId, true, true);

        // Disable the toggle
        const toggle = document.getElementById(settingId);
        toggle.disabled = true;
        toggle.checked = true;

        console.log(`Setting ${settingId} has been permanently locked`);

        // Hide the modal
        hideConfirmModal();
    } catch (error) {
        console.error('Failed to lock setting:', error);
        // If locking fails, allow the setting to continue working normally
        hideConfirmModal();
    }
};

// Initialize lock buttons
const initializeLockButtons = async () => {
    try {
        // Load lock states
        const lockData = await browser.storage.sync.get(LOCK_STORAGE_KEYS);

        lockButtons.forEach(button => {
            const settingId = button.getAttribute('data-setting');
            const isEnabled = document.getElementById(settingId).checked;
            const isLocked = lockData[`lock_${settingId}`] || false;

            // Update button state
            updateLockButtonState(button, settingId, isEnabled, isLocked);

            // Add click handler
            button.addEventListener('click', () => handleLockButtonClick(button, settingId));

            // If locked, disable the toggle
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

// Update lock button states when settings change
const updateAllLockButtonStates = async () => {
    try {
        // Get current lock states from storage to ensure accuracy
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

// Initialize lock buttons after settings are loaded
document.addEventListener("DOMContentLoaded", () => {
    // Wait for settings to load, then initialize lock buttons
    setTimeout(() => {
        initializeLockButtons();
        addImmediateLockUpdates();
    }, 100);
});

// Update lock button states when settings change
const originalSaveSettings = saveSettings;
saveSettings = () => {
    originalSaveSettings();
    // Update lock button states after a short delay to ensure settings are saved
    setTimeout(() => {
        updateAllLockButtonStates();
    }, 50);
};
