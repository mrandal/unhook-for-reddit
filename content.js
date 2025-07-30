console.log('=== CONTENT SCRIPT LOADED ===');

// Ensure browser API is available
if (typeof browser === "undefined") {
    var browser = chrome;
}

// Hardcoded constants for testing
const STORAGE_KEYS = [
    "hideHomeFeed",
    "hideSubredditFeed",
    "hideSideBar",
    "hideComments",
    "hideRecentPosts",
    "hideTrending"
];

const SELECTORS = {
    homeFeed: "shreddit-feed",
    subredditFeed: "shreddit-feed",
    comments: "shreddit-comment",
    recentPosts: "recent-posts",
    trending: "#reddit-trending-searches-partial-container",
    leftSidebar: "#left-sidebar",
    rightSidebar: "#right-sidebar-container"
};

// Store current settings globally
let currentSettings = {};

// Function to manually test trending container detection
const testTrendingContainer = () => {
    console.log('=== MANUAL TRENDING CONTAINER TEST ===');
    const container = document.querySelector('#reddit-trending-searches-partial-container');
    console.log('Direct container query:', container);

    if (container) {
        console.log('Container found!');
        console.log('Container HTML:', container.outerHTML);
        console.log('Container children:', container.children.length);
    } else {
        console.log('Container not found, checking for similar elements...');
        const similarElements = document.querySelectorAll('[id*="trending"], [id*="search"], [class*="trending"], [class*="search"]');
        console.log('Similar elements found:', similarElements.length);
        similarElements.forEach((el, index) => {
            console.log(`Similar element ${index}:`, el.id, el.className, el.tagName);
        });
    }
    console.log('=== END MANUAL TEST ===');
};

