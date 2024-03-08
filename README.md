# Log diff

<!-- Badges -->
<p>
  <a href="https://github.com/diffblue/ci-log-diff/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/diffblue/ci-log-diff" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/diffblue/ci-log-diff" alt="last update" />
  </a>
  <a href="https://github.com/diffblue/ci-log-diff/network/members">
    <img src="https://img.shields.io/github/forks/diffblue/ci-log-diff" alt="forks" />
  </a>
  <a href="https://github.com/diffblue/ci-log-diff/stargazers">
    <img src="https://img.shields.io/github/stars/diffblue/ci-log-diff" alt="stars" />
  </a>
  <a href="https://github.com/diffblue/ci-log-diff/issues/">
    <img src="https://img.shields.io/github/issues/diffblue/ci-log-diff" alt="open issues" />
  </a>
  <a href="https://github.com/diffblue/ci-log-diff/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/diffblue/ci-log-diff.svg" alt="license" />
  </a>
</p>

<h4>
    <a href="https://github.com/diffblue/ci-log-diff">Documentation</a>
  <span> · </span>
    <a href="https://github.com/diffblue/ci-log-diff/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/diffblue/ci-log-diff/issues/">Request Feature</a>
  </h4>

## Introduction

Have you ever had a CI job fail, and had to page though masses of logs saying things downloaded,
things worked successfully, things installed, etc. before you reach the actual failure point?  Have
you tried searching for strings like "Error" or "Failure" only to be taken to a line that says "0
Failures" or "0 Errors", or even worse to a line that says failure, but it's turns out that it's
normal for that to fail - perhaps it's part of a test of error trapping code? Sometimes you can
find the error quickly by skipping to the bottom and working backwards, but if the error doesn't
quite make sense you have a suspicion that something out of the ordinary may have happened earlier
in the build process, but it's like a needle in a haystack to find it?

Then you need Log diff. This will eliminate everything "normal" from your logs by comparing it to
logs of previous successful runs. You will be placed straight at the first line that contains
something out of the ordinary, with all the normal lines collapsed down out of your way (You can
expand a few lines of context if you need to figure out where you are). You can call up a
side-by-side view with the closest lines on the last successful run (perhaps with a side by side
view). As you scroll down, any lines that occurred in the last successful run will be hidden by
default. Any lines you see will be related to the error, or to new code or tests that are part of
your branch.

The whole thing runs in a browser to avoid putting load on any server. Initially you will be able to
upload 2 log files, integration with github actions for logs will follow.

## Developing

This project is written in Typescript with the React frontend framework, and yarn package manager.
It uses the vite project for building and compiling.

Prerequisites:

* A recent version of Nodejs
  ([nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) is a handy tool
  for managing multiple versions installed on the same machine)
* Yarn ([See the installation instructions](https://yarnpkg.com/getting-started/install))
* Microsoft Visual Studio Code is recommended as it has very good TypeScript / React support and
  includes Live Share which allows remote paring for free. The paid versions of IntelliJ might also
  have good TypeScript support.

To set up on your machine:

* git clone the project
* `cd log-diff`
* Run `yarn` to install the dependencies
* Run `yarn dev` to run the development server
* Visit the URL it gives you in your browser - usually something like `http://localhost:5173/`

The development server has some tricks up it's sleeve. It will automatically compile the project
when it starts up and will monitor for changes to the source and try to update them in the browser
if possible. It also enhances error messages and provides debug symbols to the browser to use in
it's developer tools (sourcemap files).

Additional commands you can pass to yarn are listed in the scripts section of `package.json`. They
include:

* `yarn build`: Build the project
* `yarn lint`: Check the project with the ESLint linter that is configured
* `yarn preview`: Preview the site on a local web browser from the build output, without the extra
  features of `yarn dev`

----
Copyright 2022-2024 Diffblue Limited

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
