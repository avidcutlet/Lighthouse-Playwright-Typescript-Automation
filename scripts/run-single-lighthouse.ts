import { runLighthouse } from '@utils/lighthouse-runner-util';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

const lighthouseRuns: Promise<void>[] = [];

for (const device of devices) {
  for (const isIncognito of modes) {
    lighthouseRuns.push(runLighthouse(device, isIncognito));
  }
}

// Run all 4 in parallel and wait for all to finish
(async () => {
  await Promise.all(lighthouseRuns);
  console.log('\n🌟 All Lighthouse runs completed.');
})();