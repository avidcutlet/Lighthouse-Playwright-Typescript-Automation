import fs from 'fs';
import { spawn } from 'child_process';
import { launch as launchChrome } from 'chrome-launcher';

import { getChromeFlags, getLighthousePreset } from '@config/lighthouse.config';
import { reportTimestamp } from '@config/lighthouse.config';

import { getLighthouseOutputFilePaths } from '@utils/report-path-util';
import { screenshotDiagnosticsBlock } from '@utils/screenshot-util';
import { textWriterUtil } from '@utils/text-writer-util';

export async function runLighthouse (
  url: string,
  device: 'Mobile' | 'Desktop',
  isIncognito: boolean,
  screenshotOption: number,
  label: string,
  outputDir: string,
) {

  const { reportPath, htmlReportFile, logPath } = await getLighthouseOutputFilePaths(label, url, outputDir);

  // const chromeFlags = getChromeFlags(isIncognito);
  const preset = getLighthousePreset(device);

  try {
    // 🛠 Await Lighthouse process
    // await runCommand('npx', [
    //   'lighthouse',
    //   url,
    //   '--output', 'json',
    //   '--output', 'html',
    //   '--output-path', `"${reportPath}"`,
    //   preset,
    //   '--quiet',
    //   `--chrome-flags=${chromeFlags}`,
    //   '--max-wait-for-load=60000',
    //   '--timeout=120000',
    //   '--no-enable-error-reporting'
    // ]);

    await runLighthouseWithFallback({
      url,
      reportPath,
      preset,
      isIncognito
    });



    // Write data to txt file
    const jsonReportPath = `${reportPath}.report.json`;
    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    const performanceScore = Math.round(report.categories.performance.score * 100);
    
    const logTimestamp = reportTimestamp(report.fetchTime);
    
    const htmlReportPath = `${reportPath}.report.html`;
    let {
      diagnosticsData,
      auditsData
    } = await screenshotDiagnosticsBlock(outputDir, htmlReportPath, label, url, device, isIncognito, screenshotOption);

    // Write data on text file
    textWriterUtil(
      logPath,
      logTimestamp,
      url,
      label,
      performanceScore,
      diagnosticsData.diagnosticTitleTxt,
      diagnosticsData.diagnosticDisplayTxt,
      diagnosticsData.diagnosticRedirectTxt,
      diagnosticsData.diagnosticRedirectLinkTxt,
      diagnosticsData.diagnosticScreenshotPath,
      auditsData.auditTitleTxt,
      auditsData.auditRedirectTxt,
      auditsData.auditRedirectLinkTxt,
      auditsData.auditScreenshotPath,
      htmlReportFile,
      outputDir
    );

  } catch (err) {
    console.error(`\n❌ Lighthouse failed for ${label}:`, err);
  }
};

function runCommandCapture(command: string, args: string[]): Promise<{ code: number; out: string; err: string; }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('close', code => resolve({ code: code ?? 1, out, err }));
  });
}

function isNoFcp(text: string) {
  return /NO_FCP|did not paint any content/i.test(text);
}

export async function runLighthouseWithFallback(opts: {
  url: string;
  reportPath: string;
  preset: string;
  isIncognito: boolean;
}) {
  const { url, reportPath, preset, isIncognito } = opts;

  const baseArgs = [
    url,
    '--output', 'json',
    '--output', 'html',
    '--output-path', `"${reportPath}"`,
    preset,
    '--quiet',
    '--max-wait-for-load=60000',
    '--timeout=120000',
    '--disable-storage-reset',
    '--no-enable-error-reporting'
  ];

  // 1) Try headless=new
  let chromeFlags = getChromeFlags(isIncognito, 'new');
  let res = await runCommandCapture('npx', ['lighthouse', ...baseArgs, `--chrome-flags=${chromeFlags}`]);
  if (res.code === 0) return;

  if (!isNoFcp(res.out + res.err)) {
    throw new Error(res.err || res.out || `Lighthouse exited with code ${res.code}`);
  }

  // 2) Retry with headless=old (some pages only paint here)
  chromeFlags = getChromeFlags(isIncognito, 'old');
  const resOld = await runCommandCapture('npx', ['lighthouse', ...baseArgs, `--chrome-flags=${chromeFlags}`, '--verbose']);
  if (resOld.code === 0) return;

  // 3) Final fallback: run against a headed Chrome (true foreground) via --port
  const chrome = await launchChrome({
    chromeFlags: [ isIncognito ? '--incognito' : '' ].filter(Boolean) // headed by default
  });

  try {
    const attachArgs = [
      url,
      '--output', 'json',
      '--output', 'html',
      '--output-path', `"${reportPath}"`,
      preset,
      '--quiet',
      '--disable-storage-reset',
      '--max-wait-for-load=60000',
      '--timeout=120000',
      '--port', String(chrome.port),        // attach to the headed Chrome
      '--verbose'
    ];

    const resHeaded = await runCommandCapture('npx', ['lighthouse', ...attachArgs]);
    if (resHeaded.code === 0) return;

    // If we’re still here, surface the most useful logs
    throw new Error(
      `Lighthouse NO_FCP after all fallbacks.\n\n` +
      `Headless(new) stderr:\n${res.err}\n\n` +
      `Headless(old) stderr:\n${resOld.err}\n\n` +
      `Headed attach stderr:\n${resHeaded.err}\n`
    );
  } finally {
    chrome.kill();
  }
}