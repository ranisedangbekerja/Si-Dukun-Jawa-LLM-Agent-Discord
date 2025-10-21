// tests/cli.integration.test.js
import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve('./cli.js');
const LOG_PATH = path.resolve('./logs/app.log');

/**
 * Utility untuk menjalankan CLI dan mengirim input otomatis.
 * Kita kirim prompt sederhana ke Si Dukun Jawa dan tunggu balasan.
 */
function runCLI(inputText, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH]);
    let output = '';

    child.stdout.on('data', (data) => (output += data.toString()));
    child.stderr.on('data', (data) => console.error('stderr:', data.toString()));

    // kirim pertanyaan ke CLI
    setTimeout(() => child.stdin.write(`${inputText}\n`), 1000);
    // keluarin dari program
    setTimeout(() => child.stdin.write(`/quit\n`), 4000);

    child.on('close', () => resolve(output.trim()));
    setTimeout(() => reject(new Error('CLI timeout')), timeout);
  });
}

/* ----------------------------------------------------------- */
/* TEST SUITE – CLI Integration                               */
/* ----------------------------------------------------------- */

test('CLI starts and displays greeting text', async () => {
  const result = await runCLI('Primbon Jumat Legi');
  assert.match(result, /Si Dukun Jawa|dukun/i, 'Greeting tidak muncul');
});

test('CLI responds to primbon question', async () => {
  const result = await runCLI('Primbon Selasa Kliwon');
  assert.match(result, /(primbon|weton|nasihat|pitutur)/i);
});

test('CLI logs file is created after interaction', async () => {
  const result = await runCLI('Primbon Kamis Pahing');
  await new Promise((r) => setTimeout(r, 1000)); // tunggu log
  const exists = fs.existsSync(LOG_PATH);
  assert.ok(exists, 'File logs/app.log belum dibuat');
  const logContent = fs.readFileSync(LOG_PATH, 'utf8');
  assert.ok(logContent.includes('Primbon Kamis Pahing'));
});
