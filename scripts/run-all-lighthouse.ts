import { runLighthouse } from '@utils/lighthouse-runner-util';
import { ALL_TEST_URLS } from '@config/lighthouse.config';
import { askScreenshotOption } from '@utils/user-input-util';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito


const BATCH_SIZE = 4;

(async () => {
  const screenshotOption = await askScreenshotOption();

  const allTasks: (() => Promise<void>)[] = [];
  const totalTasks = ALL_TEST_URLS.length * devices.length * modes.length;
  let taskIndex = 0;

  for (const url of ALL_TEST_URLS) {
    for (const device of devices) {
      for (const isIncognito of modes) {
        const currentIndex = taskIndex++;

        // Push task as a function that returns a promise
        allTasks.push(() =>
          runLighthouse(url, device, isIncognito, screenshotOption, currentIndex, totalTasks)
        );
      }
    }
  }

  // Overall run time tracker
  const startTime = Date.now();
  console.log(`🕐Started at: ${new Date(startTime).toLocaleString()}`);
  
  // Batch run tasks 4 at a time
  for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
    const batch = allTasks.slice(i, i + BATCH_SIZE).map(task => task());
    await Promise.all(batch);
    console.log(`✅ Batch ${i / BATCH_SIZE + 1} completed\n`);
  }
  
  console.log('\n🌟 All Lighthouse runs completed.');
  
  // Overall run time tracker
  const endTime = Date.now();
  const durationSec = (endTime - startTime) / 1000;
  const minutes = Math.floor(durationSec / 60);
  const seconds = (durationSec % 60).toFixed(2);
  console.log(`🕐Duration: ${minutes}m ${seconds}s`);
})();