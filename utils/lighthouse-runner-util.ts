import fs from 'fs';
import { spawn } from 'child_process';

import { getChromeFlags, getLighthousePreset } from '@config/lighthouse.config';
import { reportTimestamp } from '@config/lighthouse.config';

import { getLighthouseOutputFilePaths } from '@utils/report-path-util';
import { screenshotDiagnosticsBlock } from '@utils/screenshot-util';
import { textWriterUtil } from '@utils/text-writer-util';

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore', shell: true });
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`
          \n❌ Lighthouse process exited with code ${code}
          \nThings to check:
          - Check your internet connection.
          - Ensure the URL is correct and accessible with no redirection.
          - Ensure the page isn't using iframe.\n`));
      }
    });
  });
}

export async function runLighthouse (
  url: string,
  device: 'Mobile' | 'Desktop',
  isIncognito: boolean,
  screenshotOption: number,
  label: string,
  outputDir: string,
) {

  const { reportPath, htmlReportFile, logPath } = await getLighthouseOutputFilePaths(label, url, outputDir);

  const chromeFlags = getChromeFlags(isIncognito);
  const preset = getLighthousePreset(device);

  try {
    // 🛠 Await Lighthouse process
    await runCommand('npx', [
      'lighthouse',
      url,
      '--output', 'json',
      '--output', 'html',
      '--output-path', `"${reportPath}"`,
      preset,
      '--quiet',
      `--chrome-flags="${chromeFlags}"`,
      '--no-enable-error-reporting'
    ]);

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