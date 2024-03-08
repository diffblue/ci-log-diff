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

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";
import FileCompare from "./components/FileCompare.tsx";
import GithubCompareRuns, { loadGithubRuns } from "./GithubCompareRuns.tsx";
import GithubHome, { loadGithubOrgs } from "./GithubHome.tsx";
import GithubOrg, { loadGithubRepos } from "./GithubOrg.tsx";
import GithubRepo, { loadGithubBranches } from "./GithubRepo.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

// Check for github token login before starting the app
const url = new URL(location.href);
const code = url.searchParams.get("code");
if (code) {
  // remove ?code=... from URL
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  history.replaceState({}, "", url.toString());

  // exchange the code for a token with the backend.
  const response = await fetch("http://localhost:8080/api/github/oauth/token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const responseData: { authentication: { token: string } } =
    await response.json();
  const token: string = responseData.authentication.token;
  // `token` is the OAuth Access Token that can be used
  localStorage.setItem("githubToken", token);
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "upload",
        element: <FileCompare />,
      },
      {
        path: "github",
        element: <GithubHome />,
        loader: loadGithubOrgs,
      },
      {
        path: "github/:org",
        element: <GithubOrg />,
        loader: loadGithubRepos,
      },
      {
        path: "github/:org/:repo",
        element: <GithubRepo />,
        loader: loadGithubBranches,
      },
      {
        path: "github/:org/:repo/compareRuns/:leftId/:rightId",
        element: <GithubCompareRuns />,
        loader: loadGithubRuns,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
