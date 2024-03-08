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

import {ChangeEvent} from "react";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

interface Properties {
  /** Callback */
  doDiff: (file1: File, file2: File) => void;
}

function FileForm(props: Properties) {
  const submitFiles = () => {
    const input1 = document.getElementById(`file1`) as HTMLInputElement;
    const input2 = document.getElementById(`file2`) as HTMLInputElement;

    if (input1 && input2 && input1.files && input2.files) {
      const file1 = input1.files[0];
      const file2 = input2.files[0];
      props.doDiff(file1, file2);
    } else {
      // error
      throw new Error(`You must select 2 files`);
    }
  };
  const filesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length != 2) {
      alert('Select exactly two files');
      return;
    }
    props.doDiff(files[0], files[1]);
  }
  return (
    <>
  <Container>
      {/* <form><label>For quick testing: Multi-file upload <input type="file" id="multifile" multiple onChange={filesSelected}/></label></form> */}
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>First file</Form.Label>
            <Form.Control type="file" id="file1" />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Second file</Form.Label>
            <Form.Control type="file" id="file2" />
          </Form.Group>
        </Row>
        <Button type="button" onClick={submitFiles}>Submit</Button>
      </Form>
    </Container>
    </>
  );
}

export default FileForm;
