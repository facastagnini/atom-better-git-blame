'use babel';

import os from 'os';
import uuid from 'uuid-v4';
import * as https from 'https';
import * as childProcess from 'child_process';
import IRange = TextBuffer.IRange;

class StepsizeHelper {
  public static rangesToSelectedLineNumbers(ranges: Array<IRange>) {
    if (ranges) {
      return ranges
        .map(range => {
          let numbers = [];
          for (let i = range.start.row; i < range.end.row; i = i + 1) {
            numbers.push(i + 1);
          }
          return numbers;
        })
        .reduce((acc, val) => {
          return acc.concat(val);
        }, []);
    }
    return [];
  }

  public static async fetchIntegrationData(repoMetadata, commitHashes): Promise<any> {
    const payload = {
      searchId: uuid(),
      repoName: repoMetadata.repoName,
      repoOwner: repoMetadata.repoOwner,
      repoSource: repoMetadata.repoSource,
      repoSourceBaseUrl: repoMetadata.repoSourceBaseUrl,
      commitHashes,
    };
    return new Promise((resolve, reject) => {
      let responseData = '';
      const req = https.request(
        {
          hostname: 'production-layer.stepsize.com',
          path: '/augment-code-search-results',
          method: 'POST',
          headers: {
            'User-Agent': 'Better-Git-Blame-Atom',
            'Content-Type': 'application/json',
            'Content-Length': new Buffer(JSON.stringify(payload)).byteLength,
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
        reject({ function: 'fetchIntegrationData', message: error.message });
      });
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  public static checkLayerInstallation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (os.platform() !== 'darwin') reject();
      const appSupport = `${process.env.HOME}/Library/Application Support`;
      childProcess.exec("ls | grep 'Layer'", { cwd: appSupport }, err => {
        if (err) {
          return reject(new Error('Could not detect Layer installation'));
        }
        resolve();
      });
    });
  }

  public static checkLayerRunning(): Promise<void> {
    return new Promise((resolve, reject) => {
      childProcess.exec('pgrep Layer', { cwd: '/' }, err => {
        if (err) {
          return reject(new Error("No process with name 'Layer' is running"));
        }
        resolve();
      });
    });
  }
}

export default StepsizeHelper;
