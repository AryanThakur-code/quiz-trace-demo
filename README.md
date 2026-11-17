# Quiz Trace Demo

A terminal app that uses the separately installed [`quiz-trace-replay`](https://www.npmjs.com/package/quiz-trace-replay) npm package. The app owns the question text, choices, and answer keys. The package owns adaptive selection and the replayable decision trail.

## Run after the package is published

With Node.js 22 or later, run:

```sh
npm install
npm run demo
npm run play
```

`npm run demo` submits three correct answers to move from Medium to Hard, then two incorrect answers. It prints the target difficulty decisions and checks that a replay of the answer events reconstructs the same report. `npm run play` lets you answer the questions yourself.

## Try both folders before publication

From the sibling `quiz-trace-replay` folder run `npm test` and `npm pack`. In this demo folder run:

```sh
npm install --no-save --package-lock=false ../quiz-trace-replay/quiz-trace-replay-0.1.1.tgz
npm run demo
```

The demo consumes the installable package through npm. Once the registry release is available, install from the registry and generate a fresh lockfile for the demo repository.
