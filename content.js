try {
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

    let currentSettings = {};

    let originalDisplayValues = new Map();

    // Hold time for elements containing shadow DOMs to prevent flash
    const holdTime = 0.2; // seconds

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
            check: (path) => path.startsWith('/r/all'),
            setting: 'hideAll',
            message: 'All page detected, redirecting to home...'
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
        },
        {
            check: (path) => path.startsWith('/r/all'),
            setting: 'hideSideBar',
            message: 'All page detected (sidebar hidden), redirecting to home...'
        },
    ];

    const checkPageRedirects = () => {
        const currentPath = window.location.pathname;
        const activeRedirects = REDIRECT_MAPPINGS.filter(redirect => redirect.check(currentPath));

        if (activeRedirects.length > 0) {
            const settingsToCheck = activeRedirects.map(r => r.setting);

            browser.storage.sync.get(settingsToCheck)
                .then((data) => {
                    for (const redirect of activeRedirects) {
                        if (data[redirect.setting] === true) {
                            window.location.replace('https://www.reddit.com/');
                            return;
                        }
                    }
                })
                .catch((error) => {
                    console.warn('Failed to check redirect settings:', error);
                });
        }
    };

    checkPageRedirects();

    const storeOriginalDisplay = (element) => {
        if (!originalDisplayValues.has(element)) {
            const wasVisible = element.classList.contains('unhook-reddit-visible');
            element.classList.add('unhook-reddit-visible');

            const computedStyle = window.getComputedStyle(element);
            let originalDisplay = computedStyle.display;

            if (originalDisplay === 'none') {
                const tagName = element.tagName.toLowerCase();
                if (['div', 'section', 'article', 'aside', 'nav'].includes(tagName)) {
                    originalDisplay = 'block';
                } else if (tagName === 'span') {
                    originalDisplay = 'inline';
                } else {
                    originalDisplay = 'block';
                }
            }

            if (!wasVisible) {
                element.classList.remove('unhook-reddit-visible');
            }

            originalDisplayValues.set(element, originalDisplay);
        }
    };

    const hideElement = (element) => {
        storeOriginalDisplay(element);

        element.classList.remove('unhook-reddit-visible');
        element.removeAttribute('data-display');

        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');

        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('visibility', 'hidden', 'important');
        element.style.setProperty('opacity', '0', 'important');
    };

    const containsShadowDOM = (element) => {
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const shadowDOMElements = [
            'reddit-search-large',
            'reddit-sidebar-nav',
            'left-nav-top-section'
        ];
        return shadowDOMElements.includes(tagName) ||
            (element.id && shadowDOMElements.some(tag => element.id.includes(tag.replace('-', '')))) ||
            element.shadowRoot;
    };

    const showElementImmediate = (element) => {
        storeOriginalDisplay(element);

        const originalDisplay = originalDisplayValues.get(element);
        element.classList.add('unhook-reddit-visible');

        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');

        if (originalDisplay && originalDisplay !== 'none') {
            element.setAttribute('data-display', originalDisplay);
        } else {
            element.setAttribute('data-display', 'block');
        }

        const displayValue = originalDisplay && originalDisplay !== 'none' ? originalDisplay : 'block';
        element.style.setProperty('display', displayValue, 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
    };

    const showElement = (element) => {
        if (containsShadowDOM(element)) {
            setTimeout(() => {
                showElementImmediate(element);
            }, holdTime * 1000);
        } else {
            showElementImmediate(element);
        }
    };

    const getShadowRoot = (shadowDOMSelector) => {
        const shadowRoot = document.querySelector(shadowDOMSelector);
        if (!shadowRoot || !shadowRoot.shadowRoot) {
            return null;
        }
        return shadowRoot.shadowRoot;
    };

    const shadowDOMReadyLoading = () => {
        return getSearchShadowRoot() && getSidebarShadowRoot() && getLeftTopShadowRoot();
    };

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
                () => getShadowRoot(SHADOW_DOM_SELECTORS.search),
                () => getShadowRoot(SHADOW_DOM_SELECTORS.sidebar),
                () => getShadowRoot(SHADOW_DOM_SELECTORS.leftTop),
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
                    // console.log(`Shadow root access failed for selector "${selector}":`, e.message);
                }
            }

            return found;
        };

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

    const applyVisibilitySettings = () => {
        const isSubredditPage = window.location.pathname.startsWith('/r');
        const isUserPage = window.location.pathname.startsWith('/user');
        const isExplorePage = window.location.pathname.startsWith('/explore');

        if (!currentSettings || Object.keys(currentSettings).length === 0) {
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

        const searchElements = findElements(SELECTORS.search);
        searchElements.forEach(element => {
            if (currentSettings.hideSearch === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });

        if (!currentSettings.hideSearch) {
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

            const trendingContainerElements = findElements(SELECTORS.trendingContainer);
            trendingContainerElements.forEach(element => {
                if (currentSettings.hideTrending === true) {
                    element.classList.remove('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                } else {
                    element.classList.add('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                    element.classList.add('unhook-reddit-visible');
                }
            });
        }

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

            const allElements = findElements(SELECTORS.all);
            allElements.forEach(element => {
                if (currentSettings.hideAll === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });
        }

    };

    const loadAndApplyImmediateSettings = () => {
        try {
            browser.storage.sync.get(STORAGE_KEYS).then((data) => {
                currentSettings = {
                    hideHomeFeed: data.hideHomeFeed === true,
                    hideSubredditFeed: data.hideSubredditFeed === true,
                    hideSideBar: data.hideSideBar === true,
                    hideComments: data.hideComments === true,
                    hideRecentPosts: data.hideRecentPosts === true,
                    hideSearch: data.hideSearch === true,
                    hideTrending: data.hideTrending === true,
                    hidePopular: data.hidePopular === true,
                    hideExplore: data.hideExplore === true,
                    hideCustomFeeds: data.hideCustomFeeds === true,
                    hideRecentSubreddits: data.hideRecentSubreddits === true,
                    hideCommunities: data.hideCommunities === true,
                    hideAll: data.hideAll === true,
                    darkMode: data.darkMode === true
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
                hideSearch: false,
                hideTrending: false,
                hidePopular: false,
                hideExplore: false,
                hideCustomFeeds: false,
                hideRecentSubreddits: false,
                hideCommunities: false,
                hideAll: false,
                darkMode: false
            };
            applyVisibilitySettings();
        }
    };

    browser.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            Object.keys(changes).forEach(key => {
                currentSettings[key] = changes[key].newValue === true;
            });
            applyVisibilitySettings();
        }
    });

    loadAndApplyImmediateSettings();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyVisibilitySettings();
        });
    }

    let currentUrl = window.location.href;
    let isNavigating = false;

    const handleNavigationStart = (destinationUrl = null) => {
        if (!isNavigating) {
            isNavigating = true;

            if (currentSettings && Object.keys(currentSettings).length > 0) {
                let isDestinationSubreddit;

                if (destinationUrl) {
                    try {
                        const url = new URL(destinationUrl, window.location.origin);
                        isDestinationSubreddit = url.pathname.startsWith('/r/');
                    } catch (e) {
                        isDestinationSubreddit = window.location.pathname.startsWith('/r');
                    }
                } else {
                    isDestinationSubreddit = window.location.pathname.startsWith('/r');
                }
                const feedElements = findElements(SELECTORS.homeFeed); // They use same selector

                if (!isDestinationSubreddit && currentSettings.hideHomeFeed) {
                    feedElements.forEach(el => {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.style.setProperty('opacity', '0', 'important');
                    });
                } else if (isDestinationSubreddit && currentSettings.hideSubredditFeed) {
                    feedElements.forEach(el => {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.style.setProperty('opacity', '0', 'important');
                    });
                } else {
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

            checkPageRedirects();

            setTimeout(() => {
                applyVisibilitySettings();
            }, 50);
        }
    };

    document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href]');
        if (target && target.href && target.href.includes('reddit.com')) {
            handleNavigationStart(target.href); // Pass destination URL
        }
    }, true);

    const navigationObserver = new MutationObserver(handleNavigation);
    navigationObserver.observe(document, { childList: true, subtree: true });

    window.addEventListener('popstate', (event) => {
        handleNavigationStart();
    });

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (state, title, url) {
        handleNavigationStart(url);
        originalPushState.apply(history, arguments);
        setTimeout(handleNavigation, 10);
    };

    history.replaceState = function (state, title, url) {
        handleNavigationStart(url);
        originalReplaceState.apply(history, arguments);
        setTimeout(handleNavigation, 10);
    };

    window.addEventListener('beforeunload', handleNavigationStart);

    const observer = new MutationObserver((mutations) => {
        let shouldReapply = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const selectors = Object.values(SELECTORS);
                    selectors.forEach(selector => {
                        if (node.matches && node.matches(selector) ||
                            node.querySelector && node.querySelector(selector)) {
                            shouldReapply = true;
                        }
                    });

                    if (node.matches && (node.matches('#reddit-trending-searches-partial-container') ||
                        node.querySelector && node.querySelector('#reddit-trending-searches-partial-container'))) {
                        aggressivelyHideTrending();
                    }

                    if (node.matches && (node.matches('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center') ||
                        node.querySelector && node.querySelector('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center'))) {
                        aggressivelyHideTrending();
                    }
                }
            });
        });

        if (shouldReapply) {
            applyVisibilitySettings();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const aggressivelyHideTrending = () => {
        if (currentSettings.hideTrending === true && !currentSettings.hideSearch) {
            const trendingElements = findElements(SELECTORS.trending);
            trendingElements.forEach(element => {
                hideElement(element);
            });

            const trendingLabelElements = findElements(SELECTORS.trendingLabel);
            trendingLabelElements.forEach(element => {
                hideElement(element);
            });

            const trendingContainerSelectors = [
                "div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border",
                "div[class*='border-b-sm']",
                "div[class*='border-neutral-border']"
            ];

            let trendingContainerElements = [];
            for (const selector of trendingContainerSelectors) {
                trendingContainerElements = findElements(selector);
                if (trendingContainerElements.length > 0) break;
            }

            trendingContainerElements.forEach(element => {
                element.classList.remove('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                element.classList.add('unhook-reddit-visible');
            });
        }
    };

    const setupSearchShadowObserverForRoot = (shadowRoot) => {
        try {
            const searchObserver = new MutationObserver((mutations) => {
                let trendingReappeared = false;

                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.id === 'reddit-trending-searches-partial-container' ||
                                node.querySelector?.('#reddit-trending-searches-partial-container')) {
                                trendingReappeared = true;
                            }

                            if (node.matches && node.matches('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center') ||
                                node.querySelector && node.querySelector('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center')) {
                                trendingReappeared = true;
                            }

                            if (node.matches && node.matches('div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border') ||
                                node.querySelector && node.querySelector('div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border')) {
                                trendingReappeared = true;
                            }
                        }
                    });
                });

                if (trendingReappeared) {
                    setTimeout(() => {
                        aggressivelyHideTrending();
                    }, 50);
                }
            });

            searchObserver.observe(shadowRoot, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'hidden']
            });

            return searchObserver;
        } catch (error) {
            // console.log('Failed to set up search shadow root observer for specific root:', error.message);
        }
        return null;
    };

    const setupSearchShadowObserver = () => {
        try {
            const searchElement = document.querySelector('reddit-search-large');
            if (searchElement && searchElement.shadowRoot) {
                const searchShadowRoot = searchElement.shadowRoot;

                const searchObserver = new MutationObserver((mutations) => {
                    let trendingReappeared = false;
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.id === 'reddit-trending-searches-partial-container' ||
                                    node.querySelector?.('#reddit-trending-searches-partial-container')) {
                                    trendingReappeared = true;
                                }

                                if (node.matches && node.matches('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center') ||
                                    node.querySelector && node.querySelector('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center')) {
                                    trendingReappeared = true;
                                }
                            }
                        });
                    });

                    if (trendingReappeared) {
                        aggressivelyHideTrending();
                    }
                });

                searchObserver.observe(searchShadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'hidden']
                });

                return searchObserver;
            }
        } catch (error) {
            // console.log('Failed to set up search shadow root observer:', error.message);
        }
        return null;
    };

    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (options) {
        const shadowRoot = originalAttachShadow.call(this, options);
        console.log('ATTACHED SHADOW ROOT:', shadowRoot);
        if (this.tagName === 'REDDIT-SEARCH-LARGE' ||
            this.tagName === 'REDDIT-SEARCH' ||
            this.classList.contains('search') ||
            this.getAttribute('data-testid')?.includes('search')) {

            setTimeout(() => {
                setupSearchShadowObserverForRoot(shadowRoot);
            }, 100);
        }

        return shadowRoot;
    };

    const setupSearchObserver = () => {
        let searchObserver = setupSearchShadowObserver();

        if (!searchObserver) {
            const checkInterval = setInterval(() => {
                searchObserver = setupSearchShadowObserver();
                if (searchObserver) {
                    clearInterval(checkInterval);
                }
            }, 1000);

            setTimeout(() => {
                clearInterval(checkInterval);
            }, 10000);
        }
    };

    const checkExistingSearchShadowRoots = () => {
        const searchElements = document.querySelectorAll('reddit-search-large, reddit-search, [data-testid*="search"]');
        searchElements.forEach(element => {
            if (element.shadowRoot) {
                setupSearchShadowObserverForRoot(element.shadowRoot);
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupSearchObserver();
            checkExistingSearchShadowRoots();
        });
    } else {
        setupSearchObserver();
        checkExistingSearchShadowRoots();
    }

    const isPageLoading = () => {
        return document.readyState === 'loading' ||
            document.readyState === 'interactive';
    };

    const isPageFullyLoaded = () => {
        return document.readyState === 'complete';
    };

    const areElementsStillLoading = () => {
        // Check for loading indicators
        const loadingIndicators = document.querySelectorAll(
            '[data-loading="true"]',
            '.loading',
            '.spinner',
            '[aria-busy="true"]',
            'shreddit-async-loader'
        );

        const expectedElements = Object.values(SELECTORS);
        const missingElements = expectedElements.some(selector => {
            const elements = findElements(selector);
            return elements.length === 0;
        });

        return loadingIndicators.length > 0 || missingElements;
    };

    const isNetworkActive = () => {
        return performance.getEntriesByType('navigation')[0]?.loadEventEnd === 0;
    };

    const isRedditLoading = () => {
        const redditLoaders = document.querySelectorAll(
            'shreddit-async-loader',
            '[data-testid="loading"]',
            '.loading-page',
            'reddit-header-loading'
        );
        const appContainer = document.querySelector('shreddit-app, reddit-header-large');
        return redditLoaders.length > 0 || !appContainer;
    };

} catch (error) {
    console.error('Content script error:', error);
    console.error('Stack trace:', error.stack);
}