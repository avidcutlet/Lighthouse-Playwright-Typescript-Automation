import fs from 'fs';
import { execSync } from 'child_process';

import { getChromeFlags, getLighthousePreset } from '@config/lighthouse.config';
import { folderTimestamp, reportTimestamp } from '@config/lighthouse.config';

import { arrangeFiles, getLighthouseOutputPaths } from '@utils/report-path-util';
import { screenshotDiagnosticsBlock } from '@utils/screenshot-util';
import { performanceScoreRating } from '@utils/performance-score-rating-util';

let currentUrl: string;
let currentDevice: 'Mobile' | 'Desktop';
let currentIsIncognito: boolean;
let currentScreenshotOption: number;
let currentRunIndex: number;
let currentTotalRuns: number;


export const runLighthouse = async (
  url: string,
  device: 'Mobile' | 'Desktop',
  isIncognito: boolean,
  screenshotOption: number,
  runIndex: number,
  totalRuns: number
) => {
  currentUrl = url;
  currentDevice = device;
  currentIsIncognito = isIncognito;
  currentScreenshotOption = screenshotOption;
  currentRunIndex = runIndex;
  currentTotalRuns = totalRuns;

  const modeLabel = isIncognito ? 'Incognito' : 'Normal';
  const label = `${device}-${modeLabel}`;

  const { outputDir, reportPath, logPath } = await getLighthouseOutputPaths(folderTimestamp, label, url);

  const chromeFlags = getChromeFlags(isIncognito);
  const preset = getLighthousePreset(device);

  try {
    console.log(`\n🚀 Running Lighthouse [${label}] on ${url}`);
    
    execSync(`npx lighthouse ${url} \
      --output json \
      --output html \
      --output-path "${reportPath}" \
      ${preset} \
      --quiet \
      --chrome-flags="${chromeFlags}" \
      --no-enable-error-reporting`,
      { stdio: 'inherit' }
    );

    // Write data to txt file
    const jsonReportPath = `${reportPath}.report.json`; // Search for json file
    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    const performanceScore = Math.round(report.categories.performance.score * 100);
    
    const logTimestamp = reportTimestamp(report.fetchTime);
    
    console.log('\n📋 Report Summary');
    console.log('======================');
    console.log(`URL: ${url}`);
    console.log(`Mode: ${label}`);
    console.log(`Date & Time: ${logTimestamp}`);
    console.log(`Performance Score: ${performanceScore}`);
    console.log(`Rating: ${performanceScoreRating(performanceScore)}`);
    
    const htmlReportPath = `${reportPath}.report.html`;
    let {
      diagnosticsAuditTitleTxt,
      diagnosticsAuditDisplayTxt,
      redirectTxt,
      redirectLinkTxt
    } = await screenshotDiagnosticsBlock(outputDir, htmlReportPath, label, url, device, isIncognito, screenshotOption);

    
    // Write data on text file
    fs.appendFileSync(logPath, `\n[${logTimestamp}] ${url} - ${label}:`+
      `\nScore: ${performanceScore}`+
      `\nTime: ${logTimestamp}`+
      `\nDiagnostics Audit Title Text: ${diagnosticsAuditTitleTxt}` +
      `\nDiagnostics Audit Display Text: ${diagnosticsAuditDisplayTxt}`+
      `\nRedirect Text: ${redirectTxt}`+
      `\nRedirect Link Text: ${redirectLinkTxt}\n`);

    // After all report generation
    if (runIndex === totalRuns - 1) {
      console.log('🧹 Arranging files on last run...');
      await arrangeFiles(outputDir);
      console.log(`\n✅ Done. Report saved in: ${outputDir}`);
    }
    
  } catch (err) {
    console.error(`\n❌ Lighthouse failed for ${label}:`, err);
    console.error(`\n🔧 Trying to rerun lighthouse...`);
    runLighthouse(
      currentUrl,
      currentDevice,
      currentIsIncognito,
      currentScreenshotOption,
      currentRunIndex,
      currentTotalRuns
    );
  }
};