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
    const holdTime = 0.2;

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
                .catch((error) => console.warn('Failed to check redirect settings:', error));
        }
    };

    checkPageRedirects();

    const storeOriginalDisplay = (element) => {
        if (!originalDisplayValues.has(element)) {
            const wasVisible = element.classList.contains('unhook-reddit-visible');
            element.classList.add('unhook-reddit-visible');

            let originalDisplay = window.getComputedStyle(element).display;

            if (originalDisplay === 'none') {
                const tagName = element.tagName.toLowerCase();
                originalDisplay = (tagName === 'span') ? 'inline' : 'block';
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
        const shadowDOMElements = ['reddit-search-large', 'reddit-sidebar-nav', 'left-nav-top-section'];
        return shadowDOMElements.includes(tagName) || element.shadowRoot;
    };

    const showElementImmediate = (element) => {
        storeOriginalDisplay(element);

        const originalDisplay = originalDisplayValues.get(element);
        const displayValue = (originalDisplay && originalDisplay !== 'none') ? originalDisplay : 'block';

        element.classList.add('unhook-reddit-visible');
        element.setAttribute('data-display', displayValue);

        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');

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

    const findElements = (selectorString) => {
        const selectors = selectorString.split(', ').map(s => s.trim());

        const searchInRoot = (root, selector) => {
            try {
                return Array.from(root.querySelectorAll(selector));
            } catch (e) {
                return [];
            }
        };

        const searchWithShadowDOM = (selector) => {
            const shadowRootGetters = [
                () => getShadowRoot(SHADOW_DOM_SELECTORS.search),
                () => getShadowRoot(SHADOW_DOM_SELECTORS.sidebar),
                () => getShadowRoot(SHADOW_DOM_SELECTORS.leftTop)
            ];

            for (const getter of shadowRootGetters) {
                try {
                    const shadowRoot = getter();
                    if (shadowRoot) {
                        const found = Array.from(shadowRoot.querySelectorAll(selector));
                        if (found.length > 0) return found;
                    }
                } catch (e) { }
            }
            return [];
        };

        for (const selector of selectors) {
            const normalFound = searchInRoot(document, selector);
            if (normalFound.length > 0) return normalFound;

            const shadowFound = searchWithShadowDOM(selector);
            if (shadowFound.length > 0) return shadowFound;
        }

        return [];
    };

    const applyVisibilitySettings = () => {
        const isSubredditPage = window.location.pathname.startsWith('/r');
        const isUserPage = window.location.pathname.startsWith('/user');
        const isExplorePage = window.location.pathname.startsWith('/explore');

        if (!currentSettings || Object.keys(currentSettings).length === 0) {
            Object.values(SELECTORS).forEach(selectorString => {
                findElements(selectorString).forEach(element => showElement(element));
            });
            return;
        }

        const toggleElements = (selector, shouldHide) => {
            findElements(selector).forEach(element => {
                shouldHide ? hideElement(element) : showElement(element);
            });
        };

        if (!isSubredditPage) {
            toggleElements(SELECTORS.homeFeed, !isUserPage && !isExplorePage && currentSettings.hideHomeFeed);
        }

        if (isSubredditPage) {
            toggleElements(SELECTORS.subredditFeed, currentSettings.hideSubredditFeed);
        }

        toggleElements(SELECTORS.comments, currentSettings.hideComments);
        toggleElements(SELECTORS.leftSidebar, currentSettings.hideSideBar);
        toggleElements(SELECTORS.recentPosts, currentSettings.hideRecentPosts);
        toggleElements(SELECTORS.search, currentSettings.hideSearch);

        if (!currentSettings.hideSearch) {
            toggleElements(SELECTORS.trending, currentSettings.hideTrending);
            toggleElements(SELECTORS.trendingLabel, currentSettings.hideTrending);

            findElements(SELECTORS.trendingContainer).forEach(element => {
                if (currentSettings.hideTrending) {
                    element.classList.remove('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                } else {
                    element.classList.add('w-full', 'border-solid', 'border-b-sm', 'border-t-0', 'unhook-reddit-visible');
                }
            });
        }

        if (!currentSettings.hideSideBar) {
            toggleElements(SELECTORS.popular, currentSettings.hidePopular);
            toggleElements(SELECTORS.explore, currentSettings.hideExplore);
            toggleElements(SELECTORS.recentSubreddits, currentSettings.hideRecentSubreddits);
            toggleElements(SELECTORS.all, currentSettings.hideAll);

            findElements(SELECTORS.customFeeds).forEach(element => {
                const parent = element.parentElement.parentElement;
                currentSettings.hideCustomFeeds ? hideElement(parent) : showElement(parent);
            });

            findElements(SELECTORS.communities).forEach(element => {
                const parent = element.parentElement.parentElement;
                currentSettings.hideCommunities ? hideElement(parent) : showElement(parent);
            });
        }
    };

    const loadAndApplyImmediateSettings = () => {
        try {
            browser.storage.sync.get(STORAGE_KEYS).then((data) => {
                STORAGE_KEYS.forEach(key => {
                    currentSettings[key] = data[key] === true;
                });
                applyVisibilitySettings();
            });
        } catch (error) {
            STORAGE_KEYS.forEach(key => {
                currentSettings[key] = false;
            });
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
        if (isNavigating || !currentSettings || Object.keys(currentSettings).length === 0) return;

        isNavigating = true;
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

        const feedElements = findElements(SELECTORS.homeFeed);
        const shouldHide = (!isDestinationSubreddit && currentSettings.hideHomeFeed) ||
            (isDestinationSubreddit && currentSettings.hideSubredditFeed);

        feedElements.forEach(el => {
            if (shouldHide) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('opacity', '0', 'important');
            } else {
                el.style.removeProperty('display');
                el.style.removeProperty('visibility');
                el.style.removeProperty('opacity');
            }
        });
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
            handleNavigationStart(target.href);
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
                    Object.values(SELECTORS).forEach(selector => {
                        if ((node.matches && node.matches(selector)) ||
                            (node.querySelector && node.querySelector(selector))) {
                            shouldReapply = true;
                        }
                    });

                    if ((node.matches && (node.matches('#reddit-trending-searches-partial-container') ||
                        node.matches('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center'))) ||
                        (node.querySelector && (node.querySelector('#reddit-trending-searches-partial-container') ||
                            node.querySelector('div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center')))) {
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
        if (currentSettings.hideTrending && !currentSettings.hideSearch) {
            findElements(SELECTORS.trending).forEach(element => hideElement(element));
            findElements(SELECTORS.trendingLabel).forEach(element => hideElement(element));

            const trendingContainerSelectors = [
                "div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border",
                "div[class*='border-b-sm']",
                "div[class*='border-neutral-border']"
            ];

            for (const selector of trendingContainerSelectors) {
                const elements = findElements(selector);
                if (elements.length > 0) {
                    elements.forEach(element => {
                        element.classList.remove('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                        element.classList.add('unhook-reddit-visible');
                    });
                    break;
                }
            }
        }
    };

    const setupSearchShadowObserverForRoot = (shadowRoot) => {
        try {
            const searchObserver = new MutationObserver((mutations) => {
                let trendingReappeared = false;
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const trendingSelectors = [
                                '#reddit-trending-searches-partial-container',
                                'div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center',
                                'div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border'
                            ];
                            trendingReappeared = trendingSelectors.some(selector =>
                                node.id === selector.slice(1) ||
                                (node.matches && node.matches(selector)) ||
                                (node.querySelector && node.querySelector(selector))
                            );
                        }
                    });
                });

                if (trendingReappeared) {
                    setTimeout(() => aggressivelyHideTrending(), 50);
                }
            });

            searchObserver.observe(shadowRoot, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'hidden']
            });
            return searchObserver;
        } catch (error) { }
        return null;
    };

    const setupSearchShadowObserver = () => {
        try {
            const searchElement = document.querySelector('reddit-search-large');
            if (searchElement && searchElement.shadowRoot) {
                const searchObserver = new MutationObserver((mutations) => {
                    let trendingReappeared = false;
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const trendingSelectors = [
                                    '#reddit-trending-searches-partial-container',
                                    'div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center'
                                ];
                                trendingReappeared = trendingSelectors.some(selector =>
                                    node.id === selector.slice(1) ||
                                    (node.matches && node.matches(selector)) ||
                                    (node.querySelector && node.querySelector(selector))
                                );
                            }
                        });
                    });

                    if (trendingReappeared) {
                        aggressivelyHideTrending();
                    }
                });

                searchObserver.observe(searchElement.shadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class', 'hidden']
                });
                return searchObserver;
            }
        } catch (error) { }
        return null;
    };

    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (options) {
        const shadowRoot = originalAttachShadow.call(this, options);
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

} catch (error) {
    console.error('Content script error:', error);
}