'use strict';

const assert = require('node:assert/strict');
const { createInterface } = require('node:readline/promises');
const { createQuiz, replayQuiz } = require('quiz-trace-replay');

const items = [
  { id: 'A1', level: 2, prompt: 'Solve 2x + 3 = 11.', choices: ['2', '3', '4', '5'], answer: 'C' },
  { id: 'A2', level: 2, prompt: 'Solve 3x - 7 = 8.', choices: ['4', '5', '6', '7'], answer: 'B' },
  { id: 'A3', level: 2, prompt: 'Solve 4x + 1 = 25.', choices: ['4', '5', '6', '7'], answer: 'C' },
  { id: 'A4', level: 3, prompt: 'What is the positive solution of x^2 - 9 = 0?', choices: ['-9', '-3', '3', '9'], answer: 'C' },
  { id: 'A5', level: 3, prompt: 'What is the larger root of x^2 - 5x + 6 = 0?', choices: ['1', '2', '3', '6'], answer: 'C' },
  { id: 'A6', level: 1, prompt: 'Solve x + 2 = 5.', choices: ['2', '3', '5', '7'], answer: 'B' }
];
const names = ['Easy', 'Medium', 'Hard'];
const labels = {
  HOLD: 'Same target',
  THREE_CORRECT: 'Target raised after three correct answers',
  TWO_INCORRECT: 'Target lowered after two incorrect answers',
  AT_HIGHEST: 'Already at the highest level',
  AT_LOWEST: 'Already at the lowest level'
};

async function run() {
  const play = process.argv.includes('--play');
  const input = play ? createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) }) : null;
  const settings = {
    seed: 'algebra-practice',
    limit: 5,
    questions: items.map(({ id, level }) => ({ id, level, topic: 'Algebra' }))
  };
  const quiz = createQuiz(settings);
  const byId = new Map(items.map(item => [item.id, item]));

  try {
    for (let next = quiz.nextQuestion(); next; next = quiz.nextQuestion()) {
      const item = byId.get(next.id);
      let choice = item.answer;
      if (input) {
        console.log(`\nQuestion ${next.position} (${names[next.level - 1]})\n${item.prompt}`);
        item.choices.forEach((text, i) => console.log(`${'ABCD'[i]}. ${text}`));
        do {
          choice = (await input.question('Choose A, B, C, or D: ')).trim().toUpperCase();
        } while (!/^[A-D]$/.test(choice));
      } else if (next.position > 3) {
        choice = item.answer === 'A' ? 'B' : 'A';
      }

      const entry = quiz.recordAnswer({ questionId: next.id, correct: choice === item.answer });
      const offered = names[entry.level - 1];
      const target = names[entry.nextTargetLevel - 1];
      const fallback = entry.selection === 'NEAREST_AVAILABLE' ? ' (fallback)' : '';
      console.log(`#${entry.position} ${offered}${fallback} · ${entry.correct ? 'Correct' : 'Incorrect'} · ${labels[entry.reason]} · Next target: ${target}`);
    }
  } finally {
    input?.close();
  }

  const report = quiz.report();
  const events = JSON.parse(JSON.stringify(report.events));
  assert.deepEqual(replayQuiz(settings, events), report);
  console.log(`\nScore: ${report.correct}/${report.answered} (${report.accuracy}%)`);
  console.log('Replay reproduced every question and decision.');
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
