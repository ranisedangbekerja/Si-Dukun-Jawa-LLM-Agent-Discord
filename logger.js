import fs from 'fs';
import path from 'path';

const LOG_DIR  = path.resolve('./logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

export function logLine(line) {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}\n`;
  try {
    fs.appendFileSync(LOG_FILE, row, 'utf8');
  } catch {}
}
