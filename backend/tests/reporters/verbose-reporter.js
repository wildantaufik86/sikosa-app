const fs = require('fs');
const os = require('os');
const path = require('path');

const CONTEXT_FILE = path.join(os.tmpdir(), 'sikosa-test-context.json');
const TERM_WIDTH = process.stdout.columns || 120;

function clip(str, max) {
  if (str.length <= max) return str;
  return str.substring(0, max - 3) + '...';
}

function readStore() {
  try { return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8')); } catch { return {}; }
}

function writeStore(store) {
  try { fs.writeFileSync(CONTEXT_FILE, JSON.stringify(store), 'utf-8'); } catch {}
}

class VerboseProgressReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunStart() {
    writeStore({});
    process.stdout.write('\n' + '='.repeat(70) + '\n');
    process.stdout.write('  SIKOSA TEST RUN STARTED\n');
    process.stdout.write('='.repeat(70) + '\n');
  }

  onTestStart(test) {
    const relativePath = test.path
      .replace(process.cwd(), '')
      .replace(/^[\\/]/, '')
      .replace(/\\/g, '/');
    process.stdout.write(`\n[SUITE] ${relativePath}\n`);
    process.stdout.write('-'.repeat(70) + '\n');
  }

  onTestCaseStart(test, testCaseStartInfo) {
    const name = clip(testCaseStartInfo.fullName, TERM_WIDTH - 6);
    process.stdout.write(`\n  >> ${name}\n`);
  }

  onTestCaseResult(test, testCaseResult) {
    const { status, fullName, duration } = testCaseResult;

    const store = readStore();
    const ctx = store[fullName];
    if (ctx) {
      if (ctx.method) {
        // Konteks HTTP dari apiTest (integration test)
        const payloadStr = ctx.payload !== undefined
          ? JSON.stringify(ctx.payload)
          : '(none)';
        process.stdout.write(`     Method    : ${ctx.method} ${ctx.url}\n`);
        process.stdout.write(`     Payload   : ${payloadStr}\n`);
        process.stdout.write(`     Expected  : ${ctx.expectedStatus}\n`);
        process.stdout.write(`     Actual    : ${ctx.actualStatus}\n`);
        if (ctx.responseBody !== undefined && Object.keys(ctx.responseBody ?? {}).length > 0) {
          process.stdout.write(`     Response  : ${JSON.stringify(ctx.responseBody)}\n`);
        }
      } else {
        // Konteks unit test dari logTestContext
        if (ctx.input !== undefined) {
          process.stdout.write(`     Input     : ${JSON.stringify(ctx.input)}\n`);
        }
        if (ctx.expected !== undefined) {
          process.stdout.write(`     Expected  : ${JSON.stringify(ctx.expected)}\n`);
        }
        if (ctx.actual !== undefined) {
          process.stdout.write(`     Actual    : ${JSON.stringify(ctx.actual)}\n`);
        }
      }
      delete store[fullName];
      writeStore(store);
    }

    const durationStr = duration != null ? ` [${duration}ms]` : '';
    let label;
    if (status === 'passed') label = ' PASS ';
    else if (status === 'failed') label = ' FAIL ';
    else label = ' SKIP ';

    const nameClipped = clip(fullName, TERM_WIDTH - 12 - durationStr.length);
    process.stdout.write(`  [${label}] ${nameClipped}${durationStr}\n`);

    if (status === 'failed' && testCaseResult.failureMessages?.length > 0) {
      const errorLine = testCaseResult.failureMessages[0].split('\n').find(l => l.trim()) || '';
      process.stdout.write(`         Error: ${clip(errorLine.trim(), TERM_WIDTH - 16)}\n`);
    }
  }

  onTestResult(test, testResult) {
    const { numPassingTests, numFailingTests, numPendingTests } = testResult;
    process.stdout.write('\n' + '-'.repeat(70) + '\n');
    process.stdout.write(
      `  Passed: ${numPassingTests}  |  Failed: ${numFailingTests}  |  Skipped: ${numPendingTests}\n`
    );
  }

  onRunComplete(contexts, results) {
    const { numTotalTests, numPassedTests, numFailedTests, numPendingTests, startTime } = results;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    try { fs.unlinkSync(CONTEXT_FILE); } catch {}

    process.stdout.write('\n' + '='.repeat(70) + '\n');
    process.stdout.write('  TEST RUN COMPLETE\n');
    process.stdout.write('='.repeat(70) + '\n');
    process.stdout.write(`  Total   : ${numTotalTests}\n`);
    process.stdout.write(`  Passed  : ${numPassedTests}\n`);
    process.stdout.write(`  Failed  : ${numFailedTests}\n`);
    process.stdout.write(`  Skipped : ${numPendingTests}\n`);
    process.stdout.write(`  Time    : ${elapsed}s\n`);
    process.stdout.write('='.repeat(70) + '\n\n');
  }
}

module.exports = VerboseProgressReporter;
