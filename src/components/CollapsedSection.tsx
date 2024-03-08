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

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {DiffRowProperties} from "./DiffRow.tsx";

export interface CollapsedSectionProperties {
  rowsInside: DiffRowProperties[];
  uncollapseLines: (lines: number[]) => void;
}

const uncollapseAmount = 5;
function CollapsedSection(props: CollapsedSectionProperties) {
  const smallUncollapse = props.rowsInside.length <= uncollapseAmount;
  function uncollapse(rows: DiffRowProperties[]) {
    props.uncollapseLines(rows.map(r => r.rowKey));
  }
  function uncollapseAll() {
    uncollapse(props.rowsInside);
  }
  function uncollapseUp() {
    uncollapse(props.rowsInside.slice(0, uncollapseAmount));
  }
  function uncollapseDown() {
    uncollapse(props.rowsInside.slice(-uncollapseAmount));
  }
  return (
      smallUncollapse ?
        <Row className="collapsed">
          <Col onClick={uncollapseAll}>Collapsed {props.rowsInside.length} rows, click to expand</Col>
        </Row>
        :
        <>
          <Row className="collapsed">
            <Col onClick={uncollapseUp}>Collapsed {props.rowsInside.length} rows, click to expand above</Col>
          </Row>
          <Row className="collapsed">
            <Col onClick={uncollapseDown}>Collapsed {props.rowsInside.length} rows, click to expand below</Col>
          </Row>
        </>
    )
  ;
}

export default CollapsedSection;
