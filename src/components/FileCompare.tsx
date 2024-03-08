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

import { useState } from "react";
import Container from "react-bootstrap/Container"

import {
  callDiffAlgoOnStrings,
  DiffResult,
} from "../util/DiffAlgo";
import {defaultFilters, Filter} from "../util/Filters.ts";

import FileCompareSettings from "./FileCompareSettings.tsx";
import FileForm from "./FileForm";
import ShowDiff from "./ShowDiff";


const readAsText = (file: File) => {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

async function readFiles(file1: File, file2: File) {
  const [contents1, contents2] = await Promise.all([
    readAsText(file1),
    readAsText(file2),
  ]);
  return {contents1, contents2};
}
function FileCompare() {
  let diffIDsToOriginalLeftText: Map<number, string> | undefined;
  let diffIDsToOriginalRightText: Map<number, string> | undefined;
  let diffLineNums: DiffResult[] | undefined;
  let diffIDsToFilteredText: Map<number, string> | undefined;
  const [activeFilters, setActiveFilters] = useState<Filter[]>(defaultFilters);
  const [leftText, setLeftText] = useState<string | undefined>();
  const [rightText, setRightText] = useState<string | undefined>();

  function doDiff(file1: File, file2: File) {
    readFiles(file1, file2)
      .then(
        ({contents1, contents2}) => {
          setLeftText(contents1);
          setRightText(contents2);
        }
      )
      .catch((e) => console.error(e));
  }

  function quickTest() {
    setLeftText("file1\nchris\nthisIsMove\nbob\nchristmas karol\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nwarry\ntarry\narny");
    setRightText("file2\nchris\nbob\nchristmas carol\nthisIsMove\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nharry\nbarry\nlarry\nmarry\nwarry\ntarry\narnold");
  }

  function addToFilter() {
    const selection = window.getSelection();
    if (selection) {
      const selectedString = selection.toString();
      console.log(selectedString);
      const newFilterFunc = function (line: string): string {
        const regex = new RegExp(".*" + selectedString + ".*","g");
        return line.replace(regex, "MANUAL FILTER: " + selectedString);
      }
      const filters = [...activeFilters];
      filters.push({name: "MANUAL FILTER: " + selectedString, filter: newFilterFunc, active: true});
      setActiveFilters(filters);
    }
  }
  function toggleFilter(name: string) {
    const filters = [...activeFilters];
    for (const filter of filters) {
      if (filter.name == name) {
        filter.active = !filter.active;
        setActiveFilters(filters);
      }
    }
  }

  if (rightText && leftText) {
    const diffResult = callDiffAlgoOnStrings(leftText, rightText, activeFilters);
    diffIDsToOriginalLeftText = diffResult.diffIDsToOriginalLeftText;
    diffIDsToOriginalRightText = diffResult.diffIDsToOriginalRightText;
    diffLineNums = diffResult.diffLineNums;
    diffIDsToFilteredText = diffResult.diffIDsToFilteredText;
  }

  return (
    <>
      {diffLineNums &&
      diffIDsToOriginalLeftText &&
      diffIDsToOriginalRightText &&
      diffIDsToFilteredText ? (
      <>
        <FileCompareSettings filters={activeFilters} addToFilter={addToFilter} toggleFilter={toggleFilter} quickTest={quickTest} />
        <Container fluid className="lineData">
        <ShowDiff
                diffLineNums={diffLineNums}
                diffIDsToOriginalLeftText={diffIDsToOriginalLeftText}
                diffIDsToOriginalRightText={diffIDsToOriginalRightText}
                diffIDsToFilteredText={diffIDsToFilteredText} />
        </Container>
      </>
      ) : (
        <Container>
          <FileForm doDiff={doDiff} />
        </Container>
      )}

    </>
  );
}

export default FileCompare;
