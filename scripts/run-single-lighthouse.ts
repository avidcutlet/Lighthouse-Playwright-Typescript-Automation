import { runLighthouse } from '@utils/lighthouse-runner-util';
import { askScreenshotOption } from '@utils/user-input-util';
import { SINGLE_TEST_URL } from '@config/lighthouse.config';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

const lighthouseRuns: Promise<void>[] = [];

// Run all 4 in parallel and wait for all to finish
(async () => {
  const screenshotOption = await askScreenshotOption();

  let taskIndex = 0;
  const totalTasks = SINGLE_TEST_URL.length * devices.length * modes.length;


  for (const device of devices) {
    for (const isIncognito of modes) {
      let currentIndex = taskIndex++;

      lighthouseRuns.push(runLighthouse(
        SINGLE_TEST_URL,
        device,
        isIncognito,
        screenshotOption,
        currentIndex,
        totalTasks
      ));
    }
  }

  await Promise.all(lighthouseRuns);
  console.log('\n🌟 All Lighthouse runs completed.');
})();