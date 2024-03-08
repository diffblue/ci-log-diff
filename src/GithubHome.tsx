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
import { Link, useLoaderData } from "react-router-dom";

import { octokit } from "./util/Github";

export async function loadGithubOrgs() {
  const { data } = await octokit.rest.orgs.listForAuthenticatedUser();
  return { orgs: data };
}

const GitHubHome = () => {
  const { orgs } = useLoaderData() as {orgs: RestEndpointMethodTypes["orgs"]["listForAuthenticatedUser"]["response"]["data"]};

  return (
    <div>
      <h1>Github Organisations</h1>
      <ul>
        {orgs.map((i) => (
          <li key={i.id}>
            <Link to={i.login}>
              <img style={{ width: "50px" }} src={i.avatar_url} />
              {i.login}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubHome;
