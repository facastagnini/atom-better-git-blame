[![Downloads](https://img.shields.io/apm/dm/better-git-blame.svg)](https://atom.io/packages/better-git-blame) [![Version](https://img.shields.io/apm/v/better-git-blame.svg)](https://atom.io/packages/better-git-blame) [![bitHound Overall Score](https://www.bithound.io/github/Stepsize/atom-better-git-blame/badges/score.svg)](https://www.bithound.io/github/Stepsize/atom-better-git-blame) [![bitHound Dependencies](https://img.shields.io/bithound/dependencies/github/Stepsize/atom-better-git-blame.svg)](https://www.bithound.io/github/Stepsize/atom-better-git-blame/master/dependencies/npm) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![License](https://img.shields.io/apm/l/better-git-blame.svg)](https://github.com/Stepsize/atom-better-git-blame/blob/master/LICENSE.md)

# Better Git Blame Atom package <img src="https://user-images.githubusercontent.com/13640069/31381614-f76a2990-adac-11e7-99d1-c3e53c4f5802.png" alt="better git blame logo" height="48px" align="right" />

**A better way to view git blame info in Atom.**

- [What makes it better?](#what-makes-it-better)
- [How do I use it?](#how-do-i-use-it)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)
- [What is Stepsize?](#what-is-stepsize)
- [Security and privacy](#security-and-privacy)

## What makes it better?

TL;DR: it does more than just display `git blame` annotations in the gutter – it helps you visualise the blame info including the age of the changes. 

**A rich popover displays summary info about the commit and visualises the commit's age.**

![Better Git Blame popover](https://i.imgur.com/Un1v31P.png)

**Line highlighting makes it clear which other lines were introduced by the blame commit.**

![Line highlighting](https://i.imgur.com/PV8YfdR.png)

Oh and it's also fast and nicely designed.

## How do I use it?

Use `ctrl-b`  to toggle the blame gutter.

Alternatively, right click the file you want to blame and select `Toggle Better Git Blame`, or search for this command in the [command palette](http://flight-manual.atom.io/getting-started/sections/atom-basics/#command-palette) (`cmd-shift-p`).

Hover over the blame text to display the popover & line highlighting.

## How do I get setup?

#### Install the Atom package

Run `apm install better-git-blame` and restart Atom. You can also install it from Atom's Settings pane.

That's all you need to get going, but if you want to see info about pull requests and issues, you'll need to install one of our integrations.

## FAQ

**Is this free?**

Yep.

**Does the plugin do any dodgy stuff I should know about?**

No it doesn't, although you may find the fact that we collect usage analytics dodgy.

To be completely transparent, we offer this plugin for free in the hope that it will entice you to try out other Stepsize products. We're a business, after all, and developing this and hosting the backend for it costs us money, so we'd like to measure its worth.

Our analytics are completely anonymous, do not track any sensitive or personally identifiable data, and will only be used to improve Stepsize products.

We hope you understand, but if you don't you can turn off absolutely all the analytics and use the plugin under the radar. You can also poke around the code to see for yourself what is tracked.

## Contributing

If you'd like to contribute we'd love to hear from you - just tweet at us [@StepsizeHQ](https://twitter.com/stepsizehq) or email us at hello@stepsize.com. Alternatively you can just fork the plugin and submit a PR.

## License

All the software in this repository is released under the MIT License. See [LICENSE.md](https://github.com/stepsize/layer-atom-plugin/blob/master/LICENSE.md) for details.

## What is Stepsize?

[Stepsize](http://bit.ly/1tvB1HC) is a startup based in London. We're developing a product that automatically documents agile teams' code by piecing together their data to maintain version controlled documentation.

Check us out [here](http://bit.ly/1tvB1HC) or tweet at us [@StepsizeHQ](https://twitter.com/stepsizehq) 🙏

## Security and privacy

You might be interested in our [privacy policy](http://terms.stepsize.com/privacy-policy).
