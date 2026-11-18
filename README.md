# PaySimply Review-screen QA assessment

## Prerequisites

1. Install an [LTS version of Node.js](https://nodejs.org/en/download/), which includes npm.
2. Download or clone this repository and open a terminal in its root folder (the folder containing `package.json`).
3. Place the supplied `.env` file in that same folder. Playwright loads it automatically when tests run.

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

## Run tests from the command line

```
# Run all tests
npm test

# Run one test file
npx playwright test tests/psw01.spec.js

# Run by test case tag
npx playwright test --grep "@PSW-01"

# Open the latest HTML report
npm run test:pw:report
```

Tests run in Chromium with a visible browser window.

## VS Code extension

To run and debug tests from the editor:

1. Install [Visual Studio Code](https://code.visualstudio.com/) and open this repository's folder.
2. Install Microsoft's [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension.
3. Complete the dependency installation above, then open the **Testing** panel to see the tests.
4. Click the run button beside a test to run it, or right-click a test to debug it.
