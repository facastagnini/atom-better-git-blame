'use babel';

import path from 'path'
import fs from 'fs'

// Modified from: https://github.com/josa42/atom-blame/blob/master/lib/utils/find-repo.js
/*
Copyright (c) 2015 Josa Gesell

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function findRepoRoot(currentPath) {
  let lastPath;
  while (currentPath && lastPath !== currentPath) {
    lastPath = currentPath;
    const repoPath = path.join(currentPath, '.git');
    if (fs.existsSync(repoPath)) {
      return currentPath
    }
    currentPath = path.dirname(currentPath);
  }
  return null
}

export default findRepoRoot;
