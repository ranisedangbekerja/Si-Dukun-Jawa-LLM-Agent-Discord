import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import { logLine } from '../logger.js';

test('logger writes to logs/app.log', () => {
  logLine('[test] hello');
  const s = fs.readFileSync('./logs/app.log', 'utf8');
  assert.ok(s.includes('[test] hello'));
});
