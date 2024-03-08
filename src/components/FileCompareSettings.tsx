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

import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import { Filter } from "../util/Filters.ts";

import FilterComponent from "./FilterComponent.tsx";



interface Properties {
    filters: Filter[];
    addToFilter: () => void;
    toggleFilter: (name: string) => void;
    quickTest: () => void;
  }

function FileCompareSettings(props: Properties) {
    return (<>
        <Container fluid="true">
            <Form.Group>
            <Row>

                <Col>
                    <Row>
                        <Col><FontAwesomeIcon icon={faChevronUp} /></Col>
                        <Col><FontAwesomeIcon icon={faChevronDown} /></Col>
                    </Row>
                </Col>


                <Col>
                    <Form.Select>
                        <option>Do not ignore</option>
                        <option>Trim whitespace</option>
                        <option>Ignore whitespaces</option>
                        <option>Ignore whitespaces and empty lines</option>
                    </Form.Select>
                </Col>

                <Col>
                    <Form.Select>
                        <option>Highlight Lines</option>
                        <option>Highlight words</option>
                        <option>Highlight split changes</option>
                        <option>Highlight characters</option>
                        <option>Do not highlight</option>
                    </Form.Select>
                </Col>

                <Col>
                    <Form.Check label="Collapse unchanged fragments" checked/>
                </Col>
                <Col>
                    <Form.Check label="Synchronise scrolling"/>
                </Col>
                <Col>
                    <Form.Check label="Show annotations"/>
                </Col>
                {/* <Col>
                    <FilterComponent filters={props.filters} addToFilter={props.addToFilter} toggleFilter={props.toggleFilter}/>
                </Col> */}
            </Row>
            </Form.Group>
        </Container>
    </>)
}

export default FileCompareSettings
