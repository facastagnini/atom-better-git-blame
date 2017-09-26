'use babel';
const pj = require('../package.json');
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
    truncateGutterNames: {
        title: 'Truncate author names in gutter',
        description: 'Attempt to truncate commit author names to display first initial and surname only',
        type: 'boolean',
        default: true,
        order: 4,
    },
    highlightPullRequestOnHover: {
        title: 'Highlight pull request on hover',
        description: 'When viewing the blame popover, highlight lines introduced by commits from the same pull request',
        type: 'boolean',
        default: true,
        order: 5,
    },
    displayHighlightLabels: {
        title: 'Display highlight labels',
        description: 'When viewing the blame popover, show commit hashes and pull requests numbers in the top right of highlighted sections',
        type: 'boolean',
        default: true,
        order: 6,
    },
    sendUsageStatistics: {
        title: 'Send anonymous usage statistics',
        description: 'Send anonymous usage data to Stepsize so we can improve the plugin',
        type: 'boolean',
        default: true,
        order: 7,
    },
    parallelGitProcessing: {
        title: 'Use parallel processing for Git commands',
        description: 'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
        type: 'boolean',
        default: true,
        order: 8,
    },
    searchInLayerEnabled: {
        title: 'Enable Search in Layer (macOS only)',
        description: 'Send code selection events via UDP to the Layer desktop app to use its search functionality',
        type: 'boolean',
        default: true,
        order: 9,
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
export function observe(key, ...args) {
    return atom.config.observe(`${pj.name}.${key}`, ...args);
}
export function onDidChange(key, ...args) {
    return atom.config.onDidChange(`${pj.name}.${key}`, ...args);
}
