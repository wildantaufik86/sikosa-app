import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

interface UnitTestContext {
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
}

const CONTEXT_FILE = path.join(os.tmpdir(), 'sikosa-test-context.json');

function readStore(): Record<string, any> {
  try { return JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8')); } catch { return {}; }
}

export function logTestContext(data: UnitTestContext): void {
  const rawName = (expect as any).getState().currentTestName;
  if (!rawName) return;
  // Jest Circus uses " > " as separator; reporter fullName uses plain space
  const testName = rawName.replace(/ > /g, ' ');
  try {
    const store = readStore();
    store[testName] = data;
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(store), 'utf-8');
  } catch {}
}
