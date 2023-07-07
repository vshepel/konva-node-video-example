import { fabric } from 'fabric';
import { performance } from "node:perf_hooks";
import c from "./consts.js";
import {
  saveFrame,
  createVideo,
  loadImageAsset,
} from "./fabricUtils.js";
import {combineAnimations, makeAnimation} from './konvaUtils.js';

function renderBackground(canvas) {
  canvas.add(
    new fabric.Rect({
      top: 0,
      left: 0,
      width: c.videoWidth,
      height: c.videoHeight,
      fill: "#FCFCFC",
    })
  );
}

function renderText(canvas) {
  const hello = new fabric.Text("Hello", {
    textAlign: "center",
    top: 150,
    fontSize: 200,
    fontStyle: "bold",
    fill: "#1E3740",
  });
  const from = new fabric.Text("from", {
    textAlign: "center",
    top: 350,
    left: c.videoWidth,
    fontSize: 150,
    fill: "#1E3740",
  });
  const fabricText = new fabric.Text("Fabric", {
    textAlign: "center",
    top: 500,
    left: 0,
    fontSize: 300,
    fontStyle: "bold",
    fill: "#000000",
    opacity: 0,
  });

  canvas.add(hello, from, fabricText);

  hello.width = c.videoWidth;
  hello.left = -c.videoWidth;
  from.width = c.videoWidth;
  fabricText.width = c.videoWidth;

  return combineAnimations(
      makeAnimation((d) => hello.left = (d - 1) * c.videoWidth, {
        startFrame: 0,
        duration: 15 * c.videoFps,
      }),
      makeAnimation((d) => from.left = (1 - d) * c.videoWidth, {
        startFrame: 15 * c.videoFps,
        duration: 15 * c.videoFps,
      }),
      makeAnimation((d) => fabricText.opacity = d, {
        startFrame: 30 * c.videoFps,
        duration: 15 * c.videoFps,
      })
  );
}

async function renderLogo(canvas) {
  const image = await loadImageAsset("feedmaker.png");
  image.top = c.videoHeight - 100 - 50;
  image.left = c.videoWidth - image.width - 75;
  image.opacity = 0;
  canvas.add(image);

  return makeAnimation((d) => image.opacity = d, {
    startFrame: 45 * c.videoFps,
    duration: 15 * c.videoFps,
  });
}

export async function fabricRenderVideo({ outputDir, output }) {
  const canvas = new fabric.StaticCanvas(null, { width: c.videoWidth, height: c.videoHeight });
  const start = performance.now();
  const frames = 60 * c.videoFps;

  try {
    const animate = combineAnimations(
        renderBackground(canvas),
        renderText(canvas),
        await renderLogo(canvas)
    );

    console.log("generating frames...");

    for (let frame = 0; frame < frames; ++frame) {
      animate(frame);

      canvas.renderAll();

      await saveFrame(canvas, outputDir, frame);

      if ((frame + 1) % c.videoFps === 0) {
        console.log(`rendered ${(frame + 1) / c.videoFps} second(s)`);
      }
    }
  } catch (e) {
    console.error(e)
  }

  console.log("creating video");
  await createVideo({ fps: c.videoFps, outputDir, output });
  const time = performance.now() - start;
  console.log(`done in ${time / 1000} s. ${(frames * 1000) / (time || 0.01)} FPS`);
}
