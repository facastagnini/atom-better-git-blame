'use babel';

import shell from 'shell';
import * as Analytics from '../stepsize/Analytics';

interface IIntegrationNotificationData {
  gutters: number;
  tooltips: number;
  wasIntegrationDataRetrieved: boolean;
  wasNotificationShown: boolean;
}

const initialNotifData = {
  gutters: 0,
  tooltips: 0,
  wasIntegrationDataRetrieved: false,
  wasNotificationShown: false,
};

function getIntegrationNotificationData(): IIntegrationNotificationData {
  const storedNotifData = localStorage.getItem('better-git-blame-integration-notification-data');
  return storedNotifData ? JSON.parse(storedNotifData) : initialNotifData;
}

function saveIntegrationNotificationData(notifData: IIntegrationNotificationData) {
  localStorage.setItem('better-git-blame-integration-notification-data', JSON.stringify(notifData));
}

export function handleGutterShown() {
  trackGutterShown();
  showIntegrationNotificationIfAppropriate();
}

function trackGutterShown() {
  const notifData = getIntegrationNotificationData();
  notifData.gutters += 1;
  saveIntegrationNotificationData(notifData);
}

function showIntegrationNotificationIfAppropriate() {
  const notifData = getIntegrationNotificationData();
  if (notifData.wasNotificationShown || notifData.wasIntegrationDataRetrieved) return;
  if (notifData.gutters >= 5 && notifData.tooltips >= 5) {
    Analytics.track('Integration notification shown');
    showIntegrationNotification();
    notifData.wasNotificationShown = true;
    saveIntegrationNotificationData(notifData);
  }
}

function showIntegrationNotification() {
  atom.notifications.addInfo('Boss mode blame', {
    description:
      'Want to see pull requests and issues in `better-git-blame` popovers?\n\n<img src="https://i.imgur.com/vUTvxHv.png" width="400" height="172" />\n\nJust setup one of our integrations to level up 🔥',
    dismissable: true,
    buttons: [
      {
        text: 'GitHub integration',
        onDidClick: () => {
          Analytics.track('Integration notification button clicked', { type: 'github' });
          shell.openExternal('https://github.com/apps/layer');
        },
      },
      {
        text: 'Jira integration',
        onDidClick: () => {
          Analytics.track('Integration notification button clicked', { type: 'jira' });
          shell.openExternal(
            'https://github.com/Stepsize/atom-better-git-blame#setup-the-jira-integration'
          );
        },
      },
      {
        text: 'Tell me more',
        onDidClick: () => {
          Analytics.track('Integration notification button clicked', { type: 'more' });
          shell.openExternal(
            'https://github.com/Stepsize/atom-better-git-blame#how-do-i-get-setup'
          );
        },
      },
    ],
  });
}

export function trackTooltipShown() {
  const notifData = getIntegrationNotificationData();
  notifData.tooltips += 1;
  saveIntegrationNotificationData(notifData);
}

export function checkIntegrationDataRetrieved(
  pullRequests: any,
  githubIssues: any,
  jiraIssues: any
) {
  const prCount = pullRequests ? Object.keys(pullRequests).length : 0;
  const giCount = githubIssues ? Object.keys(githubIssues).length : 0;
  const jiCount = jiraIssues ? Object.keys(jiraIssues).length : 0;
  if (prCount > 0 || giCount > 0 || jiCount > 0) {
    const notifData = getIntegrationNotificationData();
    notifData.wasIntegrationDataRetrieved = true;
    saveIntegrationNotificationData(notifData);
  }
}
