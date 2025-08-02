try {

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
        "hideTrending",
        "hidePopular",
        "hideExplore",
        "hideCustomFeeds",
        "hideRecentSubreddits",
        "hideCommunities",
        "darkMode"
    ];

    const SELECTORS = {
        homeFeed: "shreddit-feed", // [data-testid='feed'], [data-testid='home-feed'], .feed, .home-feed, [data-testid='post-container'], [data-testid='post']",
        subredditFeed: "shreddit-feed", // [data-testid='feed'], [data-testid='subreddit-feed'], .feed, .subreddit-feed, [data-testid='post-container'], [data-testid='post']",
        comments: "shreddit-comment", // [data-testid='comment'], [data-testid='comment-tree'], .comment, .comment-tree, [data-testid='comment-container'], [data-testid='comment-tree']",
        recentPosts: "recent-posts", // [data-testid='recent-posts'], [data-testid='trending-posts'], .recent-posts, .trending-posts, [data-testid='trending'], [data-testid='popular-posts']",
        trending: "#reddit-trending-searches-partial-container", //, faceplate-tracker[data-testid='reddit-trending-result']",
        trendingLabel: "div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center", // Trending searches label
        leftSidebar: "#left-sidebar", //, [data-testid='left-sidebar'], [data-testid='sidebar'], .left-sidebar, .sidebar, [data-testid='navigation'], [data-testid='community-list']",
        popular: "#popular-posts", //, [id='popular-posts'], li[id='popular-posts'], [class*='popular'], [data-testid*='popular'], a[href*='/r/popular'], [href*='/r/popular']",
        explore: "#explore-communities", //, [id='explore'], li[id='explore'], [class*='explore'], [data-testid*='explore'], a[href*='/explore'], [href*='/explore']",
        customFeeds: "#multireddits_section", //, [data-testid='custom-feeds'], [id*='custom'], [id*='feeds'], [class*='custom-feed'], [class*='multireddit']",
        recentSubreddits: "reddit-recent-pages", //, [data-testid='recent-subreddits'], [id*='recent'], [class*='recent-subreddit'], [class*='recent']",
        communities: "#communities_section" //, [id*='communities'], [id*='community'], [class*='communities'], [class*='community']"
    };

    // Store current settings globally
    let currentSettings = {};

    // Store original display values to restore them properly
    let originalDisplayValues = new Map();

    // Define redirect mappings for better maintainability
    const REDIRECT_MAPPINGS = [
        {
            check: (path) => path.startsWith('/r/popular'),
            setting: 'hidePopular',
            message: 'Popular page detected, redirecting to home...'
        },
        {
            check: (path) => path === '/explore' || path.startsWith('/explore/'),
            setting: 'hideExplore',
            message: 'Explore page detected, redirecting to home...'
        },
        {
            check: (path) => path.startsWith('/r/popular'),
            setting: 'hideSideBar',
            message: 'Popular page detected (sidebar hidden), redirecting to home...'
        },
        {
            check: (path) => path === '/explore' || path.startsWith('/explore/'),
            setting: 'hideSideBar',
            message: 'Explore page detected (sidebar hidden), redirecting to home...'
        }
    ];

    // Check for page redirects early (before page fully loads)
    const checkPageRedirects = () => {
        const currentPath = window.location.pathname;
        const activeRedirects = REDIRECT_MAPPINGS.filter(redirect => redirect.check(currentPath));

        if (activeRedirects.length > 0) {
            const settingsToCheck = activeRedirects.map(r => r.setting);

            // Use Promise-based approach for better error handling
            browser.storage.sync.get(settingsToCheck)
                .then((data) => {
                    for (const redirect of activeRedirects) {
                        if (data[redirect.setting] === true) {
                            window.location.replace('https://www.reddit.com/');
                            // }, 1);
                            return; // Stop after first redirect
                        }
                    }
                })
                .catch((error) => {
                    console.warn('Failed to check redirect settings:', error);
                });
        }
    };

    // Run redirect check immediately (before DOM is ready)
    checkPageRedirects();

    // Helper function to store original display value
    const storeOriginalDisplay = (element) => {
        if (!originalDisplayValues.has(element)) {
            // Temporarily remove CSS hiding to get the true original display
            const wasVisible = element.classList.contains('unhook-reddit-visible');
            element.classList.add('unhook-reddit-visible');

            const computedStyle = window.getComputedStyle(element);
            let originalDisplay = computedStyle.display;

            // If it's still 'none', try some common defaults
            if (originalDisplay === 'none') {
                const tagName = element.tagName.toLowerCase();
                if (['div', 'section', 'article', 'aside', 'nav'].includes(tagName)) {
                    originalDisplay = 'block';
                } else if (tagName === 'span') {
                    originalDisplay = 'inline';
                } else {
                    originalDisplay = 'block'; // fallback
                }
            }

            // Restore the visibility state
            if (!wasVisible) {
                element.classList.remove('unhook-reddit-visible');
            }

            originalDisplayValues.set(element, originalDisplay);

        }
    };

    // Helper function to hide element (works with CSS !important)
    const hideElement = (element) => {
        storeOriginalDisplay(element);

        // Remove the visible class
        element.classList.remove('unhook-reddit-visible');

        // Remove the data attribute
        element.removeAttribute('data-display');

        // Override any inline styles that might be showing the element
        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');

        // Force hide with !important
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('opacity', '0', 'important');
    };

    // Helper function to show element (works with CSS !important)
    const showElement = (element) => {
        // First, store the original display if we haven't already
        storeOriginalDisplay(element);

        const originalDisplay = originalDisplayValues.get(element);

        // Add the visible class to override CSS hiding
        element.classList.add('unhook-reddit-visible');

        // Remove any hiding properties first
        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');

        // Set data attribute for CSS targeting
        if (originalDisplay && originalDisplay !== 'none') {
            element.setAttribute('data-display', originalDisplay);
        } else {
            element.setAttribute('data-display', 'block');
        }

        // Force show with !important - this must override the CSS :not() rules
        const displayValue = originalDisplay && originalDisplay !== 'none' ? originalDisplay : 'block';
        element.style.setProperty('display', displayValue, 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');

        // Add a small delay to check if it worked
        // setTimeout(() => {
        //     const computedDisplay = window.getComputedStyle(element).display;
        //     // If it's still hidden, try even more aggressive approach
        //     if (computedDisplay === 'none') {
        //         element.style.cssText += `display: ${displayValue} !important; visibility: visible !important; opacity: 1 !important;`;
        //     }
        // }, 10);
    };


    const getSearchShadowRoot = () => {
        const search = document.querySelector('reddit-search-large');
        return search.shadowRoot;
    };

    const getSidebarShadowRoot = () => {
        const sidebar = document.querySelector('reddit-sidebar-nav');
        return sidebar.shadowRoot;
    };

    const getLeftTopShadowRoot = () => {
        const leftTop = document.querySelector('left-nav-top-section');
        return leftTop.shadowRoot;
    };


    // Helper function to find elements using multiple selectors, including Shadow DOM
    const findElements = (selectorString) => {
        const selectors = selectorString.split(', ').map(s => s.trim());
        let elements = [];

        const searchInRoot = (root, selector) => {
            try {
                return Array.from(root.querySelectorAll(selector));
            } catch (e) {
                return [];
            }
        };

        const searchWithShadowDOM = (root, selector) => {
            let found = [];

            const shadowRootGetters = [
                () => getSearchShadowRoot(),
                () => getSidebarShadowRoot(),
                () => getLeftTopShadowRoot()
            ];

            for (const getter of shadowRootGetters) {
                try {
                    const shadowRoot = getter();
                    if (shadowRoot) {
                        found = Array.from(shadowRoot.querySelectorAll(selector));
                        if (found.length > 0) {
                            return found;
                        }
                    }
                } catch (e) {
                    console.log(`Shadow root access failed for selector "${selector}":`, e.message);
                }
            }

            return found;
        };

        // Try each selector
        for (const selector of selectors) {
            const normalFound = searchInRoot(document, selector);
            if (normalFound.length > 0) {
                elements = normalFound;
                break;
            }

            const shadowFound = searchWithShadowDOM(document, selector);
            if (shadowFound.length > 0) {
                elements = shadowFound;
                break;
            }
        }

        return elements;
    };

    // Function to apply visibility settings
    const applyVisibilitySettings = () => {
        const isSubredditPage = window.location.pathname.startsWith('/r');
        const isUserPage = window.location.pathname.startsWith('/user');
        const isExplorePage = window.location.pathname.startsWith('/explore');

        // Safety check - if currentSettings is empty or undefined, show all elements
        if (!currentSettings || Object.keys(currentSettings).length === 0) {

            // Show all elements when no settings are loaded
            Object.values(SELECTORS).forEach(selectorString => {
                const elements = findElements(selectorString);
                elements.forEach(element => showElement(element));
            });
            return;
        }

        const homeFeedElements = findElements(SELECTORS.homeFeed);
        if (!isSubredditPage) {
            homeFeedElements.forEach(element => {
                if (!isUserPage && !isExplorePage && currentSettings.hideHomeFeed === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });
        }

        const subredditFeedElements = findElements(SELECTORS.subredditFeed);
        if (isSubredditPage) {
            subredditFeedElements.forEach(element => {
                if (currentSettings.hideSubredditFeed === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });
        }

        const commentElements = findElements(SELECTORS.comments);
        commentElements.forEach(element => {
            if (currentSettings.hideComments === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });

        const leftSidebarElements = findElements(SELECTORS.leftSidebar);
        leftSidebarElements.forEach((element, index) => {

            if (currentSettings.hideSideBar === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });

        const recentPostElements = findElements(SELECTORS.recentPosts);
        recentPostElements.forEach(element => {
            if (currentSettings.hideRecentPosts === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });

        const trendingElements = findElements(SELECTORS.trending);
        trendingElements.forEach(element => {
            if (currentSettings.hideTrending === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });

        const trendingLabelElements = findElements(SELECTORS.trendingLabel);
        trendingLabelElements.forEach(element => {
            if (currentSettings.hideTrending === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });

        if (!currentSettings.hideSideBar) {
            const popularElements = findElements(SELECTORS.popular);
            popularElements.forEach(element => {
                if (currentSettings.hidePopular === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });

            const exploreElements = findElements(SELECTORS.explore);
            exploreElements.forEach(element => {
                if (currentSettings.hideExplore === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });

            const customFeedsElements = findElements(SELECTORS.customFeeds);
            customFeedsElements.forEach(element => {
                if (currentSettings.hideCustomFeeds === true) {
                    hideElement(element.parentElement.parentElement);
                } else {
                    showElement(element);
                    showElement(element.parentElement.parentElement);
                }
            });

            const recentSubredditsElements = findElements(SELECTORS.recentSubreddits);
            recentSubredditsElements.forEach(element => {
                if (currentSettings.hideRecentSubreddits === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });

            const communitiesElements = findElements(SELECTORS.communities);
            communitiesElements.forEach(element => {
                if (currentSettings.hideCommunities === true) {
                    hideElement(element.parentElement.parentElement);
                } else {
                    showElement(element);
                    showElement(element.parentElement.parentElement);
                }
            });
        }

    };

    // Function to load settings synchronously and apply immediately
    const loadAndApplyImmediateSettings = () => {

        // Try to get settings synchronously if possible
        try {
            browser.storage.sync.get(STORAGE_KEYS).then((data) => {
                // Initialize settings properly - ensure they're boolean values
                currentSettings = {
                    hideHomeFeed: data.hideHomeFeed === true,
                    hideSubredditFeed: data.hideSubredditFeed === true,
                    hideSideBar: data.hideSideBar === true,
                    hideComments: data.hideComments === true,
                    hideRecentPosts: data.hideRecentPosts === true,
                    hideTrending: data.hideTrending === true,
                    hidePopular: data.hidePopular === true,
                    hideExplore: data.hideExplore === true,
                    hideCustomFeeds: data.hideCustomFeeds === true,
                    hideRecentSubreddits: data.hideRecentSubreddits === true,
                    hideCommunities: data.hideCommunities === true,
                    darkMode: data.darkMode === true
                };

                // Apply settings immediately after loading
                applyVisibilitySettings();
            }).catch((error) => {
                // Fall back to default settings
                currentSettings = {
                    hideHomeFeed: false,
                    hideSubredditFeed: false,
                    hideSideBar: false,
                    hideComments: false,
                    hideRecentPosts: false,
                    hideTrending: false,
                    hidePopular: false,
                    hideExplore: false,
                    hideCustomFeeds: false,
                    hideRecentSubreddits: false,
                    hideCommunities: false,
                    darkMode: false
                };
                applyVisibilitySettings();
            });
        } catch (error) {
            currentSettings = {
                hideHomeFeed: false,
                hideSubredditFeed: false,
                hideSideBar: false,
                hideComments: false,
                hideRecentPosts: false,
                hideTrending: false,
                hidePopular: false,
                hideExplore: false,
                hideCustomFeeds: false,
                hideRecentSubreddits: false,
                hideCommunities: false,
                darkMode: false
            };
            applyVisibilitySettings();
        }
    };

    // Listen for storage changes to update settings dynamically
    browser.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            // Update current settings with normalized boolean values
            Object.keys(changes).forEach(key => {
                currentSettings[key] = changes[key].newValue === true;
            });

            applyVisibilitySettings();
        }
    });

    // Load and apply settings immediately on script load
    loadAndApplyImmediateSettings();

    // Also apply settings very early if document is still loading
    if (document.readyState === 'loading') {
        // Apply settings again when DOM content is loaded
        document.addEventListener('DOMContentLoaded', () => {
            applyVisibilitySettings();
        });
    }

    // Handle navigation changes to prevent flash
    let currentUrl = window.location.href;
    let isNavigating = false;

    const handleNavigationStart = (destinationUrl = null) => {
        if (!isNavigating) {
            isNavigating = true;

            // Immediately apply settings based on DESTINATION page to prevent flash
            if (currentSettings && Object.keys(currentSettings).length > 0) {
                let isDestinationSubreddit;

                if (destinationUrl) {
                    // Use destination URL to determine page type
                    try {
                        const url = new URL(destinationUrl, window.location.origin);
                        isDestinationSubreddit = url.pathname.startsWith('/r/');
                        const isDestinationUserPage = url.pathname.startsWith('/user');
                        const isDestinationExplorePage = url.pathname.startsWith('/explore');
                    } catch (e) {
                        // If URL parsing fails, fall back to current URL
                        isDestinationSubreddit = window.location.pathname.startsWith('/r');
                    }
                } else {
                    // Fallback to current URL (for back/forward navigation)
                    isDestinationSubreddit = window.location.pathname.startsWith('/r');
                }
                // Apply settings based on DESTINATION page context
                const feedElements = findElements(SELECTORS.homeFeed); // They use same selector

                if (!isDestinationSubreddit && currentSettings.hideHomeFeed) {
                    // Going to home page (including /user pages) and home feed should be hidden
                    feedElements.forEach(el => {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.style.setProperty('opacity', '0', 'important');
                    });
                } else if (isDestinationSubreddit && currentSettings.hideSubredditFeed) {
                    // Going to subreddit page and subreddit feed should be hidden
                    feedElements.forEach(el => {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.style.setProperty('opacity', '0', 'important');
                    });
                } else {
                    // Feed should be visible on destination page - ensure it's not hidden
                    feedElements.forEach(el => {
                        el.style.removeProperty('display');
                        el.style.removeProperty('visibility');
                        el.style.removeProperty('opacity');
                    });
                }
            }
        }
    };

    const handleNavigation = () => {
        const newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            currentUrl = newUrl;
            isNavigating = false;

            // Check for page redirects after navigation
            checkPageRedirects();

            // Immediately apply settings for the new page context
            setTimeout(() => {
                applyVisibilitySettings();
            }, 50); // Small delay to let page elements load
        }
    };

    // Listen for clicks on links to catch navigation before it starts
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href]');
        if (target && target.href && target.href.includes('reddit.com')) {
            handleNavigationStart(target.href); // Pass destination URL
        }
    }, true); // Use capture phase to catch early

    // Listen for navigation changes
    const navigationObserver = new MutationObserver(handleNavigation);
    navigationObserver.observe(document, { childList: true, subtree: true });

    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', (event) => {
        handleNavigationStart(); // No destination URL available for back/forward
        // setTimeout(handleNavigation, 10);
    });

    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (state, title, url) {
        handleNavigationStart(url); // Pass destination URL
        originalPushState.apply(history, arguments);
        setTimeout(handleNavigation, 10);
    };

    history.replaceState = function (state, title, url) {
        handleNavigationStart(url); // Pass destination URL
        originalReplaceState.apply(history, arguments);
        setTimeout(handleNavigation, 10);
    };

    // Also listen for beforeunload to catch navigation attempts
    window.addEventListener('beforeunload', handleNavigationStart);

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
                        aggressivelyHideTrending();
                    }

                    // Also check for trending label specifically
                    if (node.matches && (node.matches('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center') ||
                        node.querySelector && node.querySelector('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center'))) {
                        aggressivelyHideTrending();
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

    // Function to aggressively hide trending searches
    const aggressivelyHideTrending = () => {
        if (currentSettings.hideTrending === true) {
            // Hide trending container
            const trendingElements = findElements(SELECTORS.trending);
            trendingElements.forEach(element => {
                hideElement(element);
            });

            // Hide trending label
            const trendingLabelElements = findElements(SELECTORS.trendingLabel);
            trendingLabelElements.forEach(element => {
                hideElement(element);
            });
        }
    };

    // Function to set up search shadow root observer
    const setupSearchShadowObserver = () => {
        try {
            const searchElement = document.querySelector('reddit-search-large');
            if (searchElement && searchElement.shadowRoot) {
                const searchShadowRoot = searchElement.shadowRoot;

                // Create observer for the search shadow root
                const searchObserver = new MutationObserver((mutations) => {
                    let trendingReappeared = false;

                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if the trending container was added
                                if (node.id === 'reddit-trending-searches-partial-container' ||
                                    node.querySelector?.('#reddit-trending-searches-partial-container')) {
                                    console.log('Trending container detected in search shadow root');
                                    trendingReappeared = true;
                                }

                                // Check if the trending label was added
                                if (node.matches && node.matches('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center') ||
                                    node.querySelector && node.querySelector('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center')) {
                                    console.log('Trending label detected in search shadow root');
                                    trendingReappeared = true;
                                }
                            }
                        });
                    });

                    if (trendingReappeared) {
                        aggressivelyHideTrending();
                    }
                });

                // Start observing the search shadow root
                searchObserver.observe(searchShadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'hidden']
                });

                console.log('Search shadow root observer set up');
                return searchObserver;
            }
        } catch (error) {
            console.log('Failed to set up search shadow root observer:', error.message);
        }
        return null;
    };

    // Function to periodically check for search shadow root and set up observer
    const setupSearchObserver = () => {
        // Try to set up observer immediately
        let searchObserver = setupSearchShadowObserver();

        // If not found immediately, try periodically
        if (!searchObserver) {
            const checkInterval = setInterval(() => {
                searchObserver = setupSearchShadowObserver();
                if (searchObserver) {
                    clearInterval(checkInterval);
                    console.log('Search shadow root observer set up after retry');
                }
            }, 1000);

            // Stop trying after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);
        }
    };

    // // Set up search observer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSearchObserver);
    } else {
        setupSearchObserver();
    }

} catch (error) {
    console.error('Content script error:', error);
    console.error('Stack trace:', error.stack);
}
