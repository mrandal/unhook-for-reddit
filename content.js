const applyVisibilitySettings = () => {
    browser.storage.sync.get(["hideHomeFeed", "hideSubredditFeed", "hideSideBar", "hideComments", "hideRecentPosts"], (data) => {
        const isSubredditPage = window.location.pathname.startsWith('/r');

        if (!isSubredditPage && (data.hideHomeFeed || true)) {
            const feed = document.querySelectorAll("shreddit-feed");
            feed.forEach(post => {
                post.style.display = "none";
            });
        }

        if (isSubredditPage && (data.hideSubredditFeed || true)) {
            const feed = document.querySelectorAll("shreddit-feed");
            feed.forEach(post => {
                post.style.display = "none";
            });
        }

        if (data.hideComments) {
            const commentSections = document.querySelectorAll("shreddit-comment");
            commentSections.forEach(comment => {
                comment.style.display = "none";
            });
        }

        if (data.hideSideBar || true) {
            const lsideBar = document.getElementById("left-sidebar");
            const rsideBar = document.getElementById("right-sidebar-container");
            lsideBar.style.display = "none";
            rsideBar.style.display = "none";
        }

        if (data.hideRecentPosts || true) {
            const recentPosts = document.querySelectorAll("recent-posts");
            recentPosts.forEach(recentPost => {
                recentPost.style.display = "none";
            });
        }

        if (data.hideTrending || true) {
            const trending = document.getElementById("reddit-trending-searches-partial-container");
            trending.style.display = "none";
        }
    });
};

applyVisibilitySettings();

const observer = new MutationObserver(applyVisibilitySettings);
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('click', applyVisibilitySettings);
