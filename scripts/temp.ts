import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// === CONFIG ===
const url = 'https://www.cheqsystems.com/';

// === Timestamp (safe for filenames) ===
const folderTimestamp = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})
  .replace(/[/, ]/g, '-')
  .replace(/:/g, '-')
  .replace('--', '-')
  .toUpperCase();

// === LOOP OVER CONFIGS ===
const runLighthouse = (device: 'Mobile' | 'Desktop', isIncognito: boolean) => {
  const modeLabel = isIncognito ? 'Incognito' : 'Normal';
  const label = `${device}-${modeLabel}`;

  const jsonOutputDir = path.join(__dirname, '..', 'reports', `lighthouse-${folderTimestamp}`);
  const logOutputDir = path.join(__dirname, '..', 'logs', `lighthouse-${folderTimestamp}`);
  const jsonPath = path.join(jsonOutputDir, `lighthouse-report-${label}.json`);
  const logPath = path.join(logOutputDir, 'automation_log.txt');

  fs.mkdirSync(jsonOutputDir, { recursive: true });
  fs.mkdirSync(logOutputDir, { recursive: true });

  const chromeFlags = [
    '--headless',
    isIncognito ? '--incognito' : ''
  ].join(' ');

  const preset = device === 'Desktop' ? '--preset=desktop' : '';

  try {
    console.log(`\n🚀 Running Lighthouse [${label}] on ${url}`);

    execSync(`npx lighthouse ${url} \
      --output json \
      --output-path "${jsonPath}" \
      ${preset} \
      --quiet \
      --chrome-flags="${chromeFlags}" \
      --no-enable-error-reporting`,
      { stdio: 'inherit' }
    );

    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const performanceScore = Math.round(report.categories.performance.score * 100);

    const logTimestamp = new Date(report.fetchTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    console.log('\n📋 Report Summary');
    console.log('======================');
    console.log(`URL: ${url}`);
    console.log(`Mode: ${label}`);
    console.log(`Date & Time: ${logTimestamp}`);
    console.log(`Performance Score: ${performanceScore}`);

    fs.appendFileSync(logPath, `\n[${folderTimestamp}] ${url} - ${label} - Score: ${performanceScore}, Time: ${logTimestamp}`);
    console.log(`\n✅ Done. Report saved in: ${jsonOutputDir}`);
  } catch (err) {
    console.error(`\n❌ Lighthouse failed for ${label}:`, err);
  }
};

// === RUN ALL COMBINATIONS ===
const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

for (const device of devices) {
  for (const isIncognito of modes) {
    runLighthouse(device, isIncognito);
  }
}