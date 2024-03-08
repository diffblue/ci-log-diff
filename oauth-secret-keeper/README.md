<div align="center">

  <h1>Oauth Secret Keeper</h1>

  <p>Express.js app to issue Github tokens for use by otherwise static sites. Stateless - the token
  is sent to the front end which stores it in LocalStorage.</p>

  <p>Based on <a href="http://github.com/Louis3797/express-ts-boilerplate">
  Louis3797/express-ts-boilerplate</a> and examples for
  <a href="https://github.com/octokit/plugin-rest-endpoint-methods.js">
  @octokit/plugin-rest-endpoint-methods</a>.</p>
</div>

<br />

<!-- Table of Contents -->
# Table of Contents

- [About the Project](#about-the-project)
  * [Tech Stack](#tech-stack)
  * [Features](#features)
  * [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Linting](#linting)
  * [Running Tests](#running-tests)
  * [Run Locally](#run-locally)
  * [Run with Docker](#run-with-docker)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)


<!-- About the Project -->
## About the Project

<!-- TechStack -->
### Tech Stack

- ***Express.js***
- ***Typescript***
- ***Yarn***


<!-- Features -->
### Features

- ***Package managament*** with Yarn
- ***Testing*** with Jest and Supertest
- ***Cross-Origin Resource-Sharing*** enabled using cors
- ***Secured HTTP Headers*** using helmet
- ***Logging*** with winston
- ***Environment variables*** using dotenv
- ***Compression*** with gzip
- ***Git hooks*** with husky and lint-staged
- ***Linting and enforced code style*** using Eslint and Prettier
- ***Containerization*** with Docker


<!-- Env Variables -->
### Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NODE_ENV`

`PORT`

`CORS_ORIGIN`

`GITHUB_CLIENT_ID`

`GITHUB_CLIENT_SECRET`

See .env.example for further details

<!-- Getting Started -->
## Getting Started

<!-- Prerequisites -->
### Prerequisites

This project uses Yarn as package manager

```bash
 npm install --global yarn
```

<!-- Installation -->
### Installation

```bash
  git clone https://github.com/diffblue/ci-log-diff.git
```

Go to the project directory

```bash
  cd express-ts-boilerplate
```

```bash
  yarn install
```

### Linting

```bash
  # run ESLint
  yarn lint

  # fix ESLint errors
  yarn lint:fix

  # run prettier
  yarn code:check

  # fix prettier errors
  yarn code:format

  # fix prettier errors in specific file
  yarn code:format:specific-file <file-name>
```

<!-- Running Tests -->
### Running Tests

To run tests, run the following command

```bash
  yarn test
```

<!-- Run Locally -->
### Run Locally

Start the server in development mode

```bash
  yarn dev
```

Start the server in production mode

```bash
  yarn start
```

<!-- Run with Docker -->
### Run with Docker

Build the container

```bash
  cd express-ts-boilerplate
  docker build . -t express-ts-boilerplate
```

Start the container

```bash
  docker run -p <port you want the container to run at>:4040 -d express-ts-boilerplate
```

<!-- Contact -->
## Contact

Robert (Jamie) Munro

Project Link: [https://github.com/diffblue/ci-log-diff](https://github.com/diffblue/ci-log-diff)

<!-- Acknowledgments -->
## Acknowledgements

 - [Readme Template](https://github.com/Louis3797/awesome-readme-template)
 - [express-ts-boilerplate](http://github.com/Louis3797/express-ts-boilerplate)

<!-- License -->
## License

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
