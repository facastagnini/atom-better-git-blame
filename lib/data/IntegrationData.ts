'use babel';

import StepsizeHelper from '../StepsizeHelper';
import * as GitData from './GitData';
import db from './database';
import _ from 'lodash';
import GitHelper from '../GitHelper';

let pendingRequests = {};

export async function getIntegrationDataForFile(filePath: string) {
  const metadata = await GitData.getRepoMetadata(filePath);
  const blame = await GitData.getBlameForFile(filePath);
  if(pendingRequests[filePath]){
    const response =  await pendingRequests[filePath];
    delete pendingRequests[filePath];
    return response;
  }
  pendingRequests[filePath] = StepsizeHelper.fetchIntegrationData(
    metadata,
    GitHelper.getHashesFromBlame(blame.lines)
  );
  const response =  await pendingRequests[filePath];
  delete pendingRequests[filePath];
  return response;
}
