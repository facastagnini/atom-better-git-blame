'use babel';
const pj = require('../package.json');
export const config = {
  colorScale: {
    title: 'Gutter color scale',
    description:
      'Preset scales for coloring commits based on age. (requires editor reload)',
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
    description:
      'Moment.js compatible date format string (https://momentjs.com/docs/#/displaying/format/)',
    type: 'string',
    default: 'YYYY-MM-DD',
    order: 3,
  },
  truncateGutterNames: {
    title: 'Truncate names in gutter',
    description:
      'Will attempt to truncate names to display first initial and surname only',
    type: 'boolean',
    default: true,
    order: 4,
  },
  parallelGitProcessing: {
    title: 'Use parallel processing for Git commands',
    description:
      'Can improve performance on multi-core machines, if the gutter is slow try disabling this',
    type: 'boolean',
    default: true,
    order: 5,
  },
  searchInLayerEnabled: {
    title: 'Enable Search in Layer (macOS Only)',
    description:
      'Send code selection events to the Layer desktop app for more detailed search results',
    type: 'boolean',
    default: true,
    order: 6,
  },
  highlightPullRequestOnHover: {
    title: 'Highlight pull request on hover',
    description:
      'When hovering over a gutter item highlight additional commits from the same pull request',
    type: 'boolean',
    default: true,
    order: 7,
  },
  displayHighlightLabels: {
    title: 'Display highlight labels',
    description:
      'Show commit hashes and pull requests numbers in the top right of highlighted sections',
    type: 'boolean',
    default: true,
    order: 8,
  },
  sendUsageStatistics: {
    title: 'Send usage statistics',
    description: 'Send anonymous usage data to Stepsize.',
    type: 'boolean',
    default: true,
    order: 9,
  },
};

export function getConfig() {
  return config;
}

export function get(key: string) {
  return atom.config.get(`${pj.name}.${key}`);
}

export function set(key: string, value: any) {
  return atom.config.set(`${pj.name}.${key}`, value);
}

export function observe(key: string, ...args : any[]) {
  return atom.config.observe(`${pj.name}.${key}`, ...args);
}

export function onDidChange(key: string, ...args : any[]) {
  return atom.config.onDidChange(`${pj.name}.${key}`, ...args);
}
