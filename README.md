# Unhook for Reddit - Firefox Extension

A Firefox extension that helps you focus on Reddit by hiding distracting elements like feeds, sidebars, trending searches, and more.

## Installation

Chrome: [https://chromewebstore.google.com/detail/unhook-for-reddit/mbihiifgeodcdgdlklkbmoinbgffdbeb ](https://chromewebstore.google.com/detail/unhook-for-reddit/mbihiifgeodcdgdlklkbmoinbgffdbeb )

Firefox: [https://addons.mozilla.org/en-US/firefox/addon/unhook-for-reddit/](https://addons.mozilla.org/en-US/firefox/addon/unhook-for-reddit/)

Edge: [https://microsoftedge.microsoft.com/addons/detail/unhook-for-reddit/kfikdicjkngjfjncbiiifbalohihabje](https://microsoftedge.microsoft.com/addons/detail/unhook-for-reddit/kfikdicjkngjfjncbiiifbalohihabje)

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory

## Settings

- **Dark Mode**: Toggle the options UI between light and dark themes
- **Hide Home Feed**: Removes the main feed from Reddit's home page
- **Hide Subreddit Feed**: Removes posts from subreddit pages
- **Hide Left Sidebar**: Removes the entire left navigation sidebar
- **Sidebar Sub-options**: When "Hide Left Sidebar" is enabled, these options are disabled:
  - **Hide Popular**: Hides the Popular button and redirects from `/r/popular`
  - **Hide Explore**: Hides the Explore button and redirects from `/explore`
  - **Hide Custom Feeds**: Hides custom feed sections
  - **Hide Recent Subreddits**: Hides recently visited subreddits
  - **Hide Communities**: Hides community sections
- **Hide Comments**: Removes comment sections from posts
- **Hide Recent Posts**: Hides recent/top posts sections
- **Hide Trending Searches**: Removes trending searches from the search bar

## License

This project is open source and available under the MIT License.

## Privacy

This extension:
- Only runs on Reddit.com
- Does not collect or transmit any personal data
- Stores settings locally in your browser
- Does not track your browsing activity

## Support

If you want to report issues or suggest features, please use our [feedback form](https://forms.gle/wB7BN8a7Be9aJTRq7).
