import path from 'path';

import { ALL_TEST_URLS } from '@config/lighthouse.config';
import { folderTimestamp } from '@config/lighthouse.config';

import { runLighthouse } from '@utils/lighthouse-runner-util';
import { screenshotOption } from '@config/lighthouse.config';
import { prepareExcelCopy, writeAllToExcel } from '@utils/excel-writer-util';
import { arrangeFiles, getLighthouseOutputPaths } from '@utils/report-path-util';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

const BATCH_SIZE = 4;

(async () => {
  const outputDir = await getLighthouseOutputPaths(folderTimestamp);
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

  
  // Batch run tasks 4 at a time
  const allTasksLength = allTasks.length;
  for (let i = 0; i < allTasksLength; i += BATCH_SIZE) {
    
    const batch = allTasks.slice(i, i + BATCH_SIZE).map(task => task());
    await Promise.all(batch);
    console.log(`✅ Batch ${i / BATCH_SIZE + 1}/${Math.ceil(allTasksLength / BATCH_SIZE)} completed`);
  }

  // Arrange after all report generation
  if (currentIndex === totalTasks - 1) {
    console.log('\n🧹 Arranging files on last run...');
    await arrangeFiles(outputDir);
    console.log(`\n✅ Done. Lighthouse report saved in: ${outputDir}`);
  }

  await writeAllToExcel(
    path.join(outputDir, 'lighthouse-simplified-data.txt'),
    excelPath
  );
  
  console.log('\n🌟 All Lighthouse runs completed.');
  
  // Overall run time tracker
  const endTime = Date.now();
  const durationSec = (endTime - startTime) / 1000;
  const minutes = Math.floor(durationSec / 60);
  const seconds = (durationSec % 60).toFixed(2);

  console.log(`🕐 Duration: ${minutes}m ${seconds}s`);
})();