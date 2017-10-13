[![Downloads](https://img.shields.io/apm/dm/better-git-blame.svg)](https://atom.io/packages/better-git-blame) [![Version](https://img.shields.io/apm/v/better-git-blame.svg)](https://atom.io/packages/better-git-blame) [![bitHound Overall Score](https://www.bithound.io/github/Stepsize/atom-better-git-blame/badges/score.svg)](https://www.bithound.io/github/Stepsize/atom-better-git-blame) [![bitHound Dependencies](https://img.shields.io/bithound/dependencies/github/Stepsize/atom-better-git-blame.svg)](https://www.bithound.io/github/Stepsize/atom-better-git-blame/master/dependencies/npm) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![License](https://img.shields.io/apm/l/better-git-blame.svg)](https://github.com/Stepsize/atom-better-git-blame/blob/master/LICENSE.md)

# Better Git Blame Atom package <img src="https://user-images.githubusercontent.com/13640069/31381614-f76a2990-adac-11e7-99d1-c3e53c4f5802.png" alt="better git blame logo" height="48px" align="right" />

**A better way to view git blame info in Atom.**

(Doubles up as the Atom integration for the [Layer app](http://bit.ly/1tvB1HC).)

- [What makes it better?](#what-makes-it-better)
- [How do I use it?](#how-do-i-use-it)
- [How do I get setup?](#how-do-i-get-setup)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [What is Layer?](#what-is-layer)
- [What is Stepsize?](#what-is-stepsize)
- [Security and privacy](#security-and-privacy)

## What makes it better?

TL;DR: it does more than just display `git blame` annotations in the gutter – it pulls in info about pull requests & related issues, and helps you visualise the blame info.

**A rich popover displays summary info about the commit, its corresponding pull request, and any related issues.**

![Better Git Blame popover](https://i.imgur.com/VrDCU8u.png)

**Line highlighting makes it clear which other lines were introduced by the blame commit and its corresponding pull request.**

![Line highlighting](https://i.imgur.com/WsJTl7s.png)

**Color-coding indicates the age of each line of code relative to the whole repo. Check the popover to visualise that time span.**

![Age color-coding](https://i.imgur.com/jg0Xsg4.png)

Oh and it's also fast and nicely designed.

## How do I use it?

Use `ctrl-b`  to toggle the blame gutter.

Alternatively, right click the file you want to blame and select `Toggle Better Git Blame`, or search for this command in the [command palette](http://flight-manual.atom.io/getting-started/sections/atom-basics/#command-palette) (`cmd-shift-p`).

Hover over the blame text to display the popover & line highlighting.

## How do I get setup?

#### Install the Atom package

Run `apm install better-git-blame` and restart Atom. You can also install it from Atom's Settings pane.

That's all you need to get going, but if you want to see info about pull requests and issues, you'll need to install one of our integrations.

#### Setup the GitHub integration

Install the [Layer GitHub app](http://bit.ly/2hzJJkj) to view pull requests and issues in the blame popover. Wondering about permissions? See [here](#permissions).

#### Setup the Jira integration

Install our Jira integration to view Jira issues in the blame popover. (This currently requires the GitHub integration to work.)

Go the `Add-ons` page of your Jira instance (see screenshot below) and search for `Layer connector for Jira`.

![jira-addons-page](https://i.imgur.com/aBeE2Pl.png)

## FAQ

**Is this free?**

Yep.

**Do you integrate with other code hosting tools?**

Currently we only support GitHub, but we plan to support GitLab and BitBucket in the near future. Let us know that you're interested in another integration by tweeting at us [@StepsizeHQ](https://twitter.com/stepsizehq).

**Do you integrate with other project management tools?**

Currently we only support GitHub and Jira, but we plan to support Trello and Pivotal Tracker in the near future. Let us know that you're interested in another integration by tweeting at us [@StepsizeHQ](https://twitter.com/stepsizehq).

**Can I use this plugin if I don't use pull requests or issues?**

Sure, everything will still work. In that case you don't need to setup any integrations and can use the plugin out of the box.

**Can I use this plugin without the integrations?**

Sure, everything will still work but you'll only see information about commits.

**Is this available for other editors?**

Not yet, but we intend to port it to other editors. Don't hesitate to get in touch ([@StepsizeHQ](https://twitter.com/stepsizehq) or hello@stepsize.com) if you'd like to develop a version for your favourite editor so we can give you an overview of what this plugin does under the hood.

**Can I use this plugin with the Layer app?**

Absolutely, this plugin talks to the app so you can search over selected code.

**Do I have to use the Layer app with this plugin?**

Nope, you can use this plugin standalone and can turn off the UDP connection used with the Layer app (you can do this from the plugin's settings).

<a name="permissions"></a>
**Is my code sent anywhere?**

*GitHub integration*

Your code is not sent anywhere, but we need read access to code so we can map commits to pull requests (this is just how permissions work for GitHub apps unfortunately).

*UDP messaging to Layer*

To work with the Layer app, this plugin sends UDP messages to the app so it can perform searches for the code you selected. These UDP messages only contain file paths and selected line numbers, not code.

**Does the plugin do any dodgy stuff I should know about?**

No it doesn't, although you may find the fact that we collect usage analytics dodgy.

To be completely transparent, we offer this plugin for free in the hope that it will entice you to try out other Stepsize products. We're a business, after all, and developing this and hosting the backend for it costs us money, so we'd like to measure its worth.

Our analytics are completely anonymous, do not track any sensitive or personally identifiable data, and will only be used to improve Stepsize products.

We hope you understand, but if you don't you can turn off absolutely all the analytics and use the plugin under the radar. You can also poke around the code to see for yourself what is tracked.

## Contributing

If you'd like to contribute we'd love to hear from you - just tweet at us [@StepsizeHQ](https://twitter.com/stepsizehq) or email us at hello@stepsize.com. Alternatively you can just fork the plugin and submit a PR.

## License

All the software in this repository is released under the MIT License. See [LICENSE.md](https://github.com/stepsize/layer-atom-plugin/blob/master/LICENSE.md) for details.

## What is Layer?

Layer is a desktop app we're working on, currently in private beta. It surfaces all the relevant commits, pull requests, and issues for any piece of code you select in your editor. This allows you to quickly dig up the history of any piece of code and understand its origin and purpose.

You can find a bit more about it at [stepsize.com](http://bit.ly/1tvB1HC).

## What is Stepsize?

[Stepsize](http://bit.ly/1tvB1HC) is a small startup based in London. We build dev tools to help engineers in medium to large teams be well-informed and productive.

We do this by integrating with all the tools you use, structuring the information found inside them, and making it easily accessible and searchable.

Check us out [here](http://bit.ly/1tvB1HC) or tweet at us [@StepsizeHQ](https://twitter.com/stepsizehq) 🙏

## Security and privacy

If you set up the GitHub and/or Jira integrations, you might be interested in our [security statement](http://bit.ly/2gvkQGO) & [privacy policy](http://bit.ly/2gvkSyq).

You can safely ignore them if you don't use the integrations.
