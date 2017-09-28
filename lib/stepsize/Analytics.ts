'use babel';

import email from '../git/email';
import crypto from 'crypto';
import os from 'os';
import * as https from 'https';
import * as ConfigManager from '../ConfigManager';
import { version } from '../../package.json';

let userHash: string;

const writeKey = '3hotv1JuhWEvL5H0SSUpJzVHgcRlurnB';
const authHeader = `Basic ${new Buffer(`${writeKey}:`).toString('base64')}`;

async function segmentRequest(path, body): Promise<any> {
  let payload = body;
  payload.timestamp = new Date().toISOString();
  payload.context = {
    app: {
      name: 'Atom Better Git Blame',
      version: version
    },
    os: {
      name: os.type(),
      version: os.release()
    }
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

async function getUserHash() : Promise<string> {
  let savedHash = localStorage.getItem('better-git-blame-analytics-hash');
  if (savedHash) {
    return savedHash
  }
  let userEmail;
  try {
    userEmail = await email();
  } catch(e){
    console.error(e);
    userEmail = crypto.randomBytes(28);
  }
  if (!userEmail) throw new Error('Could not fetch email');
  const hash = crypto.createHash('sha256');
  hash.update(userEmail);
  const hashedEmail = hash.digest('hex');
  localStorage.setItem('better-git-blame-analytics-hash', hashedEmail);
  return hashedEmail;
}

export async function init() : Promise<void> {
  if (ConfigManager.get('sendUsageStatistics')) {
    userHash = await getUserHash();
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
        'User Hash': userHash,
        name: `Plugin User ${randomString}`,
        ...pluginConfig,
      },
    });
  }
}

export function track(name, data = {}) : void {
  if (ConfigManager.get('sendUsageStatistics') && userHash) {
    segmentRequest('/track', {
      event: `BGB ${name}`,
      userId: userHash,
      properties: data,
    });
  }
}
