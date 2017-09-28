'use babel';

import shell from 'shell';
import * as Analytics from '../stepsize/Analytics';

export function handleGutterShown() {
  trackGutterShown();
  showIntegrationNotificationIfAppropriate();
}

function trackGutterShown() {
  const gutterShownCount = localStorage.getItem('better-git-blame-gutter-shown-count') || '0';
  localStorage.setItem('better-git-blame-gutter-shown-count', `${parseInt(gutterShownCount, 10) + 1}`);
}

function showIntegrationNotificationIfAppropriate() {
  const wasNotificationShown = localStorage.getItem('better-git-blame-integration-notification-shown');
  if (wasNotificationShown === 'true') return;
  const gutterShownCount = parseInt(localStorage.getItem('better-git-blame-gutter-shown-count') || '0', 10);
  const tooltipShownCount = parseInt(localStorage.getItem('better-git-blame-tooltip-shown-count') || '0', 10);
  const pullRequestCount = parseInt(localStorage.getItem('better-git-blame-pull-request-count') || '0', 10);
  const issueCount = parseInt(localStorage.getItem('better-git-blame-issue-count') || '0', 10);
  if (gutterShownCount >= 5 && tooltipShownCount >= 5 && pullRequestCount === 0 && issueCount === 0) {
    Analytics.track('Integration notification shown');
    showIntegrationNotification();
    localStorage.setItem('better-git-blame-integration-notification-shown', 'true');
  }
}

function showIntegrationNotification() {
  atom.notifications.addInfo('Boss mode blame', {
    description: 'Want to see pull requests and issues in `better-git-blame` popovers?\n\n<img src="https://i.imgur.com/vUTvxHv.png" width="400" height="172" />\n\nJust setup one of our integrations to level up 🔥',
    dismissable: true,
    buttons: [
      {
        text: 'GitHub integration',
        onDidClick: () => {
          Analytics.track('Integration notification GitHub clicked');
          shell.openExternal('https://github.com/apps/layer');
        },
      },
      {
        text: 'Jira integration',
        onDidClick: () => {
          Analytics.track('Integration notification Jira clicked');
          shell.openExternal('https://github.com/Stepsize/atom-better-git-blame#setup-the-jira-integration');
        },
      },
      {
        text: 'Tell me more',
        onDidClick: () => {
          Analytics.track('Integration notification more clicked');
          shell.openExternal('https://github.com/Stepsize/atom-better-git-blame#how-do-i-get-setup');
        },
      },
    ],
  });
}

export function trackTooltipShown(pullRequestCount: number, issueCount: number) {
  const tooltipShownCount = localStorage.getItem('better-git-blame-tooltip-shown-count') || '0';
  localStorage.setItem('better-git-blame-tooltip-shown-count', `${parseInt(tooltipShownCount, 10) + 1}`);
  const prCount = localStorage.getItem('better-git-blame-pull-request-count') || '0';
  localStorage.setItem('better-git-blame-pull-request-count', `${parseInt(prCount, 10) + pullRequestCount}`);
  const iCount = localStorage.getItem('better-git-blame-issue-count') || '0';
  localStorage.setItem('better-git-blame-issue-count', `${parseInt(iCount, 10) + issueCount}`);
}
