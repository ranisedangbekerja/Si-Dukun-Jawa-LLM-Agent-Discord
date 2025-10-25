// tests/cli.integration.test.js
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const CLI_PATH = path.resolve('./cli.js');
const LOG_PATH = path.resolve('./logs/app.log');
const API_KEY = process.env.GEMINI_API_KEY;

function runCLI(inputText, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH]);
    let output = '';

    child.stdout.on('data', (d) => (output += d.toString()));
    child.stderr.on('data', (d) => (output += d.toString()));

    setTimeout(() => child.stdin.write(`${inputText}\n`), 1000);
    setTimeout(() => child.stdin.write(`/quit\n`), 5000);

    child.on('close', () => resolve(output.trim()));
    setTimeout(() => reject(new Error('CLI timeout')), timeout);
  });
}

// TEST SUITE – CLI Integration

test('CLI starts and displays greeting text', async () => {
  const result = await runCLI('Primbon Jumat Legi');
  assert.match(result, /Si Dukun Jawa|dukun/i, 'Greeting tidak muncul');
});


test('CLI responds with weton interpretation correctly', async () => {
  const result = await runCLI('Primbon Selasa Kliwon');
  if (API_KEY) {
    assert.match(
      result,
      /(primbon|weton|selasa|kliwon|hari|nasihat|pitutur|rejeki|watak|pangestu)/i,
      'Respons tidak mengandung kata khas primbon'
    );
  } 
  else {
    assert.ok(result && result.includes('Dukun>'), 'CLI tidak berjalan dengan benar di stub mode');
  }
});


test('CLI logs file is created after interaction', async () => {
  await runCLI('Primbon Kamis Pahing');
  await new Promise((r) => setTimeout(r, 900)); 
  const exists = fs.existsSync(LOG_PATH);
  assert.ok(exists, 'File logs/app.log belum dibuat');
  const logContent = fs.readFileSync(LOG_PATH, 'utf8');
  assert.match(logContent, /(Primbon|Kamis|Pahing)/i, 'Log tidak berisi interaksi CLI');
});
