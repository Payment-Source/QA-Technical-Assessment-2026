# PSI Software QA Tester - Technical Assessment 2026

## Prerequisites

1. Install an [LTS version of Node.js](https://nodejs.org/en/download/), which includes npm.
2. Fork this repository to your own GitHub account using [GitHub's forking guide](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo).
3. Clone your fork locally and open a terminal in its root folder (the folder containing `package.json`).
4. Create a `.env` file and paste in the contents from the ".env file contents" from the Technical Assessment Instructions doc.

Check that Node.js and npm are available:

```
node --version
npm --version
```

## Install dependencies

Run these commands from the repository root:

```
npm ci
npx playwright install --with-deps chromium
```

## How to run the framework

### How to run the tests

You can use either the command line or **Visual Studio Code's Playwright extension** to run the tests.

#### Using the command line

Run all tests from the command line:

```
npm test
```

#### Using Visual Studio Code's Playwright extension

To run and debug tests from the editor:

1. Install Microsoft's [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension.
2. Open the **Testing** panel to see the tests.
3. Click the run button beside the tests, or right-click a test to debug it.

### Viewing the test report

Running `npm test` generates an HTML report for the latest test run in `reports/html`. Each run overwrites the previous report.

Open the latest HTML report in your browser:

```
npm run test:report
```
