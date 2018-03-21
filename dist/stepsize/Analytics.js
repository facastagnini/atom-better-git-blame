'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import email from '../git/email';
import crypto from 'crypto';
import os from 'os';
import * as https from 'https';
import * as ConfigManager from '../ConfigManager';
import { version } from '../../package.json';
export let userHash;
const writeKey = '3hotv1JuhWEvL5H0SSUpJzVHgcRlurnB';
const authHeader = `Basic ${new Buffer(`${writeKey}:`).toString('base64')}`;
let analyticsFailing = false;
function segmentRequest(path, body) {
    return __awaiter(this, void 0, void 0, function* () {
        let payload = body;
        payload.timestamp = new Date().toISOString();
        payload.context = {
            app: {
                name: 'Atom Better Git Blame',
                version: version,
            },
            os: {
                name: os.type(),
                version: os.release(),
            },
        };
        const requestData = {
            hostname: 'api.segment.io',
            path: `/v1${path}`,
            method: 'POST',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
        };
        return new Promise((resolve, reject) => {
            let responseData = '';
            const req = https.request(requestData, function (response) {
                let code = response.statusCode;
                response.on('data', function (chunk) {
                    responseData += chunk;
                });
                response.on('end', function () {
                    if (code < 400) {
                        resolve(JSON.parse(responseData));
                    }
                    else {
                        reject({ payload, requestData, responseData: JSON.parse(responseData) });
                    }
                });
            });
            req.on('error', function (error) {
                reject({ payload, requestData, errorMessage: error.message });
            });
            req.write(JSON.stringify(payload));
            req.end();
        });
    });
}
function getUserHash() {
    return __awaiter(this, void 0, void 0, function* () {
        let savedHash = localStorage.getItem('better-git-blame-analytics-hash');
        if (savedHash) {
            return savedHash;
        }
        let userEmail;
        try {
            userEmail = yield email();
        }
        catch (e) {
            console.info(e);
        }
        if (!userEmail) {
            try {
                userEmail = crypto.randomBytes(28);
            }
            catch (e) {
                console.error(e);
            }
        }
        if (!userEmail)
            throw new Error('Failed to fetch email or create fallback');
        const hash = crypto.createHash('sha256');
        hash.update(userEmail);
        const hashedEmail = hash.digest('hex');
        localStorage.setItem('better-git-blame-analytics-hash', hashedEmail);
        return hashedEmail;
    });
}
export function init() {
    return __awaiter(this, void 0, void 0, function* () {
        if (ConfigManager.get('sendUsageStatistics')) {
            userHash = yield getUserHash();
            if (userHash) {
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
                try {
                    yield segmentRequest('/identify', {
                        userId: userHash,
                        traits: Object.assign({ 'User Hash': userHash, name: `Plugin User ${randomString}` }, pluginConfig),
                    });
                }
                catch (e) {
                    console.info(e);
                    analyticsFailing = true;
                }
                ;
            }
        }
    });
}
export function track(name, data = {}) {
    if (ConfigManager.get('sendUsageStatistics') && userHash && !analyticsFailing) {
        segmentRequest('/track', {
            event: `BGB ${name}`,
            userId: userHash,
            properties: data,
        }).catch((e) => {
            console.info(e);
            analyticsFailing = true;
        });
    }
}
export function anonymiseRepoMetadata(metadata) {
    const anonymiseField = (field) => {
        const hash = crypto.createHash('sha256');
        hash.update(field);
        return hash.digest('hex');
    };
    return {
        repoNameHash: anonymiseField(metadata.repoName),
        repoOwnerHash: anonymiseField(metadata.repoOwner),
        repoSourceHash: anonymiseField(metadata.repoSource),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3N0ZXBzaXplL0FuYWx5dGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQUVaLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3BCLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sS0FBSyxhQUFhLE1BQU0sa0JBQWtCLENBQUM7QUFDbEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTdDLE1BQU0sQ0FBQyxJQUFJLFFBQWdCLENBQUM7QUFFNUIsTUFBTSxRQUFRLEdBQVcsa0NBQWtDLENBQUM7QUFDNUQsTUFBTSxVQUFVLEdBQVcsU0FBUyxJQUFJLE1BQU0sQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7QUFDcEYsSUFBSSxnQkFBZ0IsR0FBWSxLQUFLLENBQUM7QUFFdEMsd0JBQThCLElBQUksRUFBRSxJQUFJOztRQUN0QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxPQUFPLEdBQUc7WUFDaEIsR0FBRyxFQUFFO2dCQUNILElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLE9BQU8sRUFBRSxPQUFPO2FBQ2pCO1lBQ0QsRUFBRSxFQUFFO2dCQUNGLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFO2dCQUNmLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFO2FBQ3RCO1NBQ0YsQ0FBQztRQUNGLE1BQU0sV0FBVyxHQUFHO1lBQ2xCLFFBQVEsRUFBRSxn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LFFBQVEsQ0FBQztRQUMvQyxhQUFhLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDakQsY0FBYyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO0tBQ3BELENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBlbWFpbCBmcm9tICcuLi9naXQvZW1haWwnO1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCAqIGFzIGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCAqIGFzIENvbmZpZ01hbmFnZXIgZnJvbSAnLi4vQ29uZmlnTWFuYWdlcic7XG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcblxuZXhwb3J0IGxldCB1c2VySGFzaDogc3RyaW5nO1xuXG5jb25zdCB3cml0ZUtleTogc3RyaW5nID0gJzNob3R2MUp1aFdFdkw1SDBTU1VwSnpWSGdjUmx1cm5CJztcbmNvbnN0IGF1dGhIZWFkZXI6IHN0cmluZyA9IGBCYXNpYyAke25ldyBCdWZmZXIoYCR7d3JpdGVLZXl9OmApLnRvU3RyaW5nKCdiYXNlNjQnKX1gO1xubGV0IGFuYWx5dGljc0ZhaWxpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuYXN5bmMgZnVuY3Rpb24gc2VnbWVudFJlcXVlc3QocGF0aCwgYm9keSk6IFByb21pc2U8YW55PiB7XG4gIGxldCBwYXlsb2FkID0gYm9keTtcbiAgcGF5bG9hZC50aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIHBheWxvYWQuY29udGV4dCA9IHtcbiAgICBhcHA6IHtcbiAgICAgIG5hbWU6ICdBdG9tIEJldHRlciBHaXQgQmxhbWUnLFxuICAgICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICB9LFxuICAgIG9zOiB7XG4gICAgICBuYW1lOiBvcy50eXBlKCksXG4gICAgICB2ZXJzaW9uOiBvcy5yZWxlYXNlKCksXG4gICAgfSxcbiAgfTtcbiAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgaG9zdG5hbWU6ICdhcGkuc2VnbWVudC5pbycsXG4gICAgcGF0aDogYC92MSR7cGF0aH1gLFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIEF1dGhvcml6YXRpb246IGF1dGhIZWFkZXIsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0sXG4gIH07XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IHJlc3BvbnNlRGF0YSA9ICcnO1xuICAgIGNvbnN0IHJlcSA9IGh0dHBzLnJlcXVlc3QoXG4gICAgICByZXF1ZXN0RGF0YSxcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGxldCBjb2RlID0gcmVzcG9uc2Uuc3RhdHVzQ29kZTtcbiAgICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbihjaHVuaykge1xuICAgICAgICAgIHJlc3BvbnNlRGF0YSArPSBjaHVuaztcbiAgICAgICAgfSk7XG4gICAgICAgIHJlc3BvbnNlLm9uKCdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoY29kZSA8IDQwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlc3BvbnNlRGF0YSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoeyBwYXlsb2FkLCByZXF1ZXN0RGF0YSwgcmVzcG9uc2VEYXRhOiBKU09OLnBhcnNlKHJlc3BvbnNlRGF0YSkgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJlcS5vbignZXJyb3InLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgcmVqZWN0KHsgcGF5bG9hZCwgcmVxdWVzdERhdGEsIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSB9KTtcbiAgICB9KTtcbiAgICByZXEud3JpdGUoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xuICAgIHJlcS5lbmQoKTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFVzZXJIYXNoKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGxldCBzYXZlZEhhc2ggPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYmV0dGVyLWdpdC1ibGFtZS1hbmFseXRpY3MtaGFzaCcpO1xuICBpZiAoc2F2ZWRIYXNoKSB7XG4gICAgcmV0dXJuIHNhdmVkSGFzaDtcbiAgfVxuICBsZXQgdXNlckVtYWlsO1xuICB0cnkge1xuICAgIHVzZXJFbWFpbCA9IGF3YWl0IGVtYWlsKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmluZm8oZSk7XG4gIH1cbiAgaWYgKCF1c2VyRW1haWwpIHtcbiAgICB0cnkge1xuICAgICAgdXNlckVtYWlsID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDI4KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuICBpZiAoIXVzZXJFbWFpbCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggZW1haWwgb3IgY3JlYXRlIGZhbGxiYWNrJyk7XG4gIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2Jyk7XG4gIGhhc2gudXBkYXRlKHVzZXJFbWFpbCk7XG4gIGNvbnN0IGhhc2hlZEVtYWlsID0gaGFzaC5kaWdlc3QoJ2hleCcpO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYmV0dGVyLWdpdC1ibGFtZS1hbmFseXRpY3MtaGFzaCcsIGhhc2hlZEVtYWlsKTtcbiAgcmV0dXJuIGhhc2hlZEVtYWlsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKENvbmZpZ01hbmFnZXIuZ2V0KCdzZW5kVXNhZ2VTdGF0aXN0aWNzJykpIHtcbiAgICB1c2VySGFzaCA9IGF3YWl0IGdldFVzZXJIYXNoKCk7XG4gICAgaWYgKHVzZXJIYXNoKSB7XG4gICAgICBjb25zdCByYW5kb21TdHJpbmcgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgY29uc3QgY29uZmlnS2V5cyA9IE9iamVjdC5rZXlzKENvbmZpZ01hbmFnZXIuZ2V0Q29uZmlnKCkpO1xuICAgICAgbGV0IHBsdWdpbkNvbmZpZyA9IHt9O1xuICAgICAgZm9yIChsZXQgaSBpbiBjb25maWdLZXlzKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGNvbmZpZ0tleXNbaV07XG4gICAgICAgIHBsdWdpbkNvbmZpZ1tgQkdCIENvbmZpZyAke2tleX1gXSA9IENvbmZpZ01hbmFnZXIuZ2V0KGtleSk7XG4gICAgICAgIENvbmZpZ01hbmFnZXIub25EaWRDaGFuZ2Uoa2V5LCB2YWx1ZSA9PiB7XG4gICAgICAgICAgdHJhY2soJ0NoYW5nZWQgY29uZmlnJywge1xuICAgICAgICAgICAgQ29uZmlnOiBrZXksXG4gICAgICAgICAgICAnT2xkIFZhbHVlJzogdmFsdWUub2xkVmFsdWUsXG4gICAgICAgICAgICAnTmV3IFZhbHVlJzogdmFsdWUubmV3VmFsdWUsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2VnbWVudFJlcXVlc3QoJy9pZGVudGlmeScsIHtcbiAgICAgICAgICB1c2VySWQ6IHVzZXJIYXNoLFxuICAgICAgICAgIHRyYWl0czoge1xuICAgICAgICAgICAgJ1VzZXIgSGFzaCc6IHVzZXJIYXNoLFxuICAgICAgICAgICAgbmFtZTogYFBsdWdpbiBVc2VyICR7cmFuZG9tU3RyaW5nfWAsXG4gICAgICAgICAgICAuLi5wbHVnaW5Db25maWcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhlKTtcbiAgICAgICAgYW5hbHl0aWNzRmFpbGluZyA9IHRydWU7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2sobmFtZSwgZGF0YSA9IHt9KTogdm9pZCB7XG4gIGlmIChDb25maWdNYW5hZ2VyLmdldCgnc2VuZFVzYWdlU3RhdGlzdGljcycpICYmIHVzZXJIYXNoICYmICFhbmFseXRpY3NGYWlsaW5nKSB7XG4gICAgc2VnbWVudFJlcXVlc3QoJy90cmFjaycsIHtcbiAgICAgIGV2ZW50OiBgQkdCICR7bmFtZX1gLFxuICAgICAgdXNlcklkOiB1c2VySGFzaCxcbiAgICAgIHByb3BlcnRpZXM6IGRhdGEsXG4gICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgIGNvbnNvbGUuaW5mbyhlKTtcbiAgICAgIGFuYWx5dGljc0ZhaWxpbmcgPSB0cnVlO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUFub255bW91c1JlcG9NZXRhZGF0YSB7XG4gIHJlcG9OYW1lSGFzaDogc3RyaW5nO1xuICByZXBvT3duZXJIYXNoOiBzdHJpbmc7XG4gIHJlcG9Tb3VyY2VIYXNoOiBzdHJpbmc7XG59XG5leHBvcnQgZnVuY3Rpb24gYW5vbnltaXNlUmVwb01ldGFkYXRhKG1ldGFkYXRhOiB7IFtwcm9wOiBzdHJpbmddOiBzdHJpbmcgfSk6IElBbm9ueW1vdXNSZXBvTWV0YWRhdGEge1xuICBjb25zdCBhbm9ueW1pc2VGaWVsZCA9IChmaWVsZDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goJ3NoYTI1NicpO1xuICAgIGhhc2gudXBkYXRlKGZpZWxkKTtcbiAgICByZXR1cm4gaGFzaC5kaWdlc3QoJ2hleCcpO1xuICB9O1xuICByZXR1cm4ge1xuICAgIHJlcG9OYW1lSGFzaDogYW5vbnltaXNlRmllbGQobWV0YWRhdGEucmVwb05hbWUpLFxuICAgIHJlcG9Pd25lckhhc2g6IGFub255bWlzZUZpZWxkKG1ldGFkYXRhLnJlcG9Pd25lciksXG4gICAgcmVwb1NvdXJjZUhhc2g6IGFub255bWlzZUZpZWxkKG1ldGFkYXRhLnJlcG9Tb3VyY2UpLFxuICB9O1xufVxuIl19