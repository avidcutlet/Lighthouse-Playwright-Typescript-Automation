const frames = ['☀️','🌤️','⛅','🌥️','☁️'];

let frameIndex = 0;
let spinner: ReturnType<typeof setInterval> | null = null;
let currentText: string = "";

export function startEmojiSpinner(text: string) {
  currentText = text;
  spinner = setInterval(() => {
    const frame = frames[frameIndex = (frameIndex + 1) % frames.length];
    process.stdout.write(`\r${currentText} ${frame}   `);
  }, 100);
}

export function updateEmojiSpinner(text: string){
  currentText = text;
}

export function clearLine(){
  process.stdout.clearLine(0);  // clear current line
  process.stdout.cursorTo(0);   // move cursor to start
}

export function stopEmojiSpinner() {
  if (spinner){
    clearInterval(spinner);
    spinner = null;
  }
  clearLine();
}