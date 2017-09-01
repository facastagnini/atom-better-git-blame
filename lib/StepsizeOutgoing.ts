'use babel';

import { Socket, createSocket } from 'dgram';
import fs from 'fs';

export default class StepsizeOutgoing {
  private pluginId;
  private DEBUG: boolean;
  private UDP_HOST: string;
  private UDP_PORT: number;
  private OUTGOING_SOCK: Socket;
  private MERGE_CALLED: boolean;

  constructor() {
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

  buildEvent(editor, action) {
    const text = editor.getText();

    const selections = editor.selections.map((selection) => {
      const range = selection.getBufferRange();
      return {
        start: StepsizeOutgoing.pointToOffset(text, range.start),
        end: StepsizeOutgoing.pointToOffset(text, range.end)
      }
    });

    const selectedLineNumbers = editor.selections.map((selection) => {
      const range = selection.getBufferRange();
      let numbers = [];
      for(let i = range.start.row; i < range.end.row; i = i + 1){
        numbers.push(i);
      }
      return numbers;
    }).reduce((acc, val) => {
      return acc.concat(val);
    }, []);

    return {
      "source": "atom",
      "action": action,
      "filename": editor.getPath(),
      "selected": editor.getSelectedText(),
      'plugin_id': this.pluginId,
      selections,
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
