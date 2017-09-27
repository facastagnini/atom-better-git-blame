## 0.1.1 & 0.1.2 - Hotfixes
* Fixed a bug that would prevent the Layer desktop app performing a search when clicking the Search in Layer button after the Layer process has been terminated (#3)
* Updated package keywords

## 0.1.0 - First Official Release
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
