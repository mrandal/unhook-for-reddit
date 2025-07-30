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
        "hideTrending"
    ];

    const SELECTORS = {
        homeFeed: "shreddit-feed, [data-testid='feed'], [data-testid='home-feed'], .feed, .home-feed, [data-testid='post-container'], [data-testid='post']",
        subredditFeed: "shreddit-feed, [data-testid='feed'], [data-testid='subreddit-feed'], .feed, .subreddit-feed, [data-testid='post-container'], [data-testid='post']",
        comments: "shreddit-comment, [data-testid='comment'], [data-testid='comment-tree'], .comment, .comment-tree, [data-testid='comment-container'], [data-testid='comment-tree']",
        recentPosts: "recent-posts, [data-testid='recent-posts'], [data-testid='trending-posts'], .recent-posts, .trending-posts, [data-testid='trending'], [data-testid='popular-posts']",
        trending: "#reddit-trending-searches-partial-container, faceplate-tracker[data-testid='reddit-trending-result']",
        leftSidebar: "#left-sidebar, [data-testid='left-sidebar'], [data-testid='sidebar'], .left-sidebar, .sidebar, [data-testid='navigation'], [data-testid='community-list']",
        rightSidebar: "#right-sidebar-container, [data-testid='right-sidebar'], [data-testid='sidebar'], .right-sidebar, .sidebar, [data-testid='community-info'], [data-testid='about-community']"
    };

    // Store current settings globally
    let currentSettings = {};

    // Store original display values to restore them properly
    let originalDisplayValues = new Map();

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
        setTimeout(() => {
            const computedDisplay = window.getComputedStyle(element).display;
            // If it's still hidden, try even more aggressive approach
            if (computedDisplay === 'none') {
                element.style.cssText += `display: ${displayValue} !important; visibility: visible !important; opacity: 1 !important;`;
            }
        }, 10);
    };

    const testContainer = document.getElementById('reddit-trending-searches-partial-container');
    console.log('Test container query:', testContainer);

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

        Object.entries(SELECTORS).forEach(([name, selectorString]) => {
            const selectors = selectorString.split(', ').map(s => s.trim());
            let totalElements = 0;
            let foundSelector = '';

            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    totalElements = elements.length;
                    foundSelector = selector;
                    break;
                }
            }


        });


    };

    // Function to apply visibility settings
    const applyVisibilitySettings = () => {
        const isSubredditPage = window.location.pathname.startsWith('/r');

        // Safety check - if currentSettings is empty or undefined, show all elements
        if (!currentSettings || Object.keys(currentSettings).length === 0) {

            // Show all elements when no settings are loaded
            Object.values(SELECTORS).forEach(selectorString => {
                const elements = findElements(selectorString);
                elements.forEach(element => showElement(element));
            });
            return;
        }



        // Helper function to find elements using multiple selectors, including Shadow DOM
        const findElements = (selectorString) => {
            const selectors = selectorString.split(', ').map(s => s.trim());
            let elements = [];

            // Function to search within a root (document or shadow root)
            const searchInRoot = (root, selector) => {
                try {
                    return Array.from(root.querySelectorAll(selector));
                } catch (e) {
                    return [];
                }
            };

            // Function to recursively search through shadow DOMs
            const searchWithShadowDOM = (root, selector) => {
                let found = [];

                // Search in current root
                found = found.concat(searchInRoot(root, selector));

                // Search in all shadow roots
                const elementsWithShadow = root.querySelectorAll('*');
                elementsWithShadow.forEach(element => {
                    if (element.shadowRoot) {
                        found = found.concat(searchWithShadowDOM(element.shadowRoot, selector));
                    }
                });

                return found;
            };

            // Try each selector
            for (const selector of selectors) {
                // First try normal document search
                const normalFound = searchInRoot(document, selector);
                if (normalFound.length > 0) {
                    elements = normalFound;
                    break;
                }

                // If not found, search through shadow DOMs
                const shadowFound = searchWithShadowDOM(document, selector);
                if (shadowFound.length > 0) {
                    elements = shadowFound;
                    break;
                }
            }

            return elements;
        };

        // Handle home feed
        const homeFeedElements = findElements(SELECTORS.homeFeed);
        if (!isSubredditPage) {
            console.log('Processing home feed elements. hideHomeFeed setting:', currentSettings.hideHomeFeed);
            homeFeedElements.forEach(element => {
                if (currentSettings.hideHomeFeed === true) {
                    console.log('Hiding home feed element');
                    hideElement(element);
                } else {
                    console.log('Showing home feed element');
                    showElement(element);
                }
            });
            console.log('Home feed elements:', homeFeedElements.length, 'hidden:', currentSettings.hideHomeFeed === true);
        }

        // Handle subreddit feed
        const subredditFeedElements = findElements(SELECTORS.subredditFeed);
        if (isSubredditPage) {
            subredditFeedElements.forEach(element => {
                if (currentSettings.hideSubredditFeed === true) {
                    hideElement(element);
                } else {
                    showElement(element);
                }
            });
            console.log('Subreddit feed elements:', subredditFeedElements.length, 'hidden:', currentSettings.hideSubredditFeed === true);
        }

        // Handle comments
        console.log('Processing comment elements. hideComments setting:', currentSettings.hideComments);
        const commentElements = findElements(SELECTORS.comments);
        console.log('Found comment elements:', commentElements.length);

        commentElements.forEach(element => {
            console.log('Processing comment element:', element.tagName, element.id, element.className);
            if (currentSettings.hideComments === true) {
                console.log('Hiding comment element');
                hideElement(element);
            } else {
                console.log('Showing comment element');
                showElement(element);
            }
        });
        console.log('Comment elements:', commentElements.length, 'hidden:', currentSettings.hideComments === true);

        // Handle left sidebar only
        console.log('Processing left sidebar elements. hideSideBar setting:', currentSettings.hideSideBar);
        console.log('Left sidebar selector being used:', SELECTORS.leftSidebar);

        const leftSidebarElements = findElements(SELECTORS.leftSidebar);

        console.log('Found left sidebar elements:', leftSidebarElements.length);

        // Additional debugging for left sidebar
        if (leftSidebarElements.length === 0) {
            console.log('No left sidebar elements found, trying direct queries...');
            const directLeftSidebar = document.querySelector('#left-sidebar');
            const dataTestSidebar = document.querySelector('[data-testid="left-sidebar"]');
            const navElements = document.querySelectorAll('nav, [role="navigation"]');

            console.log('Direct #left-sidebar query:', directLeftSidebar);
            console.log('Direct [data-testid="left-sidebar"] query:', dataTestSidebar);
            console.log('Nav elements found:', navElements.length);

            if (navElements.length > 0) {
                console.log('First few nav elements:');
                Array.from(navElements).slice(0, 3).forEach((el, i) => {
                    console.log(`Nav ${i}:`, el.tagName, el.id, el.className);
                });
            }
        }

        leftSidebarElements.forEach((element, index) => {
            console.log(`Processing left sidebar element ${index}:`, element.tagName, element.id, element.className);
            console.log(`Element computed style display:`, window.getComputedStyle(element).display);
            console.log(`Element has unhook-reddit-visible class:`, element.classList.contains('unhook-reddit-visible'));

            if (currentSettings.hideSideBar === true) {
                console.log('Hiding left sidebar element');
                hideElement(element);
            } else {
                console.log('Showing left sidebar element');
                showElement(element);

                // Check if showing worked
                setTimeout(() => {
                    console.log(`After showing - element display:`, window.getComputedStyle(element).display);
                    console.log(`After showing - has visible class:`, element.classList.contains('unhook-reddit-visible'));
                }, 100);
            }
        });
        console.log('Left sidebar elements:', leftSidebarElements.length, 'hidden:', currentSettings.hideSideBar === true);

        // Handle recent posts
        console.log('Processing recent posts elements. hideRecentPosts setting:', currentSettings.hideRecentPosts);
        const recentPostElements = findElements(SELECTORS.recentPosts);
        console.log('Found recent posts elements:', recentPostElements.length);

        recentPostElements.forEach(element => {
            console.log('Processing recent posts element:', element.tagName, element.id, element.className);
            if (currentSettings.hideRecentPosts === true) {
                console.log('Hiding recent posts element');
                hideElement(element);
            } else {
                console.log('Showing recent posts element');
                showElement(element);
            }
        });
        console.log('Recent posts elements:', recentPostElements.length, 'hidden:', currentSettings.hideRecentPosts === true);

        // Handle trending container
        const trendingElements = findElements(SELECTORS.trending);
        trendingElements.forEach(element => {
            if (currentSettings.hideTrending === true) {
                hideElement(element);
            } else {
                showElement(element);
            }
        });


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
                    hideTrending: data.hideTrending === true
                };

                // Apply settings immediately after loading
                applyVisibilitySettings();
            }).catch((error) => {
                // Fall back to default settings (all visible)
                currentSettings = {
                    hideHomeFeed: false,
                    hideSubredditFeed: false,
                    hideSideBar: false,
                    hideComments: false,
                    hideRecentPosts: false,
                    hideTrending: false
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
                hideTrending: false
            };
            applyVisibilitySettings();
        }
    };

    // Main function to load and apply settings
    const loadAndApplySettings = () => {
        browser.storage.sync.get(STORAGE_KEYS, (data) => {
            currentSettings = data;

            // Test all selectors first
            testSelectors();

            // Scan for Reddit elements
            scanForRedditElements();

            // Also run a broader scan for debugging
            console.log('=== BROADER ELEMENT SCAN ===');
            const allDivs = document.querySelectorAll('div, aside, section, nav, article');
            console.log('Total divs/aside/section/nav/article found:', allDivs.length);

            // Look for elements with specific keywords in id/class
            const sidebarLike = Array.from(allDivs).filter(el =>
                el.id.toLowerCase().includes('sidebar') ||
                el.className.toLowerCase().includes('sidebar') ||
                el.id.toLowerCase().includes('side') ||
                el.className.toLowerCase().includes('side')
            );
            console.log('Sidebar-like elements:', sidebarLike.length);
            sidebarLike.slice(0, 5).forEach((el, i) => {
                console.log(`Sidebar-like ${i}:`, el.tagName, el.id, el.className);
            });

            const recentLike = Array.from(allDivs).filter(el =>
                el.id.toLowerCase().includes('recent') ||
                el.className.toLowerCase().includes('recent') ||
                el.id.toLowerCase().includes('trending') ||
                el.className.toLowerCase().includes('trending')
            );
            console.log('Recent/trending-like elements:', recentLike.length);
            recentLike.slice(0, 5).forEach((el, i) => {
                console.log(`Recent-like ${i}:`, el.tagName, el.id, el.className);
            });

            const commentLike = Array.from(allDivs).filter(el =>
                el.id.toLowerCase().includes('comment') ||
                el.className.toLowerCase().includes('comment')
            );
            console.log('Comment-like elements:', commentLike.length);
            commentLike.slice(0, 5).forEach((el, i) => {
                console.log(`Comment-like ${i}:`, el.tagName, el.id, el.className);
            });
            console.log('=== END BROADER SCAN ===');

            // Apply visibility settings
            applyVisibilitySettings();
        });
    };

    // Listen for storage changes to update settings dynamically
    browser.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            console.log('Settings changed:', changes);

            // Update current settings with normalized boolean values
            Object.keys(changes).forEach(key => {
                currentSettings[key] = changes[key].newValue === true;
                console.log(`Updated setting ${key}: ${changes[key].oldValue} -> ${changes[key].newValue} (normalized: ${currentSettings[key]})`);
            });

            console.log('Updated currentSettings:', currentSettings);

            // Reapply visibility settings immediately
            console.log('Reapplying visibility settings due to storage change...');
            applyVisibilitySettings();
        }
    });

    // Load and apply settings immediately on script load
    console.log('Loading and applying settings immediately on script load');
    loadAndApplyImmediateSettings();

    // Also load settings with full debugging (this might be redundant but ensures settings are loaded)
    setTimeout(() => {
        loadAndApplySettings();
    }, 100);

    // Also apply settings very early if document is still loading
    if (document.readyState === 'loading') {
        // Apply settings again when DOM content is loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, reapplying settings');
            applyVisibilitySettings();
        });
    }

    // Handle navigation changes to prevent flash
    let currentUrl = window.location.href;
    let isNavigating = false;

    const handleNavigationStart = (destinationUrl = null) => {
        if (!isNavigating) {
            console.log('Navigation starting, reinforcing hiding...');
            isNavigating = true;

            // Immediately apply settings based on DESTINATION page to prevent flash
            if (currentSettings && Object.keys(currentSettings).length > 0) {
                let isDestinationSubreddit;

                if (destinationUrl) {
                    // Use destination URL to determine page type
                    try {
                        const url = new URL(destinationUrl, window.location.origin);
                        isDestinationSubreddit = url.pathname.startsWith('/r/');
                    } catch (e) {
                        // If URL parsing fails, fall back to current URL
                        isDestinationSubreddit = window.location.pathname.startsWith('/r');
                    }
                } else {
                    // Fallback to current URL (for back/forward navigation)
                    isDestinationSubreddit = window.location.pathname.startsWith('/r');
                }

                console.log('Destination is subreddit page:', isDestinationSubreddit);

                // Apply settings based on DESTINATION page context
                const feedElements = findElements(SELECTORS.homeFeed); // They use same selector

                if (!isDestinationSubreddit && currentSettings.hideHomeFeed) {
                    // Going to home page and home feed should be hidden
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
            console.log('Navigation detected:', currentUrl, '->', newUrl);
            currentUrl = newUrl;
            isNavigating = false;

            // Immediately apply settings for the new page context
            setTimeout(() => {
                console.log('Applying settings after navigation');
                applyVisibilitySettings();
            }, 50); // Small delay to let page elements load
        }
    };

    // Listen for clicks on links to catch navigation before it starts
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a[href]');
        if (target && target.href && target.href.includes('reddit.com')) {
            console.log('Link click detected, preparing for navigation...');
            handleNavigationStart(target.href); // Pass destination URL
        }
    }, true); // Use capture phase to catch early

    // Listen for navigation changes
    const navigationObserver = new MutationObserver(handleNavigation);
    navigationObserver.observe(document, { childList: true, subtree: true });

    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', (event) => {
        handleNavigationStart(); // No destination URL available for back/forward
        setTimeout(handleNavigation, 10);
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
    // document.addEventListener('click', () => {
    //     setTimeout(() => {
    //         applyVisibilitySettings();
    //     }, 100);
    // });

    // Enhanced search input detection with multiple event types
    const handleSearchInteraction = (event) => {
        // More comprehensive search input detection
        const target = event.target;

        // Check if target is an element node
        if (!target || target.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const isSearchInput = target && (
            target.type === 'search' ||
            target.getAttribute?.('role') === 'searchbox' ||
            target.classList?.contains('search') ||
            target.placeholder?.toLowerCase().includes('search') ||
            target.getAttribute?.('aria-label')?.toLowerCase().includes('search') ||
            target.id?.toLowerCase().includes('search') ||
            target.className?.toLowerCase().includes('search')
        );

        if (isSearchInput) {
            // Apply trending hiding immediately and with delays
            [0, 50].forEach(delay => {
                setTimeout(() => {
                    if (currentSettings.hideTrending === true) {
                        // Find and hide trending elements
                        const trendingElements = findElements(SELECTORS.trending);
                        trendingElements.forEach(element => {
                            hideElement(element);
                        });

                        // Also try direct selectors for trending (including Shadow DOM)
                        const directTrendingSelectors = [
                            '#reddit-trending-searches-partial-container',
                            'faceplate-tracker[data-testid="reddit-trending-result"]',
                            '[role="menu"]',
                            '[role="listbox"]'
                        ];

                        directTrendingSelectors.forEach(selector => {
                            // Use our Shadow DOM-aware findElements function
                            const elements = findElements(selector);
                            elements.forEach(element => {
                                // Check if it contains trending content
                                const text = element.innerText?.toLowerCase() || '';
                                if (text.includes('trending') || element.getAttribute('data-testid') === 'reddit-trending-result') {
                                    hideElement(element);
                                }
                            });
                        });
                    }
                }, delay);
            });
        }
    };

    // Listen for multiple event types on search inputs
    document.addEventListener('focusin', handleSearchInteraction, true);
    // document.addEventListener('focus', handleSearchInteraction, true);
    // document.addEventListener('click', handleSearchInteraction, true);
    // document.addEventListener('input', handleSearchInteraction, true);

    // Enhanced mutation observer to catch dynamically created search dropdowns (including Shadow DOM)
    const searchObserver = new MutationObserver((mutations) => {
        if (currentSettings.hideTrending === true) {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node contains trending elements (including Shadow DOM)
                        const trendingInNode = findElements('#reddit-trending-searches-partial-container, faceplate-tracker[data-testid="reddit-trending-result"]');
                        if (trendingInNode.length > 0) {
                            trendingInNode.forEach(element => hideElement(element));
                        }

                        // Check if the node itself is a trending element
                        if (node.id === 'reddit-trending-searches-partial-container' ||
                            node.getAttribute?.('data-testid') === 'reddit-trending-result') {
                            hideElement(node);
                        }

                        // If this node has a shadow root, observe it too
                        if (node.shadowRoot) {
                            searchObserver.observe(node.shadowRoot, { childList: true, subtree: true });
                        }
                    }
                });
            });
        }
    });

    searchObserver.observe(document.body, { childList: true, subtree: true });

    // Also observe existing shadow roots
    const observeExistingShadowRoots = () => {
        const elementsWithShadow = document.querySelectorAll('*');
        elementsWithShadow.forEach(element => {
            if (element.shadowRoot) {
                searchObserver.observe(element.shadowRoot, { childList: true, subtree: true });
            }
        });
    };

    // Set up shadow root observation with delay to catch dynamically created ones
    setTimeout(observeExistingShadowRoots, 100);

    // Function to scan for common Reddit elements
    const scanForRedditElements = () => {
        console.log('=== SCANNING FOR REDDIT ELEMENTS ===');

        // Common Reddit element patterns
        const patterns = [
            { name: 'posts', selectors: ['[data-testid*="post"]', '[data-testid*="feed"]', 'shreddit-feed'] },
            { name: 'comments', selectors: ['[data-testid*="comment"]', 'shreddit-comment'] },
            { name: 'sidebars', selectors: ['[data-testid*="sidebar"]', '[data-testid*="navigation"]', '[id*="sidebar"]'] },
            { name: 'search', selectors: ['[data-testid*="search"]', '[role="search"]', '[aria-label*="search"]'] },
            { name: 'trending', selectors: ['[data-testid*="trending"]', '[data-testid*="popular"]', '[role="menu"]'] }
        ];

        patterns.forEach(pattern => {
            pattern.selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`${pattern.name} (${selector}): ${elements.length} elements found`);
                    elements.forEach((el, index) => {
                        if (index < 3) { // Only log first 3 elements
                            console.log(`  ${index}:`, el.tagName, el.id, el.className);
                        }
                    });
                }
            });
        });

        console.log('=== END SCAN ===');
    };




} catch (error) {
    console.error('Content script error:', error);
    console.error('Stack trace:', error.stack);
}
