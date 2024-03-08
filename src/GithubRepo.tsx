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
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { Link, useLoaderData, useParams } from "react-router-dom";

import { octokit } from "./util/Github";

interface Params {
  org: string;
  repo: string;
}

async function getCommit(owner: string, repo: string, ref: string) {
  const { data } = await octokit.rest.repos.getCommit({ owner, repo, ref });
  return data;
}

interface LoaderData {
  branches: {
    branch: RestEndpointMethodTypes["repos"]["listBranches"]["response"]["data"][1];
    commit: RestEndpointMethodTypes["repos"]["getCommit"]["response"]["data"];
  }[];
}

export async function loadGithubBranches({
  params,
}: {
  params: Params;
}): Promise<LoaderData> {
  const { data } = await octokit.rest.repos.listBranches({
    owner: params.org,
    repo: params.repo,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });
  const branches = data.map(async (i) => ({
    branch: i,
    commit: await getCommit(params.org, params.repo, i.commit.sha),
  }));
  return {
    branches: await Promise.all(branches),
  };
}

const GitHubRepo = () => {
  const { branches } = useLoaderData() as LoaderData;

  const params = useParams();

  return (
    <div>
      <h1>
        Branches for {params.org}/{params.repo}
      </h1>
      <ul>
        {branches.map((i) => (
          <li style={{ clear: "both", textAlign: "left" }} key={i.branch.name}>
            <img
              style={{ width: "50px", float: "left" }}
              src={i.commit.author?.avatar_url}
            />
            <Link to={`branches/${i.branch.name}`}>{i.branch.name}</Link>
            <br />
            {i.commit.author?.login} - {i.commit.commit.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubRepo;
