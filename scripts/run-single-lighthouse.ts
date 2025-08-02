import { runLighthouse } from '@utils/lighthouse-runner-util';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

for (const device of devices) {
  for (const isIncognito of modes) {
    runLighthouse(device, isIncognito);
  }
}