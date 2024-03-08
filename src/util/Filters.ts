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

/**
 * The idea with this filter is that if it needs to remove something, then it must return the
 * modifications. Otherwise return the input line untouched.
 */
type FilterFunction = (line: string) => string;

/**
 * A filter function and a name/label for it.
 */
export type Filter = { name:string, filter: FilterFunction, active:boolean };

/**
 * The regex to use to extract the semver from a string.
 */
const semVerRegex =
  /(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9})(?:-(?:--+)?(?:0|[1-9]\d*|\d*[a-z]+\d*)){0,100}(?=$| |\+|\.)(?:(?<=-\S+)(?:\.(?:--?|[\da-z-]*[a-z-]\d*|0|[1-9]\d*)){1,100}?)?(?!\.)(?:\+(?:[\da-z]\.?-?){1,100}?(?!\w))?(?!\+)/gi;

/**
 * Finds the semvers in a string.
 *
 * @param line The string containing versions
 * @returns The list of versions present in the input string.
 */
function findVersions(line: string) {
  const regex = new RegExp(
    `(?:${semVerRegex})|(?:v?(?:\\d+\\.\\d+)(?:\\.\\d+)?)`,
    "g"
  );
  const matches = line.match(regex) ?? [];

  return [
    ...new Set(
      matches.map((match) =>
        match
          .trim()
          .replace(/^v/, "")
          .replace(/^\d+\.\d+$/, "$&.0")
      )
    ),
  ];
}

/**
 * Removes semver versions from the input line
 *
 * @param line The line to filter
 * @returns The modified line
 */
const versionFilter: FilterFunction = function (line: string): string {
  const versions = findVersions(line);
  versions.forEach((element) => {
    line = line.replace(element, "VERSION");
  });

  return line;
};

/**
 * Remove memory sizes from the input line
 *
 * @param line The line to filter
 * @returns The modified line
 */
const memoryFilter: FilterFunction = function (line: string): string {
  const regex = /([0-9]+.)?[0-9]+ ?[KMGT]i?B/gi;
  return line.replace(regex, "MEM-SIZE");
};

/**
 * Remove millisecond times from the input line
 *
 * @param line The line to filter
 * @returns The modified line
 */
const millisecondFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+ ?ms/gi;
  return line.replace(regex, "MILLISECONDS ");
};

/**
 * Remove seconds the input line
 *
 * @param line The line to filter
 * @returns The modified line
 */
const secondFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+(\.[0-9]+)?( ?s(ecs)?)|PT[0-9]+S/g;
  return line.replace(regex, "SECONDS$2");
};

/**
 * Remove minutes from the input line
 *
 * @param line The line to filter
 * @returns The modified line
 */
const minutesFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+( ?m(ins)?[^a-z])|PT[0-9]+M/g;
  return line.replace(regex, "MINUTES$2");
};

/**
 * Remove DD/MM/YY (or similar patterns) from the input line
 *
 * @param line The line to filter
 * @returns The modified line
 */
const dateFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+\/[0-9]+\/[0-9]+/gi;
  return line.replace(regex, "DATE");
};

/**
 * Remove timestamps of the form YYYY-MM-DDTHH:MM:SS.mmmm+ZZZZX
 * (timezone, milliseconds, colons, dashes and date portion optional)
 *
 * @param line The line to filter
 * @returns The modified line
 */
const timestampFilter: FilterFunction = function (line: string): string {
  const regex =
    /(?<![0-9])([1-2][0-9]{3}-?[0-1][0-9]-?[0-3][0-9]T)?[0-2][0-9]:?[0-5][0-9]:?[0-5][0-9](\.[0-9]*)?(\+[0-9]{4})?([A-Z]|UTC)?(?![0-9])/g;
  return line.replace(regex, "TIMESTAMP");
};

/**
 * Remove percentages
 *
 * @param line The line to filter
 * @returns The modified line
 */
const percentageFilter: FilterFunction = function (line: string): string {
  const regex = /( ?[0-9]+.)?[0-9]+ ?%/gi;
  return line.replace(regex, "PERCENTAGE");
};

/**
 * Remove Gradle's Process IDs
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradlePidFilter: FilterFunction = function (line: string): string {
  const regex = /pid: [0-9]+/gi;
  return line.replace(regex, "PID");
};

/**
 * Remove Gradle's Ordinal numbers (1st, 2nd, 3rd, etc.)
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleOrdinalFilter: FilterFunction = function (line: string): string {
  const ordinal = /[0-9]+ ?(th|st|nd)/gi;
  return line.replace(ordinal, "ORDINAL");
};

/**
 * Remove hashes (well, strings of more than eight hex digits)
 *
 * @param line The line to filter
 * @returns The modified line
 */
