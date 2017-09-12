'use babel';

import { allowUnsafeEval, allowUnsafeNewFunction } from 'loophole';
import IEditor = AtomCore.IEditor;
import NodeColorGradient from 'node-color-gradient';
import * as GitData from './data/GitData';

let editors: { [prop: string]: IEditor } = {};
let datePromises: { [prop: string]: Promise<Date> } = {};
let cachedGradients: { [prop: string]: Array<number[]> } = {};

export async function colorScale(editor: IEditor) {
  const projectDir = await GitData.getRepoRootPath(editor.getPath());
  if (cachedGradients[projectDir]) {
    return cachedGradients[projectDir];
  }
  let firstCommitDate: Date = await datePromises[projectDir];
  const totalDays = Math.floor(
    (Date.now() - firstCommitDate.getTime()) / 1000 / 3600 / 24
  );
  const gradient = calculateScale(totalDays);
  cachedGradients[projectDir] = gradient;
  return gradient;
}

export function setEditor(editor: IEditor) {
  return GitData.getRepoRootPath(editor.getPath()).then(projectDir => {
    if (editors[projectDir]) {
      return;
    }
    editors[projectDir] = editor;
    datePromises[projectDir] = GitData.getFirstCommitDateForRepo(
      editor.getPath()
    );
  });
}

function calculateScale(steps: number) {
  const scale = atom.config.get('layer-atom.colorScale');
  switch (scale) {
    case 'RoyalPomegranate': {
      return new NodeColorGradient([
        [63, 116, 212],
        [60, 125, 199],
        [55, 136, 228],
        [78, 161, 216],
        [83, 175, 202],
        [96, 202, 197],
        [127, 225, 221],
        [167, 239, 236],
        [203, 248, 247],
        [255, 255, 255],
        [253, 245, 234],
        [251, 231, 204],
        [246, 208, 158],
        [243, 179, 99],
        [240, 159, 96],
        [240, 141, 89],
        [239, 128, 88],
        [238, 115, 73],
        [237, 98, 59],
        [235, 62, 37],
      ]).getGradient(steps);
    }
    case 'ChocolateMint': {
      return new NodeColorGradient([
        [140, 81, 10],
        [191, 129, 45],
        [223, 194, 125],
        [246, 232, 195],
        [245, 245, 245],
        [199, 234, 229],
        [128, 205, 193],
        [53, 151, 143],
        [1, 102, 94],
      ]).getGradient(steps);
    }
    case 'VioletApple': {
      return new NodeColorGradient([
        [197, 27, 125],
        [222, 119, 174],
        [241, 182, 218],
        [253, 224, 239],
        [247, 247, 247],
        [230, 245, 208],
        [184, 225, 134],
        [127, 188, 65],
        [77, 146, 33],
      ]).getGradient(steps);
    }
    case 'AffairGoblin': {
      return new NodeColorGradient([
        [118, 42, 131],
        [153, 112, 171],
        [194, 165, 207],
        [231, 212, 232],
        [247, 247, 247],
        [217, 240, 211],
        [166, 219, 160],
        [90, 174, 97],
        [27, 120, 55],
      ]).getGradient(steps);
    }
    case 'GoldDaisy': {
      return new NodeColorGradient([
        [179, 88, 6],
        [224, 130, 20],
        [253, 184, 99],
        [254, 224, 182],
        [247, 247, 247],
        [216, 218, 235],
        [178, 171, 210],
        [128, 115, 172],
        [84, 39, 136],
      ]).getGradient(steps);
    }
    case 'PoppyLochmara': {
      return new NodeColorGradient([
        [178, 24, 43],
        [214, 96, 77],
        [244, 165, 130],
        [253, 219, 199],
        [247, 247, 247],
        [209, 229, 240],
        [146, 197, 222],
        [67, 147, 195],
        [33, 102, 172],
      ]).getGradient(steps);
    }
    case 'PersianSteel': {
      return new NodeColorGradient([
        [215, 48, 39],
        [244, 109, 67],
        [253, 174, 97],
        [254, 224, 144],
        [255, 255, 191],
        [224, 243, 248],
        [171, 217, 233],
        [116, 173, 209],
        [69, 117, 180],
      ]).getGradient(steps);
    }
  }
}
