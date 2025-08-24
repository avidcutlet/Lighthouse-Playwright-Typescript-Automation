import path from 'path';

import { ALL_TEST_URLS, OUTPUT_FOLDER_TIMESTAMP, ALL_LIGHTHOUSE_BATCH_SIZE } from '@config/lighthouse.config';
import { screenshotOption } from '@config/lighthouse.config';

import { runLighthouse } from '@utils/lighthouse-runner-util';
import { prepareExcelCopy, writeAllToExcel } from '@utils/excel-writer-util';
import { arrangeFiles, getLighthouseOutputPaths } from '@utils/report-path-util';
import { startEmojiSpinner, clearLine, stopEmojiSpinner, updateEmojiSpinner } from '@utils/spinner-util';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

(async () => {
  const outputDir = await getLighthouseOutputPaths(`lighthouse-${OUTPUT_FOLDER_TIMESTAMP}`);
  const excelPath = prepareExcelCopy(outputDir);
  // IN PROGRESS...
  // const screenshotOption = await askScreenshotOption();

  const allTasks: (() => Promise<void>)[] = [];
  const totalTasks = ALL_TEST_URLS.length * devices.length * modes.length;
  let currentIndex;
  let taskIndex = 0;

  for (const url of ALL_TEST_URLS) {
    for (const device of devices) {
      for (const isIncognito of modes) {
        const modeLabel = isIncognito ? 'Incognito' : 'Normal';
        const label = `${device}-${modeLabel}`;

        currentIndex = taskIndex++;

        // Push task as a function that returns a promise
        allTasks.push(() =>
          runLighthouse(
            url, 
            device,
            isIncognito,
            screenshotOption,
            label,
            outputDir
          )
        );
      }
    }
  }

  // Overall run time tracker
  const startTime = Date.now();
  console.log(`🕐 Started at: ${new Date(startTime).toLocaleString()}\n`);

  const allTasksLength = allTasks.length;
  const allTasksByBatch = Math.ceil(allTasksLength / ALL_LIGHTHOUSE_BATCH_SIZE);
  startEmojiSpinner(`Lighthouse is running (1/${allTasksByBatch})`);
  
  // Batch run tasks 4 at a time
  let allLighthouseBatchSize: number;
  for (let i = 0; i < allTasksLength; i += ALL_LIGHTHOUSE_BATCH_SIZE) {

    const batch = allTasks.slice(i, i + ALL_LIGHTHOUSE_BATCH_SIZE).map(task => task());
    await Promise.all(batch);
    clearLine();
    process.stdout.write(`Batch ${i / ALL_LIGHTHOUSE_BATCH_SIZE + 1}/${allTasksByBatch} completed ✅\n`);
    updateEmojiSpinner(`Lighthouse is running (${i / ALL_LIGHTHOUSE_BATCH_SIZE + 2}/${allTasksByBatch})`);
  }
  
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
  console.log('\n🌟 All Lighthouse runs completed.');
  
  // Overall run time tracker
  const endTime = Date.now();
  const durationSec = (endTime - startTime) / 1000;
  const minutes = Math.floor(durationSec / 60);
  const seconds = (durationSec % 60).toFixed(2);

  console.log(`🕐 Duration: ${minutes}m ${seconds}s`);
})();