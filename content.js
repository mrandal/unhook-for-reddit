try {
    if (typeof browser === "undefined") {
        var browser = chrome;
    }

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

    const SELECTORS = {
        homeFeed: "shreddit-feed",
        gallery: "shreddit-gallery-carousel",
        subredditFeed: "shreddit-feed",
        communityHighlights: "community-highlight-carousel",
        comments: "shreddit-comment",
        commentActionRow: "shreddit-comment-action-row",
        upvotes: '[slot="vote-button"]',
        upvoteCount: 'faceplate-number',
        rightSidebar: "#right-sidebar-contents",
        recentPosts: "recent-posts",
        subredditInfo: '#subreddit-right-rail__partial',
        popularCommunities: '[aria-label="Popular Communities"]',
        search: "reddit-search-large",
        trending: "#reddit-trending-searches-partial-container",
        trendingLabel: "div.ml-md.mt-sm.mb-2xs.text-neutral-content-weak.flex.items-center",
        trendingContainer: "div.w-full.border-solid.border-b-sm.border-t-0.border-r-0.border-l-0.border-neutral-border",
        leftSidebar: "#left-sidebar",
        games: "games-section-badge-controller",
        popular: "#popular-posts",
        explore: "#explore-communities",
        customFeeds: "#multireddits_section",
        recentSubreddits: "reddit-recent-pages",
        communities: "#communities_section",
        all: "#all-posts",
        notifications: "#notifications-inbox-button"
    };

    const SHADOW_DOM_SELECTORS = {
        search: "reddit-search-large",
        sidebar: "reddit-sidebar-nav",
        leftTop: "left-nav-top-section"
    };

    const ELEMENT_CONFIGS = [
        {
            key: 'homeFeed',
            setting: 'hideHomeFeed',
            condition: (pageContext) => !pageContext.isSubredditPage,
            shouldHide: (settings, pageContext) =>
                !pageContext.isUserPage && !pageContext.isExplorePage && settings.hideHomeFeed === true
        },
        {
            key: 'subredditFeed',
            setting: 'hideSubredditFeed',
            condition: (pageContext) => pageContext.isSubredditPage,
            shouldHide: (settings) => settings.hideSubredditFeed === true
        },
        {
            key: 'comments',
            setting: 'hideComments',
            shouldHide: (settings) => settings.hideComments === true
        },
        {
            key: 'leftSidebar',
            setting: 'hideSideBar',
            shouldHide: (settings) => settings.hideSideBar === true
        },
        {
            key: 'recentPosts',
            setting: 'hideRecentPosts',
            shouldHide: (settings) => settings.hideRecentPosts === true
        },
        {
            key: 'search',
            setting: 'hideSearch',
            shouldHide: (settings) => settings.hideSearch === true
        },
        {
            key: 'trending',
            setting: 'hideTrending',
            condition: (pageContext, settings) => !settings.hideSearch,
            shouldHide: (settings) => settings.hideTrending === true
        },
        {
            key: 'trendingLabel',
            setting: 'hideTrending',
            condition: (pageContext, settings) => !settings.hideSearch,
            shouldHide: (settings) => settings.hideTrending === true
        },
        {
            key: 'trendingContainer',
            setting: 'hideTrending',
            condition: (pageContext, settings) => !settings.hideSearch,
            customHandler: (element, shouldHide) => {
                if (shouldHide) {
                    element.classList.remove('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                } else {
                    element.classList.add('w-full', 'border-solid', 'border-b-sm', 'border-t-0');
                    element.classList.add('unhook-reddit-visible');
                }
            }
        },
        {
            key: 'popular',
            setting: 'hidePopular',
            condition: (pageContext, settings) => !settings.hideSideBar,
            shouldHide: (settings) => settings.hidePopular === true
        },
        {
            key: 'explore',
            setting: 'hideExplore',
            condition: (pageContext, settings) => !settings.hideSideBar,
            shouldHide: (settings) => settings.hideExplore === true
        },
        {
            key: 'customFeeds',
            setting: 'hideCustomFeeds',
            condition: (pageContext, settings) => !settings.hideSideBar,
            shouldHide: (settings) => settings.hideCustomFeeds === true,
            targetElement: (element) => element.parentElement.parentElement,
            showExtraElements: (element) => [element, element.parentElement.parentElement]
        },
        {
            key: 'recentSubreddits',
            setting: 'hideRecentSubreddits',
            condition: (pageContext, settings) => !settings.hideSideBar,
            shouldHide: (settings) => settings.hideRecentSubreddits === true
        },
        {
            key: 'communities',
            setting: 'hideCommunities',
            condition: (pageContext, settings) => !settings.hideSideBar,
            shouldHide: (settings) => settings.hideCommunities === true,
            targetElement: (element) => element.parentElement.parentElement,
            showExtraElements: (element) => [element, element.parentElement.parentElement]
        },
        {
            key: 'all',
            setting: 'hideAll',
            condition: (pageContext, settings) => !settings.hideSideBar,
            shouldHide: (settings) => settings.hideAll === true
        }
    ];

    let currentSettings = {};
    let originalDisplayValues = new Map();
    const holdTime = 0.2;

    const REDIRECT_MAPPINGS = [
        {
            check: (path) => path === '/r/popular' || path === '/r/popular/',
            setting: 'hidePopular',
        },
        {
            check: (path) => path === '/explore' || path.startsWith('/explore/'),
            setting: 'hideExplore',
        },
        {
            check: (path) => path === '/r/all' || path === '/r/all/',
            setting: 'hideAll',
        },
        {
            check: (path) => path.startsWith('/notifications'),
            setting: 'hideNotifications',
            message: 'Notifications page detected, redirecting to home...'
        },
        {
            check: (path) => path === '/r/popular' || path === '/r/popular/',
            setting: 'hideSideBar',
        },
        {
            check: (path) => path === '/explore' || path.startsWith('/explore/'),
            setting: 'hideSideBar',
        },
        {
            check: (path) => path === '/r/all' || path === '/r/all/',
            setting: 'hideSideBar',
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
        const pageContext = {
            isSubredditPage: window.location.pathname.startsWith('/r'),
            isUserPage: window.location.pathname.startsWith('/user'),
            isExplorePage: window.location.pathname.startsWith('/explore')
        };

        if (!currentSettings || Object.keys(currentSettings).length === 0) {
            Object.values(SELECTORS).forEach(selectorString => {
                findElements(selectorString).forEach(element => showElement(element));
            });
            return;
        }

        ELEMENT_CONFIGS.forEach(config => {
            if (config.condition && !config.condition(pageContext, currentSettings)) {
                return;
            }

            const elements = findElements(SELECTORS[config.key]);

            elements.forEach(element => {
                if (config.customHandler) {
                    const shouldHide = config.shouldHide ? config.shouldHide(currentSettings, pageContext) : false;
                    config.customHandler(element, shouldHide);
                } else {
                    const shouldHide = config.shouldHide ? config.shouldHide(currentSettings, pageContext) : false;

                    if (shouldHide) {
                        const targetEl = config.targetElement ? config.targetElement(element) : element;
                        hideElement(targetEl);
                    } else {
                        if (config.showExtraElements) {
                            config.showExtraElements(element).forEach(el => showElement(el));
                        } else {
                            showElement(element);
                        }
                    }
                }
            });
        });
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
                const feedElements = findElements(SELECTORS.homeFeed);

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
        let shouldReapplyUpvotes = false;

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    Object.values(SELECTORS).forEach(selector => {
                        if ((node.matches && node.matches(selector)) ||
                            (node.querySelector && node.querySelector(selector))) {
                            shouldReapply = true;
                        }
                    });

                    if ((node.matches && node.matches(SELECTORS.commentActionRow)) ||
                        (node.querySelector && node.querySelector(SELECTORS.commentActionRow))) {
                        shouldReapplyUpvotes = true;
                    }

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
        } else if (shouldReapplyUpvotes && !currentSettings.hideComments) {
            setTimeout(() => applyUpvoteSettings(), 100);
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