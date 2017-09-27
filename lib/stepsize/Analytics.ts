'use babel';

import email from '../git/email';
import crypto from 'crypto';
import * as ConfigManager from '../ConfigManager';
import * as https from 'https';

let userHash: string;

const writeKey = '3hotv1JuhWEvL5H0SSUpJzVHgcRlurnB';
const authHeader = `Basic ${new Buffer(`${writeKey}:`).toString('base64')}`;

async function segmentRequest(path, body): Promise<any> {
  let payload = body;
  payload.context = {
    app: {
      name: 'Atom Better Git Blame',
    },
  };
  return new Promise((resolve, reject) => {
    let responseData = '';
    const req = https.request(
      {
        hostname: 'api.segment.io',
        path: `/v1${path}`,
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
      function(response) {
        let code = response.statusCode;
        response.on('data', function(chunk) {
          responseData += chunk;
        });
        response.on('end', function() {
          if (code < 400) {
            resolve(JSON.parse(responseData));
          } else {
            reject(responseData);
          }
        });
      }
    );
    req.on('error', function(error) {
      reject(error.message);
    });
    req.write(JSON.stringify(payload));
    req.end();
  });
}

export async function init() {
  if (ConfigManager.get('sendUsageStatistics')) {
    let userEmail;
    try {
      userEmail = await email();
    } catch (e) {
      console.error(e);
    }
    if (!userEmail) return;
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
    await segmentRequest('/identify', {
      userId: userHash,
      traits: {
        name: `Plugin User ${randomString}`,
        ...pluginConfig,
      },
    });
  }
}

export function track(name, data = {}) {
  if (ConfigManager.get('sendUsageStatistics') && userHash) {
    segmentRequest('/track', {
      event: `BGB ${name}`,
      userId: userHash,
      properties: data,
    });
  }
}
