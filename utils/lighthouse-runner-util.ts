import fs from 'fs';
import { execSync } from 'child_process';

import { arrangeFiles, getLighthouseOutputPaths } from '@utils/report-path-util';

import { getChromeFlags, getLighthousePreset } from '@config/lighthouse.config';
import { TEST_URL, folderTimestamp, reportTimestamp } from '@config/lighthouse.config';

export const runLighthouse = async (device: 'Mobile' | 'Desktop', isIncognito: boolean) => {
  const modeLabel = isIncognito ? 'Incognito' : 'Normal';
  const label = `${device}-${modeLabel}`;

  const { outputDir, reportPath, logPath } = await getLighthouseOutputPaths(folderTimestamp, label);

  const chromeFlags = getChromeFlags(isIncognito);
  const preset = getLighthousePreset(device);

  try {
    console.log(`\n🚀 Running Lighthouse [${label}] on ${TEST_URL}`);

    execSync(`npx lighthouse ${TEST_URL} \
      --output json \
      --output html \
      --output-path "${reportPath}" \
      ${preset} \
      --quiet \
      --chrome-flags="${chromeFlags}" \
      --no-enable-error-reporting`,
      { stdio: 'inherit' }
    );

    const htmlReportPath = `${reportPath}.report.html`; // For screenshot
    
    // Write data to txt file
    const jsonReportPath = `${reportPath}.report.json`; // Search for json file
    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    const performanceScore = Math.round(report.categories.performance.score * 100);

    const logTimestamp = reportTimestamp(report.fetchTime);

    console.log('\n📋 Report Summary');
    console.log('======================');
    console.log(`URL: ${TEST_URL}`);
    console.log(`Mode: ${label}`);
    console.log(`Date & Time: ${logTimestamp}`);
    console.log(`Performance Score: ${performanceScore}`);

    fs.appendFileSync(logPath, `\n[${folderTimestamp}] ${TEST_URL} - ${label} - Score: ${performanceScore}, Time: ${logTimestamp}`);
    
    arrangeFiles(outputDir);

    console.log(`\n✅ Done. Report saved in: ${outputDir}`);
  } catch (err) {
    console.error(`\n❌ Lighthouse failed for ${label}:`, err);
  }
};