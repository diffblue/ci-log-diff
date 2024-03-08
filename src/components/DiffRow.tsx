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

import Ansi from "ansi-to-react";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {diff_wordMode, DiffResult} from "../util/DiffAlgo.ts";

export interface DiffRowProperties {
  leftText: string | null;
  rightText: string | null;
  leftLineNum: number | null;
  rightLineNum: number | null;
  different: boolean;
  rowKey: number;
  matchingRowNumber: number;
}

/**
 * shortens a line of text if it is longer than the specified maximum length
 * @param {string} line the line of text to be shortened
 * @param {number} [maxLen=1000] the maximum length of the line after shortening
 * @returns {string} the shortened line of text
 */
function shortenLine(line: string, maxLen = 1000): string {
  if (line.length > maxLen) {
    return line.substring(0, maxLen - 4) + " ...";
  }
  return line;
}
export function isUnmatchedLeftRow(row: DiffRowProperties): row is UnmatchedLeftRow {
  return (row as UnmatchedLeftRow).leftText !== undefined && (row as UnmatchedLeftRow).rightText == undefined;
}

export interface UnmatchedLeftRow extends DiffRowProperties {
  leftText: string;
  rightText: null;
  leftLineNum: number;
  rightLineNum: null;
  matchingRowNumber: number | null;
}

export function isMovedRow(row: DiffRowProperties): row is MovedRow {
  return (row as MovedRow).matchingRowNumber !== undefined;
}

interface MovedRow extends DiffRowProperties {
  matchingRowNumber: number;
}

export function isUnmatchedRightRow(row: DiffRowProperties): row is UnmatchedRightRow {
  return (row as UnmatchedRightRow).rightText !== undefined && (row as UnmatchedRightRow).leftText == undefined;
}

export interface UnmatchedRightRow extends DiffRowProperties {
  leftText: null;
  rightText: string;
  leftLineNum: null;
  rightLineNum: number;
  matchingRowNumber: number | null;
}

function DiffRow(props: DiffRowProperties) {
  let leftDiff : [DiffResult, string][] | null = null;
  let rightDiff : [DiffResult, string][] | null = null;
  // If we have both left and right text we want to try and highlight the differences between them
  if (props.leftText && props.rightText) {
    const leftText = shortenLine(props.leftText);
    const rightText = shortenLine(props.rightText);
    const diff : [DiffResult, string][] = diff_wordMode(leftText, rightText);
    leftDiff = diff;
    rightDiff = diff;
  } else if (props.leftText) {
    const leftText = shortenLine(props.leftText);
    leftDiff = [[DiffResult.UNCHANGED, leftText]];
  } else if (props.rightText) {
    const rightText = shortenLine(props.rightText);
    rightDiff = [[DiffResult.UNCHANGED, rightText]];
  }
  const rowIsMoved = isMovedRow(props);

  /*
   * Adjust the relative widths of the line number colum vs the line data column.
   * Bootstrap uses 12 columns in their grid system, hence the magic number 12 here.
  */
  const lineNumberCols = 1;
  const dataCols = 12 - lineNumberCols;

  return (
    <Row className={props.different ? "changedRow" : "unchangedRow"}>
      <Col md={6}>
        <Row className="h-100">
          <Col md={lineNumberCols} className="lineNumber">{props.leftLineNum}</Col>
          <Col md={dataCols} id={props.leftLineNum ? "diffRow_left_" + props.leftLineNum : ""}
              className={"lineData " + (props.different ? "removed"  : "no-change")}>
                <pre>
            {leftDiff == null ?
              (rowIsMoved ?
                (<a href={"#diffRow_left_" + props.matchingRowNumber}> {"Moved from " + props.matchingRowNumber}</a>)
                : "") : (
              leftDiff.map((group, i) => (
                <span
                className={"left" + " " +
                (group[0] == DiffResult.ADDED ? "hide" : "show") + " "  +
                (group[0] == DiffResult.REMOVED ? (props.different ? "removed" : "different") : props.different ? "different" : "same")
              }
              key={i}
              >
            <Ansi>{group[1]}</Ansi>
              </span>
            )))
            }
            </pre>
          </Col>
        </Row>
      </Col>
      <Col md={6}>
        <Row className="h-100">
          <Col md={lineNumberCols} className="lineNumber">{props.rightLineNum}</Col>
          <Col md={dataCols} id={props.rightLineNum ? "diffRow_right_" + props.rightLineNum : ""}
              className={"lineData " + (props.different ? "added" : "no-change")}>
              <pre>
              {rightDiff == null ?
                (rowIsMoved ?
                  (<a href={"#diffRow_right_" + props.matchingRowNumber}> {"Moved to " + props.matchingRowNumber}</a>)
                  : "") : (
                rightDiff.map((group, i) => (
                <span
                  className={"right" + " " +
                  (group[0] == DiffResult.REMOVED ? "hide" : "show") + " "  +
                  (group[0] == DiffResult.ADDED ? (props.different ? "added" : "different") : props.different ? "different" : "same")
              }
              key={i}
              >
            <Ansi>{group[1]}</Ansi>
              </span>
            )))
            }
            </pre>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default DiffRow;
