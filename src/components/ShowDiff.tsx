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

import {useState} from "react";
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import {DiffResult, similarText} from "../util/DiffAlgo";

import CollapsedSection from "./CollapsedSection.tsx";
import DiffRow, {
  DiffRowProperties,
  isMovedRow,
  isUnmatchedLeftRow,
  isUnmatchedRightRow,
  UnmatchedLeftRow,
  UnmatchedRightRow
} from "./DiffRow.tsx";


interface Properties {
  /** The diffs */
  diffLineNums: DiffResult[];
  diffIDsToOriginalLeftText: Map<number, string>;
  diffIDsToOriginalRightText: Map<number, string>;
  diffIDsToFilteredText: Map<number, string>;
}

export interface CollapsedSection {
  rowsInside: DiffRowProperties[];
}

function determineIfCollapsedSection(toBeDetermined: DiffRowProperties | CollapsedSection | undefined): toBeDetermined is CollapsedSection {
  return !!(toBeDetermined as CollapsedSection).rowsInside;
}

function getDiffRows(diffLineNums: DiffResult[], diffIDsToOriginalLeftText: Map<number, string>, diffIDsToOriginalRightText: Map<number, string>) : DiffRowProperties[] {
  const newProcessedDiff: DiffRowProperties[] = [];
  let currentRowOnLeft = 1;
  let currentRowOnRight = 1;
  for (let i = 0; i < diffLineNums.length; i++) {
    const diffResult = diffLineNums[i];
    const leftText: string = diffIDsToOriginalLeftText.get(i) ?? "";
    const rightText: string = diffIDsToOriginalRightText.get(i) ?? "";
    const newDiffRow: DiffRowProperties = {
      rowKey: i,
      leftText: null,
      rightText: null,
      leftLineNum: null,
      rightLineNum: null,
      different: diffResult != DiffResult.UNCHANGED
    };
    if (diffResult == DiffResult.REMOVED || diffResult == DiffResult.UNCHANGED) {
      newDiffRow.leftText = leftText;
      newDiffRow.leftLineNum = currentRowOnLeft;
      currentRowOnLeft++;
    }
    if (diffResult == DiffResult.ADDED || diffResult == DiffResult.UNCHANGED) {
      newDiffRow.rightText = rightText;
      newDiffRow.rightLineNum = currentRowOnRight;
      currentRowOnRight++;
    }
    newProcessedDiff.push(newDiffRow);
  }
  return newProcessedDiff;
}
function combineSimilarAddRemoveRowsIntoSingleChangedRow(diffRows: DiffRowProperties[], diffIDsToFilteredText: Map<number, string>): DiffRowProperties[] {
  const newProcessedDiff: DiffRowProperties[] = [];
  let lastRemovedBlockForMatching: UnmatchedLeftRow[] = [];
  for (const diffRow of diffRows) {
    if (isUnmatchedRightRow(diffRow)) { // ADDED
      let previousLeftRow = lastRemovedBlockForMatching.shift();
      const filteredRightRow = diffIDsToFilteredText.get(diffRow.rowKey)!;
      while (previousLeftRow
          && !similarText(diffIDsToFilteredText.get(previousLeftRow.rowKey)!, filteredRightRow)
          && previousLeftRow.matchingRowNumber == null) {
        previousLeftRow = lastRemovedBlockForMatching.shift();
      }
      if (previousLeftRow) {
        const previous : DiffRowProperties = previousLeftRow;
        previous.rightText = diffRow.rightText;
        previous.rightLineNum = diffRow.rightLineNum;
      } else {
        newProcessedDiff.push(diffRow);
      }
    } else {
      newProcessedDiff.push(diffRow);
      if (isUnmatchedLeftRow(diffRow)) { // REMOVED
        lastRemovedBlockForMatching.push(diffRow);
      } else { // UNCHANGED
        lastRemovedBlockForMatching = [];
      }
    }
  }
  return newProcessedDiff;
}
enum RunType {
  CHANGED_INLINE,
  ADDED,
  REMOVED,
  UNCHANGED
}
function runType(diffRow: DiffRowProperties) : RunType {
  if (isMovedRow(diffRow)) {
    return RunType.UNCHANGED;
  }
  if (isUnmatchedLeftRow(diffRow)) {
    return RunType.REMOVED;
  }
  if (isUnmatchedRightRow(diffRow)) {
    return RunType.ADDED;
  }
  if (diffRow.different) {
    return RunType.CHANGED_INLINE;
  }
  return RunType.UNCHANGED;
}

const contextLinesUnchanged = 2;

const contextLinesChanged = 10;

