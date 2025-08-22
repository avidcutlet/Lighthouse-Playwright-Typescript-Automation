const frames = ['☀️','🌤️','⛅','🌥️','☁️'];

let frameIndex = 0;
let spinner: ReturnType<typeof setInterval> | null = null;
let currentText: string = "";

const canUseSpinner = process.stdout.isTTY;

export function startEmojiSpinner(text: string) {
  currentText = text;

  if (!canUseSpinner) {
    console.log(`${currentText} ...`); // fallback for CI
    return;
  }

  spinner = setInterval(() => {
    const frame = frames[frameIndex = (frameIndex + 1) % frames.length];
    process.stdout.write(`\r${currentText} ${frame}   `);
  }, 100);
}

export function clearLine(){
  if (!canUseSpinner) return;

  process.stdout.clearLine(0);  // clear current line
  process.stdout.cursorTo(0);   // move cursor to start
}

export function stopEmojiSpinner() {
  if (spinner) {
    clearInterval(spinner);
    spinner = null;
  }

  if (spinner){
    clearInterval(spinner);
    spinner = null;
  }
  clearLine();
}