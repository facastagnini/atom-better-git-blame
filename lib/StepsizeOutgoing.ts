'use babel';

import { CompositeDisposable } from 'atom';
import { Socket, createSocket } from 'dgram';
import fs from 'fs';

export default class StepsizeOutgoing {

  private subscriptions;
  private pluginId;
  private DEBUG: boolean;
  private UDP_HOST: string;
  private UDP_PORT: number;
  private OUTGOING_SOCK: Socket;
  private MERGE_CALLED: boolean;

  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.pluginId = 'atom_v0.0.2';
    this.DEBUG = false;
    this.UDP_HOST = '127.0.0.1';
    this.UDP_PORT = 49369;
    this.OUTGOING_SOCK = createSocket('udp4');
    this.MERGE_CALLED = false;
  }

  public send(event) {
    console.log('Send event to socket', event);
    let msg = JSON.stringify(event);
    this.OUTGOING_SOCK.send(
      msg,
      0,
      msg.length,
      this.UDP_PORT,
      this.UDP_HOST,
      function(err){
        if(err) throw err;
      }
    );
  }

  // sendError - sends error message to Stepsize
  sendError = (data) => {
    let editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    let event = {
      'source': 'atom',
      'action': "error",
      'filename': fs.realpathSync(editor.getPath()),
      'selected': JSON.stringify(data),
      'plugin_id': this.pluginId
    };
    this.send(event);
  };

  // buildEvent constructs an event from the provided editor. It sets the
  // "action" field of the event to the provided value.
  public buildEvent(editor, action) {
    const text = editor.getText();
    const cursorPoint = editor.getCursorBufferPosition();
    const cursorOffset = StepsizeOutgoing.pointToOffset(text, cursorPoint);
    let selectedLineNumbers = editor.getSelectedBufferRanges().reduce((acc, range) => {
      if (range.start.row === range.end.row && range.start.column === range.end.column) return acc;
      if (range.end.column === 0 && range.end.row > 0) range.end.row -= 1;
      let numbers = [...Array(range.end.row - range.start.row + 1)]
        .map(key => key + range.start.row + 1);
      acc.push(...numbers);
      return acc;
    }, []);
    return {
      "source": "atom",
      "action": action,
      "filename": editor.getPath(),
      "selections": [{
        "start": cursorOffset,
        "end": cursorOffset,
      }],
      "selected": editor.getSelectedText(),
      'plugin_id': this.pluginId,
      selectedLineNumbers,
    };
  }

  // pointToOffet takes the contents of the buffer and a point object
  // representing the cursor, and returns a byte-offset for the cursor
  static pointToOffset(text, point) {
    const lines = text.split("\n");
    let total = 0;
    for (let i = 0; i < lines.length && i < point.row; i++) {
      total += lines[i].length;
    }
    total += point.column + point.row; // we add point.row to add in all newline characters
    return total;
  }
}
