export default class GutterRange {

  public pullRequestNumber: number;
  public range: {
    start: number;
    end: number;
  };

  constructor(pullRequest?, currentLine) {
    if (pullRequest) {
      this.pullRequestNumber = pullRequest.number;
      this.range = {
        start: currentLine,
        end: currentLine,
      };
    }
  }

  public incrementRange() {
    this.range.end = this.range.end + 1;
  }

  public toAtomRange() {
    return [[this.range.start, 0], [this.range.end, 0]];
  }

}