const sha1HashFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9a-f]{8,}/g;
  return line.replace(regex, "SHA1_HASH");
};

/**
 * Remove windows file paths
 *
 * @param line The line to filter
 * @returns The modified line
 */
const windowsPathFilter: FilterFunction = function (line: string): string {
  const windowsPath = /([ "=:'])[a-zA-Z]:[\\/]([a-zA-Z0-9.\-~]+[\\/])*/gi;
  return line.replace(windowsPath, "$1PATH\\");
};

/**
 * Remove linux file paths
 *
 * @param line The line to filter
 * @returns The modified line
 */
const linuxPathFilter: FilterFunction = function (line: string): string {
  const javaCommentRegex = /\/\/.*|\/\*\*.*/gi;
  if (line.match(javaCommentRegex)) return line;
  const midLineRegex = /([ "=:'])(\/[^/ ]*)+\/?/gi;
  line = line.replace(midLineRegex, "$1PATH");
  const beginLineRegex = /^(\/[^/ ]*)+\/?/;
  line = line.replace(beginLineRegex, "PATH$1");
  return line;
};

/**
 * Remove operating system details portion
 *
 * @param line The line to filter
 * @returns The modified line
 */
const operatingSystemDetailsFilter: FilterFunction = function (line: string): string {
  const regex = /Operating System: (Windows|Linux) .*$/gi;
  return line.replace(regex, "Operating System: $1 DETAILS");
};

/**
 * Remove http/https urls
 *
 * @param line The line to filter
 * @returns The modified line
 */
const urlFilter: FilterFunction = function (line: string): string {
  const regex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;
  return line.replace(regex, "URL");
};

/**
 * Remove the total git commit count
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gitTotalCommitCountFilter: FilterFunction = function (line: string): string {
  const regex = /git.total.commit.count with value [0-9]+/gi;
  return line.replace(
    regex,
    "git.total.commit.count with value GIT_COMMIT_COUNT"
  );
};

/**
 * Remove the total git host (this is the name of a server)
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gitHostFilter: FilterFunction = function (line: string): string {
  const regex = /git.build.host with value [a-zA-Z0-9]+/gi;
  return line.replace(regex, "git.build.host with value HOST");
};

/**
 * Remove the total git branch name
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gitBranchFilter: FilterFunction = function (line: string): string {
  const regex = /([^a-z]git.*) ([^/]+(\/[^/"]+)+)/gi;
  return line.replace(regex, "$1 BRANCH");
};

/**
 * Remove the maven properties file path
 *
 * @param line The line to filter
 * @returns The modified line
 */
const mavenPropertiesFileFilter: FilterFunction = function (line: string): string {
  const regex = /file \[(\/[^/ ]*)+\/?\]/;
  return line.replace(regex, "file [PROPERTIES_PATH]");
};

/**
 * Remove the gradle feature deprecation notice
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleDeprecationWarningFilter: FilterFunction = function (line: string): string {
  const regex =
    /Deprecated Gradle features were used in this build, making it incompatible with Gradle ([0-9]+.[0-9]+)\./gi;
  return line.replace(regex, "GRADLE DEPRECATION WARNING");
};

/**
 * Remove gradle test executor's ID
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleExecutorFilter: FilterFunction = function (line: string): string {
  const regex = /Gradle Test Executor [0-9]+/gi;
  return line.replace(regex, "Gradle Test Executor EXECUTOR_ID");
};

/**
 * Remove the gradle daemon worker ID
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleDaemonWorkerFilter: FilterFunction = function (line: string): string {
  const regex = /Daemon worker,[0-9]+,main/gi;
  return line.replace(regex, "Daemon worker,WORKER_ID,main");
};

/**
 * Remove gradle daemon worker thread ID
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleDaemonWorkerThreadFilter: FilterFunction = function (line: string): string {
  const regex = /Daemon worker Thread [0-9]+,[0-9]+,main/gi;
  return line.replace(regex, "Daemon worker Thread NUMBER,WORKER_ID,main");
};

/**
 * Remove gradle execution worker
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleExecutionWorkerFilter: FilterFunction = function (line: string): string {
  const regex = /Execution worker for ':',[0-9]+,main/gi;
  return line.replace(regex, "Execution worker for ':',NUMBER,main");
};

/**
 * Remove daemon-pid.out.log
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleDaemonOutputLogFilter: FilterFunction = function (line: string): string {
  const regex = /daemon-[0-9]+.out.log/gi;
  return line.replace(regex, "daemon-NUMBER.out.log");
};

/**
 * Remove number of gradle tasks executed
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleExecutableFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+ actionable tasks: [0-9]+ executed, [0-9]+ up-to-date/gi;
  return line.replace(regex, "X actionable tasks: Y executed, Z up-to-date");
};

/**
 * Remove number of classes gradle compile
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleClassesFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+ class(es)?/gi;
  return line.replace(regex, "NUMBER classes");
};

/**
 * Remove number of worker leases
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleWorkerLeasesFilter: FilterFunction = function (line: string): string {
  const regex = /Using [0-9]+ worker leases/gi;
  return line.replace(regex, "Using N worker leases");
};

/**
 * Remove gradle GC rate
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleGCRateFilter: FilterFunction = function (line: string): string {
  const regex = /rate: [0-9]+.[0-9]+\/[a-z]/gi;
  return line.replace(regex, "rate: RATE");
};

/**
 * Remove the number of tests completed/failed
 *
 * @param line The line to filter
 * @returns The modified line
 */
const gradleTestCompleteFailedFilter: FilterFunction = function (line: string): string {
  const regex = /[0-9]+ tests? completed, [0-9]+ failed/gi;
  return line.replace(regex, "X test(s) completed, Y failed");
};

/**
 * Remove JVM run time
 *
 * @param line The line to filter
 * @returns The modified line
 */
const jvmRunningFilter: FilterFunction = function (line: string): string {
  const regex = /(JVM running for [0-9]+.[0-9]+)/gi;
  return line.replace(regex, "(JVM running for SECONDS)");
};

const jvmArgsFilter: FilterFunction = function (line: string): string {
  const regex = /JVM_ARGS=.*/;
  return line.replace(regex, "JVM_ARGS=ARGS");
};

/**
 * Remove spring end point filter
 *
 * @param line The line to filter
 * @returns The modified line
 */
const springEndpointFilter: FilterFunction = function (line: string): string {
  const regex = /Exposing [0-9]+ endpoint\(s\)/gi;
  return line.replace(regex, "Exposing N endpoint(s)");
};

/**
 * Remove embedded tomcat port
 *
 * @param line The line to filter
 * @returns The modified line
 */
const springTomcatPortFilter: FilterFunction = function (line: string): string {
  const regex = /port\(s\): [0-9]+/;
  return line.replace(regex, "port(s): PORT_NUMBER");
};

/**
 * Remove IPv4 addresses
 *
 * @param line The line to filter
 * @returns The modfied line
 */
const ipAddressFilter: FilterFunction = function (line: string): string {
  const regex = /((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}/;
  return line.replace(regex, "IPv4_ADDRESS");
};

/**
 * Remove spring test hostname
 *
 * @param line The line to filter
 * @returns The modified line
 */
const springTestHostNameFilter: FilterFunction = function (line: string): string {
  const regex = /on [^ ]+ with PID [0-9]+ \(started by [^ ]+ /;
  return line.replace(regex, "on HOST with PID PID (started by HOST ");
};

/**
 * Remove spring application context cache statistics
 *
 * @param line The line to filter
 * @returns The modified line
 */
const springCacheStatisticsFilter: FilterFunction = function (line: string): string {
  const regex =
    /Spring test ApplicationContext cache statistics: \[.*@.* size = [0-9]+, maxSize = [0-9]+, parentContextCount = [0-9]+, hitCount = [0-9]+, missCount = [0-9]+\]/;
  return line.replace(
    regex,
    "Spring test ApplicationContext cache statistics: " +
      "[CACHE_CLASS@ADDRESS size = SIZE, maxSize = MAX_SIZE, " +
      "parentContextCount = PARENT_CONTEXT_COUNT, hitCount = HIT_COUNT, missCount = MISS_COUNT]"
  );
};

/**
 * Remove hexadecimal numbers
 *
 * Things that are 4 or more characters long and contain only hexadecimal characters
 *
 * @param line The line to filter
 * @returns The modified line
 */
const hexFilter: FilterFunction = function (line: string): string {
  return line.replace(/[0-9a-fA-F]{4,}/g, "0");
};

/**
 * Remove numbers
 *
 * Any remaining run of 0-9 or . character
 *
 * @param line The line to filter
 * @returns The modified line
 */
const numFilter: FilterFunction = function (line: string): string {
  return line.replace(/[0-9]+(\.[0-9]+)?/g, "0");
};

/**
 * Remove apache http wire debug lines
 *
 * They are very long and likely to contain useless tiny changes.
 *
 * @param line The line to filter
 * @returns The modified line
 */
const apacheHttpWireFilter: FilterFunction = function (line: string): string {
  const regex = /DEBUG org\.apache\.http\.wire.*$/;
  return line.replace(regex, "DEBUG org.apache.http.wire ...");
};

/**
 * The complete list of filters to apply to lines of the input.
 *
 * Order is important as the filters will be applied in this order. You'll find that some of the
 * filters will impact others (e.g. the IPv4 filter looks at the same sort of pattern as the semver version filter.)
 */
export const defaultFilters: Filter[] = [
  {name: "hexFilter", filter: hexFilter, active: true}, // Should appear before the number filter
  {name: "numFilter", filter: numFilter, active: true},
  // {name: "ipAddressFilter", filter: ipAddressFilter, active: true}, // should appear before the version filter
  // {name: "versionFilter", filter: versionFilter, active: true},
  {name: "memoryFilter", filter: memoryFilter, active: true},
  {name: "apacheHttpWireFilter", filter: apacheHttpWireFilter, active: true},
  // {name: "millisecondFilter", filter: millisecondFilter, active: true},
  // sha1{name: "HashFilter", filter: HashFilter, active: true},
  // {name: "timestampFilter", filter: timestampFilter, active: true},
  // {name: "secondFilter", filter: secondFilter, active: true},
  // {name: "minutesFilter", filter: minutesFilter, active: true},
  // {name: "dateFilter", filter: dateFilter, active: true},
  // {name: "percentageFilter", filter: percentageFilter, active: true},
  {name: "gitHostFilter", filter: gitHostFilter, active: true},
  // {name: "gitTotalCommitCountFilter", filter: gitTotalCommitCountFilter, active: true},
  {name: "gitBranchFilter", filter: gitBranchFilter, active: true},
  // {name: "gradlePidFilter", filter: gradlePidFilter, active: true},
  // {name: "gradleOrdinalFilter", filter: gradleOrdinalFilter, active: true},
  {name: "urlFilter", filter: urlFilter, active: true},
  {name: "windowsPathFilter", filter: windowsPathFilter, active: true},
  {name: "linuxPathFilter", filter: linuxPathFilter, active: true},
  {name: "operatingSystemDetailsFilter", filter: operatingSystemDetailsFilter, active: true},
  // {name: "gradleDeprecationWarningFilter", filter: gradleDeprecationWarningFilter, active: true},
  // {name: "gradleExecutorFilter", filter: gradleExecutorFilter, active: true},
  // {name: "gradleExecutionWorkerFilter", filter: gradleExecutionWorkerFilter, active: true},
  // {name: "gradleDaemonWorkerFilter", filter: gradleDaemonWorkerFilter, active: true},
  // {name: "gradleDaemonWorkerThreadFilter", filter: gradleDaemonWorkerThreadFilter, active: true},
  // {name: "gradleDaemonOutputLogFilter", filter: gradleDaemonOutputLogFilter, active: true},
  // {name: "gradleExecutableFilter", filter: gradleExecutableFilter, active: true},
  // {name: "gradleClassesFilter", filter: gradleClassesFilter, active: true},
  // {name: "gradleWorkerLeasesFilter", filter: gradleWorkerLeasesFilter, active: true},
  // {name: "gradleGCRateFilter", filter: gradleGCRateFilter, active: true},
  // {name: "gradleTestCompleteFailedFilter", filter: gradleTestCompleteFailedFilter, active: true},
  {name: "mavenPropertiesFileFilter", filter: mavenPropertiesFileFilter, active: true},
  // {name: "jvmRunningFilter", filter: jvmRunningFilter, active: true},
  // {name: "jvmArgsFilter", filter: jvmArgsFilter, active: true},
  // {name: "springEndpointFilter", filter: springEndpointFilter, active: true},
  // {name: "springTomcatPortFilter", filter: springTomcatPortFilter, active: true},
  // {name: "springTestHostNameFilter", filter: springTestHostNameFilter, active: true},
  // {name: "springCacheStatisticsFilter", filter: springCacheStatisticsFilter, active: true},
];

/**
 * Applies the filters passed in to the input lines.
 *
 * @param lines The single line input.
 * @param filters The filters to apply
 * @returns The modified lines
 */
export function applyFilters(lines: string, filters: Filter[]): string {
  let data = lines.split("\n");
  filters.forEach((filter) => {
    if (filter.active) {
      data = data.map(filter.filter);
    }
  });
  return data.join("\n");
}
