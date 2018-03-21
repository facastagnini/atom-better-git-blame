'use babel';
import shell from 'shell';
import * as Analytics from '../stepsize/Analytics';
const initialNotifData = {
    gutters: 0,
    tooltips: 0,
    wasIntegrationDataRetrieved: false,
    wasNotificationShown: false,
};
function getIntegrationNotificationData() {
    const storedNotifData = localStorage.getItem('better-git-blame-integration-notification-data');
    return storedNotifData ? JSON.parse(storedNotifData) : initialNotifData;
}
function saveIntegrationNotificationData(notifData) {
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
    if (notifData.wasNotificationShown || notifData.wasIntegrationDataRetrieved)
        return;
    if (notifData.gutters >= 5 && notifData.tooltips >= 5) {
        Analytics.track('Integration notification shown');
        showIntegrationNotification();
        notifData.wasNotificationShown = true;
        saveIntegrationNotificationData(notifData);
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
                    Analytics.track('Integration notification button clicked', { type: 'github' });
                    shell.openExternal('https://github.com/apps/layer');
                },
            },
            {
                text: 'GitLab integration',
                onDidClick: () => {
                    Analytics.track('Integration notification button clicked', { type: 'gitlab' });
                    shell.openExternal('https://stepsize.com/gitlab/setup');
                },
            },
            {
                text: 'Jira integration',
                onDidClick: () => {
                    Analytics.track('Integration notification button clicked', { type: 'jira' });
                    shell.openExternal('https://github.com/Stepsize/atom-better-git-blame#setup-the-jira-integration');
                },
            },
            {
                text: 'Tell me more',
                onDidClick: () => {
                    Analytics.track('Integration notification button clicked', { type: 'more' });
                    shell.openExternal('https://github.com/Stepsize/atom-better-git-blame#how-do-i-get-setup');
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
export function checkIntegrationDataRetrieved(pullRequests, issues) {
    const prCount = Array.isArray(pullRequests) ? Object.keys(pullRequests).length : 0;
    const issueCount = Array.isArray(issues) ? Object.keys(issues).length : 0;
    if (prCount > 0 || issueCount > 0) {
        const notifData = getIntegrationNotificationData();
        notifData.wasIntegrationDataRetrieved = true;
        saveIntegrationNotificationData(notifData);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdyYXRpb25Ob3RpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvaW50ZXJmYWNlL0ludGVncmF0aW9uTm90aWZpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUVaLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEtBQUssU0FBUyxNQUFNLHVCQUF1QixDQUFDO0FBU25ELE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsT0FBTyxFQUFFLENBQUM7SUFDVixRQUFRLEVBQUUsQ0FBQztJQUNYLDJCQUEyQixFQUFFLEtBQUs7SUFDbEMsb0JBQW9CLEVBQUUsS0FBSztDQUM1QixDQUFDO0FBRUY7SUFDRSxNQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDL0YsTUFBTSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDO0FBQzFFLENBQUM7QUFFRCx5Q0FBeUMsU0FBdUM7SUFDOUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxnREFBZ0QsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDcEcsQ0FBQztBQUVELE1BQU07SUFDSixnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLHdDQUF3QyxFQUFFLENBQUM7QUFDN0MsQ0FBQztBQUVEO0lBQ0UsTUFBTSxTQUFTLEdBQUcsOEJBQThCLEVBQUUsQ0FBQztJQUNuRCxTQUFTLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztJQUN2QiwrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQ7SUFDRSxNQUFNLFNBQVMsR0FBRyw4QkFBOEIsRUFBRSxDQUFDO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsSUFBSSxTQUFTLENBQUMsMkJBQTJCLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDcEYsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUNsRCwyQkFBMkIsRUFBRSxDQUFDO1FBQzlCLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDdEMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0MsQ0FBQztBQUNILENBQUM7QUFFRDtJQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO1FBQzVDLFdBQVcsRUFDVCxxTUFBcU07UUFDdk0sV0FBVyxFQUFFLElBQUk7UUFDakIsT0FBTyxFQUFFO1lBQ1A7Z0JBQ0UsSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsVUFBVSxFQUFFO29CQUNWLFNBQVMsQ0FBQyxLQUFLLENBQUMseUNBQXlDLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDL0UsS0FBSyxDQUFDLFlBQVksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixVQUFVLEVBQUU7b0JBQ1YsU0FBUyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUMvRSxLQUFLLENBQUMsWUFBWSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Z0JBQzFELENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLFVBQVUsRUFBRTtvQkFDVixTQUFTLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQzdFLEtBQUssQ0FBQyxZQUFZLENBQ2hCLDhFQUE4RSxDQUMvRSxDQUFDO2dCQUNKLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxjQUFjO2dCQUNwQixVQUFVLEVBQUU7b0JBQ1YsU0FBUyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUM3RSxLQUFLLENBQUMsWUFBWSxDQUNoQixzRUFBc0UsQ0FDdkUsQ0FBQztnQkFDSixDQUFDO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxNQUFNO0lBQ0osTUFBTSxTQUFTLEdBQUcsOEJBQThCLEVBQUUsQ0FBQztJQUNuRCxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQztJQUN4QiwrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQsTUFBTSx3Q0FBd0MsWUFBd0IsRUFBRSxNQUFrQjtJQUN4RixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNuRixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUMxRSxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLDhCQUE4QixFQUFFLENBQUM7UUFDbkQsU0FBUyxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQztRQUM3QywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3QyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuaW1wb3J0ICogYXMgQW5hbHl0aWNzIGZyb20gJy4uL3N0ZXBzaXplL0FuYWx5dGljcyc7XG5cbmludGVyZmFjZSBJSW50ZWdyYXRpb25Ob3RpZmljYXRpb25EYXRhIHtcbiAgZ3V0dGVyczogbnVtYmVyO1xuICB0b29sdGlwczogbnVtYmVyO1xuICB3YXNJbnRlZ3JhdGlvbkRhdGFSZXRyaWV2ZWQ6IGJvb2xlYW47XG4gIHdhc05vdGlmaWNhdGlvblNob3duOiBib29sZWFuO1xufVxuXG5jb25zdCBpbml0aWFsTm90aWZEYXRhID0ge1xuICBndXR0ZXJzOiAwLFxuICB0b29sdGlwczogMCxcbiAgd2FzSW50ZWdyYXRpb25EYXRhUmV0cmlldmVkOiBmYWxzZSxcbiAgd2FzTm90aWZpY2F0aW9uU2hvd246IGZhbHNlLFxufTtcblxuZnVuY3Rpb24gZ2V0SW50ZWdyYXRpb25Ob3RpZmljYXRpb25EYXRhKCk6IElJbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbkRhdGEge1xuICBjb25zdCBzdG9yZWROb3RpZkRhdGEgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYmV0dGVyLWdpdC1ibGFtZS1pbnRlZ3JhdGlvbi1ub3RpZmljYXRpb24tZGF0YScpO1xuICByZXR1cm4gc3RvcmVkTm90aWZEYXRhID8gSlNPTi5wYXJzZShzdG9yZWROb3RpZkRhdGEpIDogaW5pdGlhbE5vdGlmRGF0YTtcbn1cblxuZnVuY3Rpb24gc2F2ZUludGVncmF0aW9uTm90aWZpY2F0aW9uRGF0YShub3RpZkRhdGE6IElJbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbkRhdGEpIHtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2JldHRlci1naXQtYmxhbWUtaW50ZWdyYXRpb24tbm90aWZpY2F0aW9uLWRhdGEnLCBKU09OLnN0cmluZ2lmeShub3RpZkRhdGEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUd1dHRlclNob3duKCkge1xuICB0cmFja0d1dHRlclNob3duKCk7XG4gIHNob3dJbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbklmQXBwcm9wcmlhdGUoKTtcbn1cblxuZnVuY3Rpb24gdHJhY2tHdXR0ZXJTaG93bigpIHtcbiAgY29uc3Qgbm90aWZEYXRhID0gZ2V0SW50ZWdyYXRpb25Ob3RpZmljYXRpb25EYXRhKCk7XG4gIG5vdGlmRGF0YS5ndXR0ZXJzICs9IDE7XG4gIHNhdmVJbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbkRhdGEobm90aWZEYXRhKTtcbn1cblxuZnVuY3Rpb24gc2hvd0ludGVncmF0aW9uTm90aWZpY2F0aW9uSWZBcHByb3ByaWF0ZSgpIHtcbiAgY29uc3Qgbm90aWZEYXRhID0gZ2V0SW50ZWdyYXRpb25Ob3RpZmljYXRpb25EYXRhKCk7XG4gIGlmIChub3RpZkRhdGEud2FzTm90aWZpY2F0aW9uU2hvd24gfHwgbm90aWZEYXRhLndhc0ludGVncmF0aW9uRGF0YVJldHJpZXZlZCkgcmV0dXJuO1xuICBpZiAobm90aWZEYXRhLmd1dHRlcnMgPj0gNSAmJiBub3RpZkRhdGEudG9vbHRpcHMgPj0gNSkge1xuICAgIEFuYWx5dGljcy50cmFjaygnSW50ZWdyYXRpb24gbm90aWZpY2F0aW9uIHNob3duJyk7XG4gICAgc2hvd0ludGVncmF0aW9uTm90aWZpY2F0aW9uKCk7XG4gICAgbm90aWZEYXRhLndhc05vdGlmaWNhdGlvblNob3duID0gdHJ1ZTtcbiAgICBzYXZlSW50ZWdyYXRpb25Ob3RpZmljYXRpb25EYXRhKG5vdGlmRGF0YSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvd0ludGVncmF0aW9uTm90aWZpY2F0aW9uKCkge1xuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnQm9zcyBtb2RlIGJsYW1lJywge1xuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1dhbnQgdG8gc2VlIHB1bGwgcmVxdWVzdHMgYW5kIGlzc3VlcyBpbiBgYmV0dGVyLWdpdC1ibGFtZWAgcG9wb3ZlcnM/XFxuXFxuPGltZyBzcmM9XCJodHRwczovL2kuaW1ndXIuY29tL3ZVVHZ4SHYucG5nXCIgd2lkdGg9XCI0MDBcIiBoZWlnaHQ9XCIxNzJcIiAvPlxcblxcbkp1c3Qgc2V0dXAgb25lIG9mIG91ciBpbnRlZ3JhdGlvbnMgdG8gbGV2ZWwgdXAg7aC97bSlJyxcbiAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICBidXR0b25zOiBbXG4gICAgICB7XG4gICAgICAgIHRleHQ6ICdHaXRIdWIgaW50ZWdyYXRpb24nLFxuICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgQW5hbHl0aWNzLnRyYWNrKCdJbnRlZ3JhdGlvbiBub3RpZmljYXRpb24gYnV0dG9uIGNsaWNrZWQnLCB7IHR5cGU6ICdnaXRodWInIH0pO1xuICAgICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbCgnaHR0cHM6Ly9naXRodWIuY29tL2FwcHMvbGF5ZXInKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6ICdHaXRMYWIgaW50ZWdyYXRpb24nLFxuICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgQW5hbHl0aWNzLnRyYWNrKCdJbnRlZ3JhdGlvbiBub3RpZmljYXRpb24gYnV0dG9uIGNsaWNrZWQnLCB7IHR5cGU6ICdnaXRsYWInIH0pO1xuICAgICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbCgnaHR0cHM6Ly9zdGVwc2l6ZS5jb20vZ2l0bGFiL3NldHVwJyk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiAnSmlyYSBpbnRlZ3JhdGlvbicsXG4gICAgICAgIG9uRGlkQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICBBbmFseXRpY3MudHJhY2soJ0ludGVncmF0aW9uIG5vdGlmaWNhdGlvbiBidXR0b24gY2xpY2tlZCcsIHsgdHlwZTogJ2ppcmEnIH0pO1xuICAgICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbChcbiAgICAgICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vU3RlcHNpemUvYXRvbS1iZXR0ZXItZ2l0LWJsYW1lI3NldHVwLXRoZS1qaXJhLWludGVncmF0aW9uJ1xuICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiAnVGVsbCBtZSBtb3JlJyxcbiAgICAgICAgb25EaWRDbGljazogKCkgPT4ge1xuICAgICAgICAgIEFuYWx5dGljcy50cmFjaygnSW50ZWdyYXRpb24gbm90aWZpY2F0aW9uIGJ1dHRvbiBjbGlja2VkJywgeyB0eXBlOiAnbW9yZScgfSk7XG4gICAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKFxuICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9TdGVwc2l6ZS9hdG9tLWJldHRlci1naXQtYmxhbWUjaG93LWRvLWktZ2V0LXNldHVwJ1xuICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhY2tUb29sdGlwU2hvd24oKSB7XG4gIGNvbnN0IG5vdGlmRGF0YSA9IGdldEludGVncmF0aW9uTm90aWZpY2F0aW9uRGF0YSgpO1xuICBub3RpZkRhdGEudG9vbHRpcHMgKz0gMTtcbiAgc2F2ZUludGVncmF0aW9uTm90aWZpY2F0aW9uRGF0YShub3RpZkRhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJbnRlZ3JhdGlvbkRhdGFSZXRyaWV2ZWQocHVsbFJlcXVlc3RzOiBBcnJheTxhbnk+LCBpc3N1ZXM6IEFycmF5PGFueT4pIHtcbiAgY29uc3QgcHJDb3VudCA9IEFycmF5LmlzQXJyYXkocHVsbFJlcXVlc3RzKSA/IE9iamVjdC5rZXlzKHB1bGxSZXF1ZXN0cykubGVuZ3RoIDogMDtcbiAgY29uc3QgaXNzdWVDb3VudCA9IEFycmF5LmlzQXJyYXkoaXNzdWVzKSA/IE9iamVjdC5rZXlzKGlzc3VlcykubGVuZ3RoIDogMDtcbiAgaWYgKHByQ291bnQgPiAwIHx8IGlzc3VlQ291bnQgPiAwKSB7XG4gICAgY29uc3Qgbm90aWZEYXRhID0gZ2V0SW50ZWdyYXRpb25Ob3RpZmljYXRpb25EYXRhKCk7XG4gICAgbm90aWZEYXRhLndhc0ludGVncmF0aW9uRGF0YVJldHJpZXZlZCA9IHRydWU7XG4gICAgc2F2ZUludGVncmF0aW9uTm90aWZpY2F0aW9uRGF0YShub3RpZkRhdGEpO1xuICB9XG59XG4iXX0=