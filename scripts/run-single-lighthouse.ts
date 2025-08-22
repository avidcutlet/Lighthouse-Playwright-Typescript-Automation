import path from 'path';

import { SINGLE_TEST_URL, OUTPUT_FOLDER_TIMESTAMP } from '@config/lighthouse.config';
import { screenshotOption } from '@config/lighthouse.config';

import { runLighthouse } from '@utils/lighthouse-runner-util';
import { prepareExcelCopy, writeAllToExcel } from '@utils/excel-writer-util';
import { arrangeFiles, getLighthouseOutputPaths } from '@utils/report-path-util';
import { startEmojiSpinner, clearLine, stopEmojiSpinner } from '@utils/spinner-util';


const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

const lighthouseRuns: Promise<void>[] = [];

let currentIndex: number = 0;

// Run all 4 in parallel and wait for all to finish
(async () => {
  // IN PROGRESS...
  // const screenshotOption = await askScreenshotOption();

  const url = [SINGLE_TEST_URL];
  let taskIndex = 0;
  const totalTasks = url.length * devices.length * modes.length;

  const outputDir = await getLighthouseOutputPaths(`lighthouse-${OUTPUT_FOLDER_TIMESTAMP}`);
  const excelPath = prepareExcelCopy(outputDir);
  
  for (const device of devices) {
    for (const isIncognito of modes) {
      const modeLabel = isIncognito ? 'Incognito' : 'Normal';
      const label = `${device}-${modeLabel}`;

      currentIndex = taskIndex++;

      lighthouseRuns.push(runLighthouse(
        url.toString(),
        device,
        isIncognito,
        screenshotOption,
        label,
        outputDir,
      ));
    }
  }

  // Overall run time tracker
  const startTime = Date.now();
  console.log(`🕐 Started at: ${new Date(startTime).toLocaleString()}\n`);

  startEmojiSpinner(`Lighthouse is running`);
  

  await Promise.all(lighthouseRuns);

  // Arrange after all report generation
  if (currentIndex === totalTasks - 1) {
    console.log('\n🧹 Arranging files on last run...');
    await arrangeFiles(outputDir);
    const trimmedReportDir = path.relative(__dirname, outputDir);
    console.log(`\n✅ Lighthouse report saved in: ${trimmedReportDir}`);
  }
  
  await writeAllToExcel(
    path.join(outputDir, 'lighthouse-simplified-data.txt'),
    excelPath
  );
  
  stopEmojiSpinner();
  clearLine();
  console.log('\n🌟 All Lighthouse runs completed.');
  
  // Overall run time tracker
  const endTime = Date.now();
  const durationSec = (endTime - startTime) / 1000;
  const minutes = Math.floor(durationSec / 60);
  const seconds = (durationSec % 60).toFixed(2);

  console.log(`🕐 Duration: ${minutes}m ${seconds}s`);
})();