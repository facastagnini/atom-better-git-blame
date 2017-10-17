## 0.3.0: Combined popover
* Combined the blame popover and the age tooltip into one

## 0.2.4: Analytics tweak
* Anonymously track repos for which the plugin is used to measure team usage (see #21).

## 0.2.3: Improve logging & request options
* Improved the logging to help debug issue #16
* Updated the user-agent in the request to the augmentation server

## 0.2.2: Win32 & Bug Fixes
* Fixed issue preventing the gutter from rendering on Windows platforms
* Fixed issue causing Bad Request errors in console when presenting the popover (#16)

## 0.2.1: Hotfixes
* Fixed a few issues with the tooltip analytics introduced in 0.2.0 resulting in duplicate records and the integration notification not being displayed.

## 0.2.0: Age Tooltip & Integration Notification
* Added new tooltip when hovering over the age gutter to visualise that time span.
* Added a notification to prompt users to install integrations to see additional relevant data.

## 0.1.6: Layer & Analytics
* Fixed issues with analytics not recording timestamps
* Fixed bugs that would cause Layer to perform multiple searches when using the Search in Layer functionality
* Trimmed new lines in git stdout to prevent user hashes being incorrectly calculated
* Added random user hashes for analytics where users have no global git config email set (#8)

## 0.1.1 - 0.1.5: Hotfixes
* Fixed a bug that would prevent the Layer desktop app performing a search when clicking the Search in Layer button after the Layer process has been terminated (#3)
* Updated package keywords
* Fix errors being thrown on launch when no git config is present (#5)

## 0.1.0: First Official Release
### New features <small>- Introducing the Better Git Blame gutter view!</small>
* Toggle gutter with `ctrl-b` to display `git blame` data
* Mouse over the gutter to show the blame popover
* Stepsize Services to fetch pull request & issue metadata have been integrated to display this data in the blame popover
* Gutter view is color-coded to represent the age of code relative to the whole repo
* Lines sharing the same commit & pull request are highlighted while the blame popover is in view
* Added “Search in Layer” functionality

### Technical Details
* Initial package boilerplate and TypeScript config
* Added selection event watching to support Layer desktop app
* Ported UDP message format from existing Layer atom plugin
* Added calculations for repo relative age color coding ([node-color-gradient](https://github.com/Stepsize/node-color-gradient))
* Added Preact for rendering gutter items and popover
* Added lowdb for in-memory caching of shared resources (Pull Requests, Issues)
* Added functions for handling `git` child processes
* Added logic for selecting relevant code blocks for gutter view regions
* Added anonymous user tracking
* Performance optimisations
