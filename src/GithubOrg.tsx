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
}

export async function loadGithubRepos({ params }: { params: Params }) {
  const { data } = await octokit.rest.repos.listForOrg({
    org: params.org,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });
  return { repos: data };
}

const GitHubOrg = () => {
  const { repos } = useLoaderData() as {
    repos: RestEndpointMethodTypes["repos"]["listForOrg"]["response"]["data"];
  };
  const params = useParams();

  return (
    <div>
      <h1>Github Repos for {params.org}</h1>
      <ul>
        {repos.map((i) => (
          <li key={i.id}>
            <Link to={i.name}>{i.name}</Link> - {i.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubOrg;
