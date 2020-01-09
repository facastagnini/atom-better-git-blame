'use babel';

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
}

function trackGutterShown() {
  const notifData = getIntegrationNotificationData();
  notifData.gutters += 1;
  saveIntegrationNotificationData(notifData);
}

export function trackTooltipShown() {
  const notifData = getIntegrationNotificationData();
  notifData.tooltips += 1;
  saveIntegrationNotificationData(notifData);
}

export function checkIntegrationDataRetrieved(pullRequests: Array<any>, issues: Array<any>) {
  const prCount = Array.isArray(pullRequests) ? Object.keys(pullRequests).length : 0;
  const issueCount = Array.isArray(issues) ? Object.keys(issues).length : 0;
  if (prCount > 0 || issueCount > 0) {
    const notifData = getIntegrationNotificationData();
    notifData.wasIntegrationDataRetrieved = true;
    saveIntegrationNotificationData(notifData);
  }
}
