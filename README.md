# Better Git Blame Atom package

**A better way to view git blame info in Atom.**

(Doubles up as the Atom integration for the [Layer app](https://stepsize.com).)

- [What makes it better?](#what-makes-it-better)
- [How do I use it?](#how-do-i-use-it)
- [How do I get setup?](#how-do-i-get-setup)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [What is Layer?](#what-is-layer)
- [What is Stepsize?](#what-is-stepsize)

## What makes it better?

TL;DR – it pulls in info about pull requests & related issues, and helps you visualise the blame info.

**A rich popover displays summary info about the commit, its corresponding pull request, and any related issues.**

![Better Git Blame popover](https://i.imgur.com/VrDCU8u.png)

**Line highlighting makes it clear which other lines were introduced by the blame commit and its corresponding pull request.**

![Line highlighting](https://i.imgur.com/WsJTl7s.png)

**Color-coding indicates the age of each line of code relative to the whole repo.**

![Age color-coding](https://i.imgur.com/qMLLPIS.png)

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

Install the [Layer GitHub app](https://github.com/apps/layer) to view pull requests and issues in the blame popover. Wondering about permissions? See [here](#permissions).

#### Setup the Jira integration

Install our Jira integration to view Jira issues in the blame popover.

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
**Is my code sent to any servers?**

*GitHub integration*

The GitHub integration currently asks for read access to code but doesn't need or make use of it. We set it up like this to facilitate the development of future functionality we're working on, but now we're considering splitting up the GitHub integration into two distinct apps - one with read access to metadata for the plugin, and one with read access to the code for the upcoming features/products.

If this is a deal breaker for you, we understand. If possible, please let us know ([@StepsizeHQ](https://twitter.com/stepsizehq) or hello@stepsize.com) so we're aware of the demand to get this done.

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

You can find a bit more about it at [stepsize.com](https://stepsize.com).

## What is Stepsize?

[Stepsize](https://stepsize.com) is a small startup based in London. We build dev tools to help engineers in medium to large teams be well-informed and productive.

We do this by integrating with all the tools you use, structuring the information found inside them, and making it easily accessible and searchable.

Check us out [here](https://stepsize.com) or tweet at us [@StepsizeHQ](https://twitter.com/stepsizehq) 🙏
