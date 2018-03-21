'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import os from 'os';
import uuid from 'uuid-v4';
import * as https from 'https';
import * as childProcess from 'child_process';
class StepsizeHelper {
    static rangesToSelectedLineNumbers(ranges) {
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
    static fetchIntegrationData(repoMetadata, commitHashes) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const req = https.request({
                    hostname: 'production-layer.stepsize.com',
                    path: '/augment-code-search-results',
                    method: 'POST',
                    headers: {
                        'User-Agent': 'Better-Git-Blame-Atom',
                        'Content-Type': 'application/json',
                        'Content-Length': new Buffer(JSON.stringify(payload)).byteLength,
                    },
                }, function (response) {
                    let code = response.statusCode;
                    response.on('data', function (chunk) {
                        responseData += chunk;
                    });
                    response.on('end', function () {
                        if (code < 400) {
                            resolve(JSON.parse(responseData));
                        }
                        else {
                            reject(responseData);
                        }
                    });
                });
                req.on('error', function (error) {
                    reject({ function: 'fetchIntegrationData', message: error.message });
                });
                req.write(JSON.stringify(payload));
                req.end();
            });
        });
    }
    static checkLayerInstallation() {
        return new Promise((resolve, reject) => {
            if (os.platform() !== 'darwin')
                reject();
            const appSupport = `${process.env.HOME}/Library/Application Support`;
            childProcess.exec("ls | grep 'Layer'", { cwd: appSupport }, err => {
                if (err) {
                    return reject(new Error('Could not detect Layer installation'));
                }
                resolve();
            });
        });
    }
    static checkLayerRunning() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RlcHNpemVIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc3RlcHNpemUvU3RlcHNpemVIZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7QUFFWixPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEIsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBQzNCLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sS0FBSyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBRzlDO0lBQ1MsTUFBTSxDQUFDLDJCQUEyQixDQUFDLE1BQXFCO1FBQzdELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLENBQUMsTUFBTTtpQkFDVixHQUFHLENBQUMsS0FBSztnQkFDUixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztnQkFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ2pCLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRztnQkFDZixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFTSxNQUFNLENBQU8sb0JBQW9CLENBQUMsWUFBWSxFQUFFLFlBQVk7O1lBQ2pFLE1B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QUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRztnQkFDaEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDUixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFDRCxPQUFPLEVBQUUsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFFRCxlQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHV1aWQgZnJvbSAndXVpZC12NCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBjaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgSVJhbmdlID0gVGV4dEJ1ZmZlci5JUmFuZ2U7XG5cbmNsYXNzIFN0ZXBzaXplSGVscGVyIHtcbiAgcHVibGljIHN0YXRpYyByYW5nZXNUb1NlbGVjdGVkTGluZU51bWJlcnMocmFuZ2VzOiBBcnJheTxJUmFuZ2U+KSB7XG4gICAgaWYgKHJhbmdlcykge1xuICAgICAgcmV0dXJuIHJhbmdlc1xuICAgICAgICAubWFwKHJhbmdlID0+IHtcbiAgICAgICAgICBsZXQgbnVtYmVycyA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSByYW5nZS5zdGFydC5yb3c7IGkgPCByYW5nZS5lbmQucm93OyBpID0gaSArIDEpIHtcbiAgICAgICAgICAgIG51bWJlcnMucHVzaChpICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudW1iZXJzO1xuICAgICAgICB9KVxuICAgICAgICAucmVkdWNlKChhY2MsIHZhbCkgPT4ge1xuICAgICAgICAgIHJldHVybiBhY2MuY29uY2F0KHZhbCk7XG4gICAgICAgIH0sIFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhc3luYyBmZXRjaEludGVncmF0aW9uRGF0YShyZXBvTWV0YWRhdGEsIGNvbW1pdEhhc2hlcyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIHNlYXJjaElkOiB1dWlkKCksXG4gICAgICByZXBvTmFtZTogcmVwb01ldGFkYXRhLnJlcG9OYW1lLFxuICAgICAgcmVwb093bmVyOiByZXBvTWV0YWRhdGEucmVwb093bmVyLFxuICAgICAgcmVwb1NvdXJjZTogcmVwb01ldGFkYXRhLnJlcG9Tb3VyY2UsXG4gICAgICByZXBvU291cmNlQmFzZVVybDogcmVwb01ldGFkYXRhLnJlcG9Tb3VyY2VCYXNlVXJsLFxuICAgICAgY29tbWl0SGFzaGVzLFxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXNwb25zZURhdGEgPSAnJztcbiAgICAgIGNvbnN0IHJlcSA9IGh0dHBzLnJlcXVlc3QoXG4gICAgICAgIHtcbiAgICAgICAgICBob3N0bmFtZTogJ3Byb2R1Y3Rpb24tbGF5ZXIuc3RlcHNpemUuY29tJyxcbiAgICAgICAgICBwYXRoOiAnL2F1Z21lbnQtY29kZS1zZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1VzZXItQWdlbnQnOiAnQmV0dGVyLUdpdC1CbGFtZS1BdG9tJyxcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKS5ieXRlTGVuZ3RoLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgbGV0IGNvZGUgPSByZXNwb25zZS5zdGF0dXNDb2RlO1xuICAgICAgICAgIHJlc3BvbnNlLm9uKCdkYXRhJywgZnVuY3Rpb24oY2h1bmspIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRGF0YSArPSBjaHVuaztcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXNwb25zZS5vbignZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY29kZSA8IDQwMCkge1xuICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzcG9uc2VEYXRhKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZWplY3QocmVzcG9uc2VEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHJlcS5vbignZXJyb3InLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICByZWplY3QoeyBmdW5jdGlvbjogJ2ZldGNoSW50ZWdyYXRpb25EYXRhJywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgIH0pO1xuICAgICAgcmVxLndyaXRlKEpTT04uc3RyaW5naWZ5KHBheWxvYWQpKTtcbiAgICAgIHJlcS5lbmQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY2hlY2tMYXllckluc3RhbGxhdGlvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKG9zLnBsYXRmb3JtKCkgIT09ICdkYXJ3aW4nKSByZWplY3QoKTtcbiAgICAgIGNvbnN0IGFwcFN1cHBvcnQgPSBgJHtwcm9jZXNzLmVudi5IT01FfS9MaWJyYXJ5L0FwcGxpY2F0aW9uIFN1cHBvcnRgO1xuICAgICAgY2hpbGRQcm9jZXNzLmV4ZWMoXCJscyB8IGdyZXAgJ0xheWVyJ1wiLCB7IGN3ZDogYXBwU3VwcG9ydCB9LCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZXRlY3QgTGF5ZXIgaW5zdGFsbGF0aW9uJykpO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjaGVja0xheWVyUnVubmluZygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hpbGRQcm9jZXNzLmV4ZWMoJ3BncmVwIExheWVyJywgeyBjd2Q6ICcvJyB9LCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXCJObyBwcm9jZXNzIHdpdGggbmFtZSAnTGF5ZXInIGlzIHJ1bm5pbmdcIikpO1xuICAgICAgICB9XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0ZXBzaXplSGVscGVyO1xuIl19