// Debug function to test all selectors
const testSelectors = () => {
    console.log('=== TESTING ALL SELECTORS ===');
    Object.entries(SELECTORS).forEach(([name, selector]) => {
        const elements = document.querySelectorAll(selector);
        console.log(`${name} (${selector}): ${elements.length} elements found`);
        if (elements.length > 0) {
            console.log('First element:', elements[0]);
        }
    });

    // Additional trending selectors to test
    console.log('=== ADDITIONAL TRENDING TESTS ===');
    const additionalTrendingSelectors = [
        '#reddit-trending-searches-partial-container',
        '[data-testid="reddit-trending-result"]',
        '[data-type="search-dropdown-item"]',
        'faceplate-tracker[data-testid="reddit-trending-result"]',
        '[data-faceplate-tracking-context*="trending"]',
        '.search-dropdown-item',
        '[data-testid*="trending"]'
    ];

    additionalTrendingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Additional trending test (${selector}): ${elements.length} elements found`);
        if (elements.length > 0) {
            console.log('First element:', elements[0]);
        }
    });
    console.log('=== END SELECTOR TEST ===');
};

// Function to apply visibility settings
const applyVisibilitySettings = () => {
    const isSubredditPage = window.location.pathname.startsWith('/r');
    console.log('applyVisibilitySettings called with settings:', currentSettings);
    console.log('Is subreddit page:', isSubredditPage);

    // Handle home feed
    const homeFeedElements = document.querySelectorAll(SELECTORS.homeFeed);
    if (!isSubredditPage) {
        homeFeedElements.forEach(element => {
            element.style.display = currentSettings.hideHomeFeed ? "none" : "";
        });
        console.log('Home feed elements:', homeFeedElements.length, 'hidden:', currentSettings.hideHomeFeed);
    }

    // Handle subreddit feed
    const subredditFeedElements = document.querySelectorAll(SELECTORS.subredditFeed);
    if (isSubredditPage) {
        subredditFeedElements.forEach(element => {
            element.style.display = currentSettings.hideSubredditFeed ? "none" : "";
        });
        console.log('Subreddit feed elements:', subredditFeedElements.length, 'hidden:', currentSettings.hideSubredditFeed);
    }

    // Handle comments
    const commentElements = document.querySelectorAll(SELECTORS.comments);
    commentElements.forEach(element => {
        element.style.display = currentSettings.hideComments ? "none" : "";
    });
    console.log('Comment elements:', commentElements.length, 'hidden:', currentSettings.hideComments);

    // Handle sidebars
    const leftSidebar = document.querySelector(SELECTORS.leftSidebar);
    const rightSidebar = document.querySelector(SELECTORS.rightSidebar);
    if (leftSidebar) {
        leftSidebar.style.display = currentSettings.hideSideBar ? "none" : "";
    }
    if (rightSidebar) {
        rightSidebar.style.display = currentSettings.hideSideBar ? "none" : "";
    }
    console.log('Sidebar elements - left:', !!leftSidebar, 'right:', !!rightSidebar, 'hidden:', currentSettings.hideSideBar);

    // Handle recent posts
    const recentPostElements = document.querySelectorAll(SELECTORS.recentPosts);
    recentPostElements.forEach(element => {
        element.style.display = currentSettings.hideRecentPosts ? "none" : "";
    });
    console.log('Recent posts elements:', recentPostElements.length, 'hidden:', currentSettings.hideRecentPosts);

    // Handle trending container with more specific selectors
    let trendingContainer = document.querySelector(SELECTORS.trending);
    if (!trendingContainer) {
        // Try more specific alternative selectors
        const alternativeSelectors = [
            '#reddit-trending-searches-partial-container',
            'ul[id*="trending-searches"]',
            'ul[role="menu"][id*="trending"]',
            'ul.search-results-list[id*="trending"]',
            'ul[class*="search-results-list"][id*="trending"]'
        ];

        for (const selector of alternativeSelectors) {
            trendingContainer = document.querySelector(selector);
            if (trendingContainer) {
                console.log(`Found trending container using alternative selector: ${selector}`);
                console.log('Container details:', {
                    id: trendingContainer.id,
                    className: trendingContainer.className,
                    tagName: trendingContainer.tagName,
                    role: trendingContainer.getAttribute('role')
                });
                break;
            }
        }
    }

    if (trendingContainer) {
        trendingContainer.style.display = currentSettings.hideTrending ? "none" : "";
        console.log('Trending container found and hidden:', currentSettings.hideTrending);
    } else {
        console.log('Trending container not found');
    }
};

// Main function to load and apply settings
const loadAndApplySettings = () => {
    console.log('loadAndApplySettings called');
    browser.storage.sync.get(STORAGE_KEYS, (data) => {
        console.log('Content script loaded settings:', data);
        currentSettings = data;

        // Test all selectors first
        testSelectors();

        // Apply visibility settings
        applyVisibilitySettings();
    });
};

// Listen for storage changes to update settings dynamically
browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        console.log('Settings changed:', changes);

        // Update current settings
        Object.keys(changes).forEach(key => {
            currentSettings[key] = changes[key].newValue;
        });

        // Reapply visibility settings
        applyVisibilitySettings();
    }
});

// Apply settings immediately
loadAndApplySettings();

// Set up observer for dynamically added elements
const observer = new MutationObserver((mutations) => {
    let shouldReapply = false;

    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if any of our target selectors are in the added nodes
                const selectors = Object.values(SELECTORS);
                selectors.forEach(selector => {
                    if (node.matches && node.matches(selector) ||
                        node.querySelector && node.querySelector(selector)) {
                        shouldReapply = true;
                    }
                });

                // Also check for trending container specifically
                if (node.matches && (node.matches('#reddit-trending-searches-partial-container') ||
                    node.querySelector && node.querySelector('#reddit-trending-searches-partial-container'))) {
                    console.log('Trending container detected in DOM changes');
                    shouldReapply = true;
                }
            }
        });
    });

    if (shouldReapply) {
        console.log('New elements detected, reapplying settings');
        applyVisibilitySettings();
    }
});

// Start observing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
    });
} else {
    observer.observe(document.body, { childList: true, subtree: true });
}

// Also reapply on clicks and other events that might trigger dynamic content
document.addEventListener('click', () => {
    setTimeout(() => {
        applyVisibilitySettings();
    }, 100);
});

// Listen for focus events on search inputs to catch when search dropdown appears
document.addEventListener('focusin', (event) => {
    if (event.target.matches && event.target.matches('input[type="search"], input[placeholder*="search"], input[aria-label*="search"]')) {
        console.log('Search input focused, checking for trending elements');

        // Test immediately
        testTrendingContainer();

        // Test with multiple delays
        [100, 200, 500, 1000].forEach(delay => {
            setTimeout(() => {
                console.log(`Testing trending container after ${delay}ms delay`);
                testTrendingContainer();
                applyVisibilitySettings();
            }, delay);
        });
    }
});

// Add manual test function to global scope for debugging
window.testTrending = testTrendingContainer;
