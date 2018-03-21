'use babel';
import { name } from '../package.json';
const packageName = name;
export const config = {
    defaultWidth: {
        title: 'Gutter width (px)',
        type: 'integer',
        default: 210,
        order: 1,
    },
    gutterDateFormat: {
        title: 'Gutter date format',
        description: 'Moment.js compatible [date format string](https://momentjs.com/docs/#/displaying/format/)',
        type: 'string',
        default: 'YYYY-MM-DD',
        order: 2,
    },
    colorScale: {
        title: 'Gutter color scale',
        description: 'Preset scales for coloring commits based on age (requires editor reload)',
        type: 'string',
        default: 'RoyalPomegranate',
        enum: [
            'RoyalPomegranate',
            'ChocolateMint',
            'VioletApple',
            'AffairGoblin',
            'GoldDaisy',
            'PoppyLochmara',
            'PersianSteel',
        ],
        order: 3,
    },
    displayAgeSection: {
        title: 'Display code age in popover',
        description: 'When viewing the blame popover, display the section visualising the age of the code',
        type: 'boolean',
        default: true,
        order: 4,
    },
    truncateGutterNames: {
        title: 'Truncate author names in gutter',
        description: 'Attempt to truncate commit author names to display first initial and surname only',
        type: 'boolean',
        default: true,
        order: 5,
    },
    highlightPullRequestOnHover: {
        title: 'Highlight pull request on hover',
        description: 'When viewing the blame popover, highlight lines introduced by commits from the same pull request',
        type: 'boolean',
        default: true,
        order: 6,
    },
    displayHighlightLabels: {
        title: 'Display highlight labels',
        description: 'When viewing the blame popover, show commit hashes and pull requests numbers in the top right of highlighted sections',
        type: 'boolean',
        default: true,
        order: 7,
    },
    sendUsageStatistics: {
        title: 'Send anonymous usage statistics',
        description: 'Send anonymous usage data to Stepsize so we can improve the plugin',
        type: 'boolean',
        default: true,
        order: 8,
    },
    parallelGitProcessing: {
        title: 'Use parallel processing for Git commands',
        description: 'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
        type: 'boolean',
        default: true,
        order: 9,
    },
    searchInLayerEnabled: {
        title: 'Enable Search in Layer (macOS only)',
        description: 'Send code selection events via UDP to the Layer desktop app to use its search functionality',
        type: 'boolean',
        default: true,
        order: 10,
    },
};
export function getConfig() {
    return config;
}
export function get(key) {
    return atom.config.get(`${packageName}.${key}`);
}
export function set(key, value) {
    return atom.config.set(`${packageName}.${key}`, value);
}
export function observe(key, ...args) {
    return atom.config.observe(`${packageName}.${key}`, ...args);
}
export function onDidChange(key, ...args) {
    return atom.config.onDidChange(`${packageName}.${key}`, ...args);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9Db25maWdNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUVaLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFFekIsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHO0lBQ3BCLFlBQVksRUFBRTtRQUNaLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsR0FBRztRQUNaLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLFdBQVcsRUFDVCwyRkFBMkY7UUFDN0YsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsWUFBWTtRQUNyQixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsS0FBSyxFQUFFLG9CQUFvQjtRQUMzQixXQUFXLEVBQUUsMEVBQTBFO1FBQ3ZGLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLGtCQUFrQjtRQUMzQixJQUFJLEVBQUU7WUFDSixrQkFBa0I7WUFDbEIsZUFBZTtZQUNmLGFBQWE7WUFDYixjQUFjO1lBQ2QsV0FBVztZQUNYLGVBQWU7WUFDZixjQUFjO1NBQ2Y7UUFDRCxLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsaUJBQWlCLEVBQUU7UUFDakIsS0FBSyxFQUFFLDZCQUE2QjtRQUNwQyxXQUFXLEVBQUUscUZBQXFGO1FBQ2xHLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsbUJBQW1CLEVBQUU7UUFDbkIsS0FBSyxFQUFFLGlDQUFpQztRQUN4QyxXQUFXLEVBQ1QsbUZBQW1GO1FBQ3JGLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsMkJBQTJCLEVBQUU7UUFDM0IsS0FBSyxFQUFFLGlDQUFpQztRQUN4QyxXQUFXLEVBQ1Qsa0dBQWtHO1FBQ3BHLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsS0FBSyxFQUFFLDBCQUEwQjtRQUNqQyxXQUFXLEVBQ1QsdUhBQXVIO1FBQ3pILElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QsbUJBQW1CLEVBQUU7UUFDbkIsS0FBSyxFQUFFLGlDQUFpQztRQUN4QyxXQUFXLEVBQUUsb0VBQW9FO1FBQ2pGLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0QscUJBQXFCLEVBQUU7UUFDckIsS0FBSyxFQUFFLDBDQUEwQztRQUNqRCxXQUFXLEVBQ1QsMEZBQTBGO1FBQzVGLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Qsb0JBQW9CLEVBQUU7UUFDcEIsS0FBSyxFQUFFLHFDQUFxQztRQUM1QyxXQUFXLEVBQ1QsNkZBQTZGO1FBQy9GLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsRUFBRTtLQUNWO0NBQ0YsQ0FBQztBQUVGLE1BQU07SUFDSixNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLGNBQWMsR0FBVztJQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRUQsTUFBTSxjQUFjLEdBQVcsRUFBRSxLQUFVO0lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsSUFBSSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsTUFBTSxrQkFBa0IsR0FBVyxFQUFFLEdBQUcsSUFBVztJQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxXQUFXLElBQUksR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBRUQsTUFBTSxzQkFBc0IsR0FBVyxFQUFFLEdBQUcsSUFBVztJQUNyRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLElBQUksR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNuRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IG5hbWUgfSBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuY29uc3QgcGFja2FnZU5hbWUgPSBuYW1lO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBkZWZhdWx0V2lkdGg6IHtcbiAgICB0aXRsZTogJ0d1dHRlciB3aWR0aCAocHgpJyxcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgZGVmYXVsdDogMjEwLFxuICAgIG9yZGVyOiAxLFxuICB9LFxuICBndXR0ZXJEYXRlRm9ybWF0OiB7XG4gICAgdGl0bGU6ICdHdXR0ZXIgZGF0ZSBmb3JtYXQnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ01vbWVudC5qcyBjb21wYXRpYmxlIFtkYXRlIGZvcm1hdCBzdHJpbmddKGh0dHBzOi8vbW9tZW50anMuY29tL2RvY3MvIy9kaXNwbGF5aW5nL2Zvcm1hdC8pJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnWVlZWS1NTS1ERCcsXG4gICAgb3JkZXI6IDIsXG4gIH0sXG4gIGNvbG9yU2NhbGU6IHtcbiAgICB0aXRsZTogJ0d1dHRlciBjb2xvciBzY2FsZScsXG4gICAgZGVzY3JpcHRpb246ICdQcmVzZXQgc2NhbGVzIGZvciBjb2xvcmluZyBjb21taXRzIGJhc2VkIG9uIGFnZSAocmVxdWlyZXMgZWRpdG9yIHJlbG9hZCknLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdSb3lhbFBvbWVncmFuYXRlJyxcbiAgICBlbnVtOiBbXG4gICAgICAnUm95YWxQb21lZ3JhbmF0ZScsXG4gICAgICAnQ2hvY29sYXRlTWludCcsXG4gICAgICAnVmlvbGV0QXBwbGUnLFxuICAgICAgJ0FmZmFpckdvYmxpbicsXG4gICAgICAnR29sZERhaXN5JyxcbiAgICAgICdQb3BweUxvY2htYXJhJyxcbiAgICAgICdQZXJzaWFuU3RlZWwnLFxuICAgIF0sXG4gICAgb3JkZXI6IDMsXG4gIH0sXG4gIGRpc3BsYXlBZ2VTZWN0aW9uOiB7XG4gICAgdGl0bGU6ICdEaXNwbGF5IGNvZGUgYWdlIGluIHBvcG92ZXInLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hlbiB2aWV3aW5nIHRoZSBibGFtZSBwb3BvdmVyLCBkaXNwbGF5IHRoZSBzZWN0aW9uIHZpc3VhbGlzaW5nIHRoZSBhZ2Ugb2YgdGhlIGNvZGUnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA0LFxuICB9LFxuICB0cnVuY2F0ZUd1dHRlck5hbWVzOiB7XG4gICAgdGl0bGU6ICdUcnVuY2F0ZSBhdXRob3IgbmFtZXMgaW4gZ3V0dGVyJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdBdHRlbXB0IHRvIHRydW5jYXRlIGNvbW1pdCBhdXRob3IgbmFtZXMgdG8gZGlzcGxheSBmaXJzdCBpbml0aWFsIGFuZCBzdXJuYW1lIG9ubHknLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA1LFxuICB9LFxuICBoaWdobGlnaHRQdWxsUmVxdWVzdE9uSG92ZXI6IHtcbiAgICB0aXRsZTogJ0hpZ2hsaWdodCBwdWxsIHJlcXVlc3Qgb24gaG92ZXInLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1doZW4gdmlld2luZyB0aGUgYmxhbWUgcG9wb3ZlciwgaGlnaGxpZ2h0IGxpbmVzIGludHJvZHVjZWQgYnkgY29tbWl0cyBmcm9tIHRoZSBzYW1lIHB1bGwgcmVxdWVzdCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDYsXG4gIH0sXG4gIGRpc3BsYXlIaWdobGlnaHRMYWJlbHM6IHtcbiAgICB0aXRsZTogJ0Rpc3BsYXkgaGlnaGxpZ2h0IGxhYmVscycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnV2hlbiB2aWV3aW5nIHRoZSBibGFtZSBwb3BvdmVyLCBzaG93IGNvbW1pdCBoYXNoZXMgYW5kIHB1bGwgcmVxdWVzdHMgbnVtYmVycyBpbiB0aGUgdG9wIHJpZ2h0IG9mIGhpZ2hsaWdodGVkIHNlY3Rpb25zJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNyxcbiAgfSxcbiAgc2VuZFVzYWdlU3RhdGlzdGljczoge1xuICAgIHRpdGxlOiAnU2VuZCBhbm9ueW1vdXMgdXNhZ2Ugc3RhdGlzdGljcycsXG4gICAgZGVzY3JpcHRpb246ICdTZW5kIGFub255bW91cyB1c2FnZSBkYXRhIHRvIFN0ZXBzaXplIHNvIHdlIGNhbiBpbXByb3ZlIHRoZSBwbHVnaW4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA4LFxuICB9LFxuICBwYXJhbGxlbEdpdFByb2Nlc3Npbmc6IHtcbiAgICB0aXRsZTogJ1VzZSBwYXJhbGxlbCBwcm9jZXNzaW5nIGZvciBHaXQgY29tbWFuZHMnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0NhbiBpbXByb3ZlIHBlcmZvcm1hbmNlIG9uIG11bHRpLWNvcmUgbWFjaGluZXMsIGlmIHRoZSBndXR0ZXIgaXMgc2xvdyB0cnkgZGlzYWJsaW5nIHRoaXMnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA5LFxuICB9LFxuICBzZWFyY2hJbkxheWVyRW5hYmxlZDoge1xuICAgIHRpdGxlOiAnRW5hYmxlIFNlYXJjaCBpbiBMYXllciAobWFjT1Mgb25seSknLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1NlbmQgY29kZSBzZWxlY3Rpb24gZXZlbnRzIHZpYSBVRFAgdG8gdGhlIExheWVyIGRlc2t0b3AgYXBwIHRvIHVzZSBpdHMgc2VhcmNoIGZ1bmN0aW9uYWxpdHknLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiAxMCxcbiAgfSxcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKSB7XG4gIHJldHVybiBjb25maWc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQoa2V5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGF0b20uY29uZmlnLmdldChgJHtwYWNrYWdlTmFtZX0uJHtrZXl9YCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgcmV0dXJuIGF0b20uY29uZmlnLnNldChgJHtwYWNrYWdlTmFtZX0uJHtrZXl9YCwgdmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb2JzZXJ2ZShrZXk6IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcbiAgcmV0dXJuIGF0b20uY29uZmlnLm9ic2VydmUoYCR7cGFja2FnZU5hbWV9LiR7a2V5fWAsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb25EaWRDaGFuZ2Uoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gIHJldHVybiBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShgJHtwYWNrYWdlTmFtZX0uJHtrZXl9YCwgLi4uYXJncyk7XG59XG4iXX0=