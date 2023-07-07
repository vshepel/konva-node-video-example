import { join } from 'path';
import { renderVideo } from './renderVideo.js';
import { __dirname } from './video.utils.js';

async function run() {
  const outputDir = join(__dirname, "../out");
  const output = join(__dirname, "../output.mp4");

  await renderVideo({ outputDir, output });
}

run().catch(console.error);
