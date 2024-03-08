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

// Component to show github login and details
import { useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";

import FilterComponent from "./components/FilterComponent";
import ShowDiff from "./components/ShowDiff";
import { callDiffAlgoOnStrings } from "./util/DiffAlgo";
import { Filter, defaultFilters } from "./util/Filters";
import { octokit } from "./util/Github";

interface Params {
  org: string;
  repo: string;
  leftId: string;
  rightId: string;
}

interface LoaderData {
  logs: {
    left: string;
    right: string;
  };
}

async function fetchLog(owner: string, repo: string, job_id: number) {
  const logResponse = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
    owner,
    repo,
    job_id,
  });
  const logRequest = await fetch(logResponse.url);
  return await logRequest.text();
}

export async function loadGithubRuns({
  params,
}: {
  params: Params;
}): Promise<LoaderData> {
  const leftLogsPromise = fetchLog(
    params.org,
    params.repo,
    Number(params.leftId),
  );

  const rightLogsPromise = fetchLog(
    params.org,
    params.repo,
    Number(params.rightId),
  );

  return {
    logs: {
      left: await leftLogsPromise,
      right: await rightLogsPromise,
    },
  };
}

const GithubCompareRuns = () => {
  const { logs } = useLoaderData() as LoaderData;
  const [activeFilters, setActiveFilters] = useState<Filter[]>(defaultFilters);

  const params = useParams();


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

  const {
    diffLineNums,
    diffIDsToOriginalLeftText,
    diffIDsToOriginalRightText,
    diffIDsToFilteredText,
  } = callDiffAlgoOnStrings(logs.left, logs.right, activeFilters);

  return (
    <>
      <h1>
        Compare github actions runs on {params.org}/{params.repo}
      </h1>
      <ShowDiff
        diffLineNums={diffLineNums}
        diffIDsToOriginalLeftText={diffIDsToOriginalLeftText}
        diffIDsToOriginalRightText={diffIDsToOriginalRightText}
        diffIDsToFilteredText={diffIDsToFilteredText}
      />
    </>
  );
};

export default GithubCompareRuns;
