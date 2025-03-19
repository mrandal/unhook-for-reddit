const hideHomeFeed = document.getElementById("hideHomeFeed");
const hideSubredditFeed = document.getElementById("hideSubredditFeed");
const hideSideBar = document.getElementById("hideSideBar");
const hideComments = document.getElementById("hideComments");
const hideRecentPosts = document.getElementById("hideRecentPosts");
const hideTrending = document.getElementById("hideTrending");
const saveButton = document.getElementById("save");

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["hideHomeFeed", "hideSubredditFeed", "hideSideBar", "hideComments", "hideRecentPosts", "hideTrending"], (data) => {
        hideHomeFeed.checked = data.hideHomeFeed || false;
        hideSubredditFeed.checked = data.hideSubredditFeed || false;
        hideSideBar.checked = data.hideSideBar || false;
        hideComments.checked = data.hideComments || false;
        hideRecentPosts.checked = data.hideRecentPosts || false;
        hideTrending.checked = data.hideTrending || false;
    });
});

saveButton.addEventListener("click", () => {
    chrome.storage.sync.set({
        hideHomeFeed: hideHomeFeed.checked,
        hideSubredditFeed: hideSubredditFeed.checked,
        hideSideBar: hideSideBar.checked,
        hideComments: hideComments.checked,
        hideRecentPosts: hideRecentPosts.checked,
        hideTrending: hideTrending.checked
    });
});
