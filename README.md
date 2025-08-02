# Unhook Reddit - Firefox Extension

A Firefox extension that helps you focus on Reddit by hiding distracting elements like feeds, sidebars, trending searches, and more.

## Features

- **Hide Home Feed**: Remove the main feed from Reddit's home page
- **Hide Subreddit Feed**: Remove posts from subreddit pages
- **Hide Left Sidebar**: Remove the entire left navigation sidebar
- **Hide Popular**: Hide the "Popular" button and redirect from `/r/popular` to home
- **Hide Explore**: Hide the "Explore" button and redirect from `/explore` to home
- **Hide Custom Feeds**: Hide custom feed sections
- **Hide Recent Subreddits**: Hide recently visited subreddits
- **Hide Communities**: Hide community sections
- **Hide Comments**: Remove comment sections from posts
- **Hide Recent Posts**: Hide recent/top posts sections
- **Hide Trending Searches**: Remove trending searches from the search bar
- **Dark Mode**: Toggle between light and dark themes for the options UI

## Installation

### From Firefox Add-ons Store (Recommended)
1. Visit the Firefox Add-ons store
2. Search for "Unhook Reddit"
3. Click "Add to Firefox"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory

## Usage

1. Install the extension
2. Click the extension icon in your toolbar
3. Configure which elements you want to hide
4. Visit Reddit and see the changes take effect immediately

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

## Technical Details

- **Manifest Version**: 3
- **Minimum Firefox Version**: 109.0
- **Permissions**: `storage`, `activeTab`
- **Host Permissions**: `*://www.reddit.com/*`

## Development

### Project Structure
```
unhook-reddit-fox/
├── manifest.json          # Extension manifest
├── content.js            # Main content script
├── content.css           # Content styles
├── options.html          # Options page
├── options.js            # Options page logic
├── styles.css            # Options page styles
├── constants.js          # Shared constants
├── assets/               # Extension icons
└── README.md            # This file
```

### Key Features
- **Shadow DOM Support**: Handles Reddit's complex Shadow DOM structure
- **Dynamic Content**: Uses MutationObservers to handle dynamically loaded content
- **Performance Optimized**: Caches elements and debounces operations
- **Navigation Handling**: Prevents flickering during page navigation
- **Settings Persistence**: Uses browser.storage.sync for cross-device sync

## Contributing

Found a bug or have a feature request? Please use our [feedback form](https://forms.gle/wB7BN8a7Be9aJTRq7).

## License

This project is open source and available under the MIT License.

## Privacy

This extension:
- Only runs on Reddit.com
- Does not collect or transmit any personal data
- Stores settings locally in your browser
- Does not track your browsing activity

## Support

If you need help or want to report issues, please use our [feedback form](https://forms.gle/wB7BN8a7Be9aJTRq7).