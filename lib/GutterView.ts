import IEditor = AtomCore.IEditor;

'use babel';

import { CompositeDisposable } from 'atom';
import StepsizeHelper from './StepsizeHelper';
import GitHelper from './GitHelper';
import * as _ from 'lodash';
import GutterRange from './GutterRange';
import GutterItem from './interface/GutterItem';

export default class GutterView {

  private editor: IEditor;
  private pullRequests;
  private metadata;
  private blame;
  private ranges;
  private width;

  constructor(editor) {
    this.editor = editor;
    this.fetchGutterData().then(() => {
      this.drawGutter();
      this.setGutterWidth(100);
    });
  }

  private drawGutter() {
    this.editor.addGutter({ name: 'layer' });

    const uniquePrNumbers = _.uniq(_.map(this.ranges, 'pullRequestNumber'));
    const colourMultiplier = 255 / (uniquePrNumbers.length - 1);
    const prColours = uniquePrNumbers.reduce((acc, prNumber, index) => {
      acc[prNumber] = `rgba(${Math.round(index * colourMultiplier)}, 70, 70, 0.7)`;
      return acc;
    }, {});

    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i];
      const item = new GutterItem();
      item.className = 'pull-request';
      if (range.pullRequestNumber === -1) {
        item.setBackground('rgba(120, 120, 120, 0.5)');
        item.setContent('Commit');
      } else {
        item.setBackground(prColours[range.pullRequestNumber]);
        item.setContent(`PR #${range.pullRequestNumber}`);
      }
      let marker = this.editor.markBufferRange(range.toAtomRange());
      let decoration = this.editor.decorateMarker(marker, {
        type: 'gutter',
        gutterName: 'layer',
        item: item.element(),
      });
    }
  }

  static gutterStyle() {
    const sheet = document.createElement('style');
    sheet.type = 'text/css';
    sheet.id = 'layer-gutter-style';
    return sheet;
  }

  setGutterWidth(width: number) {
    this.width = Math.max(50, Math.min(width, 500));
    let sheet = document.getElementById('layer-gutter-style');
    if (!sheet) {
      sheet = GutterView.gutterStyle();
      document.head.appendChild(sheet);
    }
    sheet.innerHTML = `
      atom-text-editor .gutter[gutter-name="layer"] {
        width: ${this.width}px
      }
    `;
  }

  private async fetchGutterData() {
    const metadata = this.getRepoMetadata();
    const blame = this.getGitBlame();

    // Execute the async functions together in parallel 🏃💨
    const metadataAndBlame = [await metadata, await blame];
    try {
      const response = await StepsizeHelper.fetchIntegrationData(
        metadataAndBlame[0],
        GitHelper.getHashesFromBlame(metadataAndBlame[1]),
      );
      this.metadata = metadataAndBlame[0];
      this.blame = metadataAndBlame[1];
      this.pullRequests = response.data.pullRequests;
      this.ranges = this.buildGutterRanges();
    } catch (e) {
      throw e;
    }
  }

  private async getRepoMetadata() {
    let remotes = await GitHelper.getRepoRemotes(this.editor.getPath());
    return GitHelper.extractRepoMetadataFromRemotes(remotes);
  }

  private async getGitBlame() {
    return await GitHelper.getGitBlameOutput(
      this.editor.getPath(),
      StepsizeHelper.rangesToSelectedLineNumbers([this.editor.getBuffer().getRange()]),
    );
  }

  private transformedPullRequestArray() {
    return _.reduce(this.pullRequests, (acc, pullRequest, key) => {
      acc.push({
        number: key,
        hashes: _.map(pullRequest.commits, 'commitHash'),
      });
      return acc;
    }, []);
  }

  buildGutterRanges() {
    const pullRequests = this.transformedPullRequestArray();
    let pullRequestLineRanges = Array < GutterRange >;

    for (let i = 0; i < this.blame.length; i++) {
      const line = this.blame[i];
      const commitHash = line.split(' ')[0];

      // Find pull request for commit
      let pullRequest = _.find(pullRequests, (obj) => {
        return obj.hashes.includes(commitHash);
      });
      if (!pullRequest) {
        // Set the pull request number to -1 if no PR exists for that line.
        // We will replace this with the blame data later
        pullRequest = { number: -1 };
      }

      // Build array of ranges for pull request display
      if (pullRequestLineRanges.length == 0) { // No ranges exist
        pullRequestLineRanges.push(new GutterRange(pullRequest, i));
      } else {
        const currentRange = pullRequestLineRanges[pullRequestLineRanges.length - 1]; // Get last range
        if (currentRange.pullRequestNumber === pullRequest.number) {
          currentRange.incrementRange();
        } else { // Add new range
          pullRequestLineRanges.push(new GutterRange(pullRequest, i));
        }
      }
    }

    return _.sortBy(pullRequestLineRanges, 'pullRequestNumber');
  }

}
