// Copyright 2023-2024 Diffblue Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import diff_match_patch from "diff-match-patch";

import {applyFilters, Filter} from "./Filters";

export enum DiffResult {
  UNCHANGED = 0,
  ADDED = 1,
  REMOVED = -1
}

function rawDiffToLineDiff(diff: diff_match_patch.Diff[]) {
  const diffLineNums: DiffResult[] = []
  const lineNumsToOriginalText = new Map<number, string>();
  for (const diffBlock of diff) {
    const textInChunk =diffBlock[1].replace(/\n$/, ""); // Trailing newlines break the split
    for (const line of textInChunk.split("\n")) {
      const currLineNum = diffLineNums.length;
      diffLineNums[currLineNum] = diffBlock[0];
      lineNumsToOriginalText.set(currLineNum, line);
    }
  }
  return {diffLineNums, lineNumsToOriginalText};
}

function diff_lineMode(contents1: string, contents2: string) {
  const dmp = new diff_match_patch();
  // Call diff algorithm here
  const a = dmp.diff_linesToChars_(contents1, contents2);
  const lineText1 = a.chars1;
  const lineText2 = a.chars2;
  const lineArray = a.lineArray;
  dmp.Diff_Timeout = 0;

  const diff = dmp.diff_main(lineText1, lineText2, false);
  // We'll want the clean up for the within-line diff, but for this diff we won't use it
  // dmp.diff_cleanupSemantic(diff);
  dmp.diff_charsToLines_(diff, lineArray);
  return diff;
}

export function diff_wordMode(contents1: string, contents2: string) {
  const dmp = new diff_match_patch();
  const diff = dmp.diff_main(contents1, contents2, false);
  dmp.diff_cleanupSemantic(diff);
  return diff;
}

export function similarText(contents1: string, contents2: string) : boolean {
  const dmp = new diff_match_patch();
  const diff = dmp.diff_main(contents1, contents2, false);
  dmp.diff_cleanupSemantic(diff);
  let unchanged = 0;
  let changed = 0;
  for (const diffElement of diff) {
    if (diffElement[0] == DiffResult.UNCHANGED.valueOf()) {
      unchanged += diffElement[1].length;
    } else {
      changed += diffElement[1].length;
    }
  }
  return unchanged >= changed;
}

export function callDiffAlgoOnStrings(contents1: string, contents2: string, filters: Filter[]) {
  const filtered1 = applyFilters(contents1, filters);
  const filtered2 = applyFilters(contents2, filters);
  // Call diff algorithm here
  const diff = diff_lineMode(filtered1, filtered2);
  const {diffLineNums, lineNumsToOriginalText} = rawDiffToLineDiff(diff);

  const originalLines1: string[] = contents1.split(/\n/);
  const originalLines2: string[] = contents2.split(/\n/);

  const diffIDsToOriginalLeftText: Map<number, string> = new Map<number, string>();
  const diffIDsToOriginalRightText: Map<number, string> = new Map<number, string>();
  let leftIndex = 0;
  let rightIndex = 0;
  for (let i = 0; i < diffLineNums.length; i++) {
    const diffResult = diffLineNums[i];
    if (diffResult == DiffResult.REMOVED || diffResult == DiffResult.UNCHANGED) {
      diffIDsToOriginalLeftText.set(i, originalLines1[leftIndex]);
      leftIndex++;
    }
    if (diffResult == DiffResult.ADDED || diffResult == DiffResult.UNCHANGED) {
      diffIDsToOriginalRightText.set(i, originalLines2[rightIndex]);
      rightIndex++;
    }
  }

  return {
    diffLineNums: diffLineNums,
    diffIDsToOriginalLeftText: diffIDsToOriginalLeftText,
    diffIDsToOriginalRightText: diffIDsToOriginalRightText,
    diffIDsToFilteredText: lineNumsToOriginalText
  };
}
