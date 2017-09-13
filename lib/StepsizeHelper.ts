'use babel';

import * as uuid from 'uuid';
import axios, { AxiosResponse } from 'axios';
import IRange = TextBuffer.IRange;
import IPoint = TextBuffer.IPoint;

class StepsizeHelper {
  public static rangesToSelectedLineNumbers(ranges: Array<IRange>) {
    if (ranges) {
      return ranges
        .map(range => {
          let numbers = [];
          for (let i = range.start.row; i < range.end.row; i = i + 1) {
            numbers.push(i + 1);
          }
          return numbers;
        })
        .reduce((acc, val) => {
          return acc.concat(val);
        }, []);
    }
    return [];
  }

  public static pointToOffset(text: string, point: IPoint) {
    const lines = text.split('\n');
    let total = 0;
    for (let i = 0; i < lines.length && i < point.row; i++) {
      total += lines[i].length;
    }
    total += point.column + point.row; // we add point.row to add in all newline characters
    return total;
  }

  public static async fetchIntegrationData(
    repoMetadata,
    commitHashes
  ): Promise<AxiosResponse> {
    const requestOptions = {
      method: 'POST',
      url:
        'https://development-stable-layer.stepsize.com/augment-code-search-results',
      data: {
        searchId: uuid.v4(),
        repoName: repoMetadata.repoName,
        repoOwner: repoMetadata.repoOwner,
        repoSource: repoMetadata.repoSource,
        commitHashes,
      },
    };

    return axios(requestOptions);
  }
}

export default StepsizeHelper;
