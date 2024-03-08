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

import "./App.css";

import { Octokit } from "@octokit/core";
import { useState, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import { Link, Outlet } from "react-router-dom";

import Inspect from "./assets/inspect.png";

function App() {
  const [githubUser, setGithubUser] = useState<string | undefined>();

  function githubLogout() {
    localStorage.removeItem("githubToken");
    setGithubUser(undefined);
  }

  useEffect(() => {
    async function fetchUserName(octokit: Octokit) {
      const {
        data: { login },
      } = await octokit.request("GET /user");
      setGithubUser(login);
    }
    const token = localStorage.getItem("githubToken");
    if (token) {
      const octokit = new Octokit({
        auth: token,
      });
      void fetchUserName(octokit);
    }
  });

  return (
    <>
      <Container fluid={true}>
        <Row>
          <Col>
            <h1>
              <Image src={Inspect} rounded /> CI Log Diff
            </h1>
          </Col>
        </Row>
        <Row>
          <Col>{}</Col>
        </Row>
        <Row>
          <Col>
            {Outlet({}) ?? (
              <ul>
                <li>
                  {githubUser ? (
                    <p>
                      Logged in to github as {githubUser}
                      <button onClick={githubLogout}>Logout</button>
                    </p>
                  ) : (
                    <a
                      href={
                        "https://github.com/login/oauth/authorize?scope=repo&client_id=2c9e500d4358df4e972e&redirect_uri=" +
                        encodeURIComponent(document.location.href)
                      }
                    >
                      Log in with GitHub
                    </a>
                  )}
                </li>
                {githubUser ? (
                  <li>
                    <Link to="github">Browse github projects</Link>
                  </li>
                ) : null}
                <li>
                  <Link to="upload">Upload files</Link>
                </li>
              </ul>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
