'use babel';
class GutterRange {
    constructor(currentLine, identifier) {
        if (identifier) {
            this.identifier = identifier;
        }
        this.range = {
            start: currentLine,
            end: currentLine,
        };
    }
    incrementRange() {
        this.range.end = this.range.end + 1;
    }
    toAtomRange() {
        return [[this.range.start, 0], [this.range.end, 900000]];
    }
}
export default GutterRange;