// Collapse large runs of add or remove, collapse small runs of unchanged rows, never collapse an inline difference
function collapseRunsOfSameTypeDiff(diffRows: DiffRowProperties[], uncollapsedLines: number[]) : [(DiffRowProperties | CollapsedSection)[], number] {
  const newProcessedDiff: (DiffRowProperties | CollapsedSection)[] = [];
  let numCollapsed = 0;
  let collapsedSection: CollapsedSection = {rowsInside: []};
  let startOfCurrentRun = 0;
  let currentRunType: RunType = runType(diffRows[0]);
  function pushUncollapsedToDiff(diffRow:DiffRowProperties) {
    newProcessedDiff.push(diffRow);
    collapsedSection = {rowsInside: []};
  }
  function pushCollapsedToDiff(diffRow:DiffRowProperties) {
    if (uncollapsedLines.includes(diffRow.rowKey)) {
      pushUncollapsedToDiff(diffRow);
      return;
    }
    if (collapsedSection.rowsInside.length == 0) {
      newProcessedDiff.push(collapsedSection)
    }
    collapsedSection.rowsInside.push(diffRow);
    numCollapsed++;
  }
  for (let i=0; i < diffRows.length; i++) {
    const diffRow = diffRows[i];
    const newRunType = runType(diffRow);
    if (newRunType == RunType.CHANGED_INLINE) { // we NEVER collapse inline changes
      pushUncollapsedToDiff(diffRow);
      currentRunType = newRunType;
      continue;
    }
    if (newRunType != currentRunType) {
      startOfCurrentRun = i;
      pushUncollapsedToDiff(diffRow);
    } else {
      const contextLengthForRunType = newRunType == RunType.UNCHANGED ? contextLinesUnchanged : contextLinesChanged;
      const lengthCurrentRun = i - startOfCurrentRun + 1;
      const maxRunEnd = Math.min(diffRows.length - 1, i + contextLengthForRunType + 1);
      let endCurrentRun = maxRunEnd;
      for (let j = i + 1; j <= maxRunEnd; j++) {
        if (runType(diffRows[j]) != newRunType) {
          endCurrentRun = j;
          break;
        }
      }
      if (lengthCurrentRun <= contextLengthForRunType || i >= endCurrentRun - contextLengthForRunType) {
        // Out of a collapsed section, either before or after the collapsed run
        pushUncollapsedToDiff(diffRow);
      } else {
        pushCollapsedToDiff(diffRow);
      }
    }
    currentRunType = newRunType;
  }
  return [newProcessedDiff, numCollapsed];
}
function removeItem<T>(arr: T[], value: T): T[] {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

const maxSearchDistance = 100;
function markMovedRows(diffRows: DiffRowProperties[], diffIDsToFilteredText: Map<number, string>) : DiffRowProperties[] {
  const removes : UnmatchedLeftRow[] = diffRows.filter(d => isUnmatchedLeftRow(d)) as UnmatchedLeftRow[];
  const adds : UnmatchedRightRow[] = diffRows.filter(d => isUnmatchedRightRow(d)) as UnmatchedRightRow[];
  let removesIndex = 0;
  let addsIndex = 0;
  // From row key to row key
  while (removesIndex < removes.length && addsIndex < adds.length) {
    const currentRemove = removes[removesIndex];
    const currentAdd = adds[addsIndex];
    if (currentAdd.rowKey > currentRemove.rowKey) {
      let comparisonIndex = addsIndex;
      let foundSimilar = false;
      do {
        const addToCheck = adds[comparisonIndex];
        const filteredRightText = diffIDsToFilteredText.get(addToCheck.rowKey)!;
        const filteredLeftText = diffIDsToFilteredText.get(currentRemove.rowKey)!;
        if (filteredRightText == filteredLeftText) {
          addToCheck.matchingRowNumber = currentRemove.leftLineNum;
          currentRemove.matchingRowNumber = addToCheck.rightLineNum;
          addToCheck.different = false;
          currentRemove.different = false;
          foundSimilar = true;
          removeItem(removes, currentRemove);
          removeItem(adds, addToCheck);
          break;
        }
        comparisonIndex++;
      } while (comparisonIndex < adds.length && adds[comparisonIndex].rowKey <= currentRemove.rowKey + maxSearchDistance);
      if (!foundSimilar) {
        removesIndex++;
      }
    } else {
      let comparisonIndex = removesIndex;
      let foundSimilar = false;
      do {
        const removeToCheck = removes[comparisonIndex];
        const filteredRightText = diffIDsToFilteredText.get(currentAdd.rowKey)!;
        const filteredLeftText = diffIDsToFilteredText.get(removeToCheck.rowKey)!;
        if (filteredRightText == filteredLeftText) {
          currentAdd.matchingRowNumber = removeToCheck.leftLineNum;
          removeToCheck.matchingRowNumber = currentAdd.rightLineNum;
          currentAdd.different = false;
          removeToCheck.different = false;
          foundSimilar = true;
          removeItem(removes, removeToCheck);
          removeItem(adds, currentAdd);
          break;
        }
        comparisonIndex++;
      } while (comparisonIndex < removes.length && removes[comparisonIndex].rowKey <= currentAdd.rowKey + maxSearchDistance);
      if (!foundSimilar) {
        addsIndex++;
      }
    }
  }
  return diffRows;
}

function ShowDiff(props: Properties) {
  const [uncollapsedLines, setUncollapsedLines] = useState<number[]>([]);

  let diffRows = getDiffRows(props.diffLineNums, props.diffIDsToOriginalLeftText, props.diffIDsToOriginalRightText);
  diffRows = markMovedRows(diffRows, props.diffIDsToFilteredText);
  diffRows = combineSimilarAddRemoveRowsIntoSingleChangedRow(diffRows, props.diffIDsToFilteredText);
  const [processedDiff, numCollapsed] = collapseRunsOfSameTypeDiff(diffRows, uncollapsedLines);

  function addUncollapsedLines(newUncollapsedLines: number[]) {
    setUncollapsedLines(uncollapsedLines.concat(newUncollapsedLines));
  }
  return (
    <Container fluid={true}>

      <Row><Col><p>{numCollapsed} collapsed rows</p></Col></Row>

      {processedDiff.map((group, i) => determineIfCollapsedSection(group) ?
        <CollapsedSection key={i} rowsInside={group.rowsInside} uncollapseLines={addUncollapsedLines}/> : (
        <DiffRow key={i} {...group}/>
      ))}

    </Container>
  );
}

export default ShowDiff;
