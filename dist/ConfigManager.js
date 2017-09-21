'use babel';
const pj = require('../package.json');
export const config = {
    colorScale: {
        title: 'Gutter color scale',
        description: 'Preset scales for coloring commits based on age. (requires editor reload)',
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
        order: 1,
    },
    defaultWidth: {
        title: 'Default width',
        type: 'integer',
        default: 210,
        order: 2,
    },
    gutterDateFormat: {
        title: 'Gutter date format',
        description: 'Moment.js compatible date format string (https://momentjs.com/docs/#/displaying/format/)',
        type: 'string',
        default: 'YYYY-MM-DD',
        order: 3,
    },
    parallelGitProcessing: {
        title: 'Use parallel processing for Git commands',
        description: 'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
        type: 'boolean',
        default: true,
        order: 4,
    },
    searchInLayerEnabled: {
        title: 'Enable Search in Layer (macOS Only)',
        description: 'Send code selection events to the Layer desktop app for more detailed search results',
        type: 'boolean',
        default: true,
        order: 5,
    },
    highlightPullRequestOnHover: {
        title: 'Highlight pull request on hover',
        description: 'When hovering over a gutter item highlight additional commits from the same pull request',
        type: 'boolean',
        default: true,
        order: 6,
    },
    displayHighlightLabels: {
        title: 'Display highlight labels',
        description: 'Show commit hashes and pull requests numbers in the top right of highlighted sections',
        type: 'boolean',
        default: true,
        order: 7,
    },
    sendUsageStatistics: {
        title: 'Send usage statistics',
        description: 'Send anonymous usage data to Stepsize.',
        type: 'boolean',
        default: true,
        order: 8,
    },
};
export function getConfig() {
    return config;
}
export function get(key) {
    return atom.config.get(`${pj.name}.${key}`);
}
export function set(key, value) {
    return atom.config.set(`${pj.name}.${key}`, value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9Db25maWdNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUNaLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRztJQUNwQixVQUFVLEVBQUU7UUFDVixLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLFdBQVcsRUFDVCwyRUFBMkU7UUFDN0UsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsa0JBQWtCO1FBQzNCLElBQUksRUFBRTtZQUNKLGtCQUFrQjtZQUNsQixlQUFlO1lBQ2YsYUFBYTtZQUNiLGNBQWM7WUFDZCxXQUFXO1lBQ1gsZUFBZTtZQUNmLGNBQWM7U0FDZjtRQUNELEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxZQUFZLEVBQUU7UUFDWixLQUFLLEVBQUUsZUFBZTtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxHQUFHO1FBQ1osS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNELGdCQUFnQixFQUFFO1FBQ2hCLEtBQUssRUFBRSxvQkFBb0I7UUFDM0IsV0FBVyxFQUNULDBGQUEwRjtRQUM1RixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxxQkFBcUIsRUFBRTtRQUNyQixLQUFLLEVBQUUsMENBQTBDO1FBQ2pELFdBQVcsRUFDVCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixLQUFLLEVBQUUscUNBQXFDO1FBQzVDLFdBQVcsRUFDVCxzRkFBc0Y7UUFDeEYsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCwyQkFBMkIsRUFBRTtRQUMzQixLQUFLLEVBQUUsaUNBQWlDO1FBQ3hDLFdBQVcsRUFDVCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxzQkFBc0IsRUFBRTtRQUN0QixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLFdBQVcsRUFDVCx1RkFBdUY7UUFDekYsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixLQUFLLEVBQUUsdUJBQXVCO1FBQzlCLFdBQVcsRUFBRSx3Q0FBd0M7UUFDckQsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSxDQUFDO0tBQ1Q7Q0FDRixDQUFDO0FBRUYsTUFBTTtJQUNKLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUFHO0lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRUQsTUFBTSxjQUFjLEdBQUcsRUFBRSxLQUFLO0lBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuY29uc3QgcGogPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGNvbG9yU2NhbGU6IHtcbiAgICB0aXRsZTogJ0d1dHRlciBjb2xvciBzY2FsZScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnUHJlc2V0IHNjYWxlcyBmb3IgY29sb3JpbmcgY29tbWl0cyBiYXNlZCBvbiBhZ2UuIChyZXF1aXJlcyBlZGl0b3IgcmVsb2FkKScsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ1JveWFsUG9tZWdyYW5hdGUnLFxuICAgIGVudW06IFtcbiAgICAgICdSb3lhbFBvbWVncmFuYXRlJyxcbiAgICAgICdDaG9jb2xhdGVNaW50JyxcbiAgICAgICdWaW9sZXRBcHBsZScsXG4gICAgICAnQWZmYWlyR29ibGluJyxcbiAgICAgICdHb2xkRGFpc3knLFxuICAgICAgJ1BvcHB5TG9jaG1hcmEnLFxuICAgICAgJ1BlcnNpYW5TdGVlbCcsXG4gICAgXSxcbiAgICBvcmRlcjogMSxcbiAgfSxcbiAgZGVmYXVsdFdpZHRoOiB7XG4gICAgdGl0bGU6ICdEZWZhdWx0IHdpZHRoJyxcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgZGVmYXVsdDogMjEwLFxuICAgIG9yZGVyOiAyLFxuICB9LFxuICBndXR0ZXJEYXRlRm9ybWF0OiB7XG4gICAgdGl0bGU6ICdHdXR0ZXIgZGF0ZSBmb3JtYXQnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ01vbWVudC5qcyBjb21wYXRpYmxlIGRhdGUgZm9ybWF0IHN0cmluZyAoaHR0cHM6Ly9tb21lbnRqcy5jb20vZG9jcy8jL2Rpc3BsYXlpbmcvZm9ybWF0LyknLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdZWVlZLU1NLUREJyxcbiAgICBvcmRlcjogMyxcbiAgfSxcbiAgcGFyYWxsZWxHaXRQcm9jZXNzaW5nOiB7XG4gICAgdGl0bGU6ICdVc2UgcGFyYWxsZWwgcHJvY2Vzc2luZyBmb3IgR2l0IGNvbW1hbmRzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDYW4gaW1wcm92ZSBwZXJmb3JtYW5jZSBvbiBtdWx0aS1jb3JlIG1hY2hpbmVzLCBpZiB0aGUgZ3V0dGVyIGlzIHNsb3cgdHJ5IGRpc2FibGluZyB0aGlzJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNCxcbiAgfSxcbiAgc2VhcmNoSW5MYXllckVuYWJsZWQ6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBTZWFyY2ggaW4gTGF5ZXIgKG1hY09TIE9ubHkpJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdTZW5kIGNvZGUgc2VsZWN0aW9uIGV2ZW50cyB0byB0aGUgTGF5ZXIgZGVza3RvcCBhcHAgZm9yIG1vcmUgZGV0YWlsZWQgc2VhcmNoIHJlc3VsdHMnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA1LFxuICB9LFxuICBoaWdobGlnaHRQdWxsUmVxdWVzdE9uSG92ZXI6IHtcbiAgICB0aXRsZTogJ0hpZ2hsaWdodCBwdWxsIHJlcXVlc3Qgb24gaG92ZXInLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1doZW4gaG92ZXJpbmcgb3ZlciBhIGd1dHRlciBpdGVtIGhpZ2hsaWdodCBhZGRpdGlvbmFsIGNvbW1pdHMgZnJvbSB0aGUgc2FtZSBwdWxsIHJlcXVlc3QnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA2LFxuICB9LFxuICBkaXNwbGF5SGlnaGxpZ2h0TGFiZWxzOiB7XG4gICAgdGl0bGU6ICdEaXNwbGF5IGhpZ2hsaWdodCBsYWJlbHMnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1Nob3cgY29tbWl0IGhhc2hlcyBhbmQgcHVsbCByZXF1ZXN0cyBudW1iZXJzIGluIHRoZSB0b3AgcmlnaHQgb2YgaGlnaGxpZ2h0ZWQgc2VjdGlvbnMnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA3LFxuICB9LFxuICBzZW5kVXNhZ2VTdGF0aXN0aWNzOiB7XG4gICAgdGl0bGU6ICdTZW5kIHVzYWdlIHN0YXRpc3RpY3MnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2VuZCBhbm9ueW1vdXMgdXNhZ2UgZGF0YSB0byBTdGVwc2l6ZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA4LFxuICB9LFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpIHtcbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldChrZXkpIHtcbiAgcmV0dXJuIGF0b20uY29uZmlnLmdldChgJHtwai5uYW1lfS4ke2tleX1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBhdG9tLmNvbmZpZy5zZXQoYCR7cGoubmFtZX0uJHtrZXl9YCwgdmFsdWUpO1xufVxuIl19