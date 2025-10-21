import fs from 'fs';
export function logLine(line) {
  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/app.log', `${new Date().toISOString()} ${line}\n`, 'utf8');
}
