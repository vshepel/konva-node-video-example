import fs from 'fs';
import execa from 'execa';
import Konva from './konva.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));

const frameLength = 6;

function loadKonvaImage(url) {
  return new Promise((res) => {
    Konva.Image.fromURL(url, res);
  });
}

export function loadImageAsset(fileName) {
  return loadKonvaImage(join(__dirname, "../assets", fileName));
}

export function makeAnimation(callback, { startFrame, duration }) {
  return (frame) => {
    const thisFrame = frame - startFrame;
    if (thisFrame > 0 && thisFrame <= duration) {
      callback(thisFrame / duration);
    }
  };
}

export function combineAnimations(...animations) {
  return (frame) => {
    for (const animation of animations) {
      if (animation) {
        animation(frame);
      }
    }
  };
}

export async function saveFrame({ stage, outputDir, frame }) {
  const data = stage.toDataURL();

  // remove the data header
  const base64Data = data.substring("data:image/png;base64,".length);

  const fileName = join(
    outputDir,
    `frame-${String(frame + 1).padStart(frameLength, "0")}.png`
  );

  await fs.promises.writeFile(fileName, base64Data, "base64");
}

export async function createVideo({ fps, outputDir, output }) {
  await execa(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      `frame-%0${frameLength}d.png`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      output,
    ],
    { cwd: outputDir }
  );
}
