import { join } from 'path';
import { konvaRenderVideo } from './konvaRenderVideo.js';
import { fabricRenderVideo } from './fabricRenderVideo.js';
import { __dirname } from './konvaUtils.js';

async function konvaRun() {
  const outputDir = join(__dirname, "../out");
  const output = join(__dirname, "../output.mp4");

  await konvaRenderVideo({ outputDir, output });
}

async function fabricRun() {
  const outputDir = join(__dirname, "../out");
  const output = join(__dirname, "../output-fabric.mp4");

  await fabricRenderVideo({ outputDir, output });
}

konvaRun().catch(console.error);
// fabricRun().catch(console.error);
