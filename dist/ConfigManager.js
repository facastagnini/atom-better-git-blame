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
    },
    gutterDateFormat: {
        title: 'Gutter date format',
        description: 'Moment.js compatible date format string (https://momentjs.com/docs/#/displaying/format/)',
        type: 'string',
        default: 'YYYY-MM-DD',
    },
    parallelGitProcessing: {
        title: 'Use parallel processing for Git commands',
        description: 'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
        type: 'boolean',
        default: true,
    },
    searchInLayerEnabled: {
        title: 'Enable Search in Layer (macOS Only)',
        description: 'Send code selection events to the Layer desktop app for more detailed search results',
        type: 'boolean',
        default: true,
    },
    defaultWidth: {
        title: 'Default width',
        type: 'integer',
        default: 210,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9Db25maWdNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUNaLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRztJQUNwQixVQUFVLEVBQUU7UUFDVixLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLFdBQVcsRUFDVCwyRUFBMkU7UUFDN0UsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsa0JBQWtCO1FBQzNCLElBQUksRUFBRTtZQUNKLGtCQUFrQjtZQUNsQixlQUFlO1lBQ2YsYUFBYTtZQUNiLGNBQWM7WUFDZCxXQUFXO1lBQ1gsZUFBZTtZQUNmLGNBQWM7U0FDZjtLQUNGO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsS0FBSyxFQUFFLG9CQUFvQjtRQUMzQixXQUFXLEVBQ1QsMEZBQTBGO1FBQzVGLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFlBQVk7S0FDdEI7SUFDRCxxQkFBcUIsRUFBRTtRQUNyQixLQUFLLEVBQUUsMENBQTBDO1FBQ2pELFdBQVcsRUFDVCwwRkFBMEY7UUFDNUYsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtLQUNkO0lBQ0Qsb0JBQW9CLEVBQUU7UUFDcEIsS0FBSyxFQUFFLHFDQUFxQztRQUM1QyxXQUFXLEVBQ1Qsc0ZBQXNGO1FBQ3hGLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7S0FDZDtJQUNELFlBQVksRUFBRTtRQUNaLEtBQUssRUFBRSxlQUFlO1FBQ3RCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEdBQUc7S0FDYjtDQUNGLENBQUM7QUFFRixNQUFNO0lBQ0osTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsTUFBTSxjQUFjLEdBQUc7SUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFRCxNQUFNLGNBQWMsR0FBRyxFQUFFLEtBQUs7SUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5jb25zdCBwaiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgY29sb3JTY2FsZToge1xuICAgIHRpdGxlOiAnR3V0dGVyIGNvbG9yIHNjYWxlJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdQcmVzZXQgc2NhbGVzIGZvciBjb2xvcmluZyBjb21taXRzIGJhc2VkIG9uIGFnZS4gKHJlcXVpcmVzIGVkaXRvciByZWxvYWQpJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnUm95YWxQb21lZ3JhbmF0ZScsXG4gICAgZW51bTogW1xuICAgICAgJ1JveWFsUG9tZWdyYW5hdGUnLFxuICAgICAgJ0Nob2NvbGF0ZU1pbnQnLFxuICAgICAgJ1Zpb2xldEFwcGxlJyxcbiAgICAgICdBZmZhaXJHb2JsaW4nLFxuICAgICAgJ0dvbGREYWlzeScsXG4gICAgICAnUG9wcHlMb2NobWFyYScsXG4gICAgICAnUGVyc2lhblN0ZWVsJyxcbiAgICBdLFxuICB9LFxuICBndXR0ZXJEYXRlRm9ybWF0OiB7XG4gICAgdGl0bGU6ICdHdXR0ZXIgZGF0ZSBmb3JtYXQnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ01vbWVudC5qcyBjb21wYXRpYmxlIGRhdGUgZm9ybWF0IHN0cmluZyAoaHR0cHM6Ly9tb21lbnRqcy5jb20vZG9jcy8jL2Rpc3BsYXlpbmcvZm9ybWF0LyknLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdZWVlZLU1NLUREJyxcbiAgfSxcbiAgcGFyYWxsZWxHaXRQcm9jZXNzaW5nOiB7XG4gICAgdGl0bGU6ICdVc2UgcGFyYWxsZWwgcHJvY2Vzc2luZyBmb3IgR2l0IGNvbW1hbmRzJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdDYW4gaW1wcm92ZSBwZXJmb3JtYW5jZSBvbiBtdWx0aS1jb3JlIG1hY2hpbmVzLCBpZiB0aGUgZ3V0dGVyIGlzIHNsb3cgdHJ5IGRpc2FibGluZyB0aGlzJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgfSxcbiAgc2VhcmNoSW5MYXllckVuYWJsZWQ6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBTZWFyY2ggaW4gTGF5ZXIgKG1hY09TIE9ubHkpJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdTZW5kIGNvZGUgc2VsZWN0aW9uIGV2ZW50cyB0byB0aGUgTGF5ZXIgZGVza3RvcCBhcHAgZm9yIG1vcmUgZGV0YWlsZWQgc2VhcmNoIHJlc3VsdHMnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICB9LFxuICBkZWZhdWx0V2lkdGg6IHtcbiAgICB0aXRsZTogJ0RlZmF1bHQgd2lkdGgnLFxuICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICBkZWZhdWx0OiAyMTAsXG4gIH0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xuICByZXR1cm4gY29uZmlnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KGtleSkge1xuICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KGAke3BqLm5hbWV9LiR7a2V5fWApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGF0b20uY29uZmlnLnNldChgJHtwai5uYW1lfS4ke2tleX1gLCB2YWx1ZSk7XG59XG4iXX0=