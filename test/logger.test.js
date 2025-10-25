// tests/logger.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { logLine } from '../logger.js';
import os from 'os';

test('logger includes timestamp-ish string', async () => {
  const before = Date.now();
  const line = `[TEST-TIME] ${before}`;
  const { logLine } = await import('../logger.js');
  logLine(line);
  await new Promise(r => setTimeout(r, 20));
  const fs = await import('fs');
  const content = fs.readFileSync('./logs/app.log', 'utf8');
  assert.ok(content.includes('[TEST-TIME]'), 'timestamp tag missing');
});

test('log file keeps appending (size increases)', async () => {
  const fs = await import('fs');
  const p = './logs/app.log';
  const s1 = fs.existsSync(p) ? fs.statSync(p).size : 0;
  const { logLine } = await import('../logger.js');
  logLine('[APPEND-CHECK] one');
  logLine('[APPEND-CHECK] two');
  await new Promise(r => setTimeout(r, 20));
  const s2 = fs.statSync(p).size;
  assert.ok(s2 > s1, 'log size should increase');
});

test('logger writes to logs/app.log', async () => {
  const msg = `[TEST] logger smoke ${Date.now()}`;
  logLine(msg);
  await new Promise(r => setTimeout(r, 20));
  const logPath = path.resolve('./logs/app.log');
  assert.ok(fs.existsSync(logPath), 'app.log not created');
  const content = fs.readFileSync(logPath, 'utf8');
  assert.ok(content.includes(msg), 'log line not written');
});
