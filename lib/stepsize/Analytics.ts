'use babel';

import Analytics from 'analytics-node';
import email from '../git/email';
import crypto from 'crypto';
import * as ConfigManager from '../ConfigManager';

let client: Analytics;
let userHash: string;

export async function init() {
  if (ConfigManager.get('sendUsageStatistics')) {
    client = new Analytics('BpxcscE9nzM1r0ENwNShXerBjbDSLDzj');
    let userEmail = await email();
    const hash = crypto.createHash('sha256');
    hash.update(userEmail);
    userHash = hash.digest('hex');
    const randomString = crypto.randomBytes(8).toString('hex');
    const configKeys = Object.keys(ConfigManager.getConfig());
    let pluginConfig = {};
    for (let i in configKeys) {
      const key = configKeys[i];
      pluginConfig[`BGB Config ${key}`] = ConfigManager.get(key);
      ConfigManager.onDidChange(key, value => {
        track('Changed config', {
          Config: key,
          'Old Value': value.oldValue,
          'New Value': value.newValue,
        });
      });
    }
    client.identify({
      userId: userHash,
      traits: {
        name: `Plugin User ${randomString}`,
        ...pluginConfig,
      },
    });
  }
}

export function track(name, data = {}) {
  if (client && ConfigManager.get('sendUsageStatistics')) {
    client.track({
      event: `BGB ${name}`,
      userId: userHash,
      properties: data,
    });
  }
}
