import Konva from './konva.js';
import { performance } from "node:perf_hooks";
import c from "./consts.js";
import {
  saveFrame,
  createVideo,
  loadImageAsset,
  makeAnimation,
  combineAnimations,
} from "./konvaUtils.js";

function renderBackground(layer) {
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: c.videoWidth,
      height: c.videoHeight,
      fill: "#FCFCFC",
    })
  );
}

function renderText(layer) {
  const hello = new Konva.Text({
    align: "center",
    x: -c.videoWidth,
    width: c.videoWidth,
    y: 150,
    fontSize: 200,
    fontStyle: "bold",
    fill: "#1E3740",
    text: "Hello",
  });
  const from = new Konva.Text({
    align: "center",
    x: c.videoWidth,
    width: c.videoWidth,
    y: 350,
    fontSize: 150,
    fill: "#1E3740",
    text: "from",
  });
  const konva = new Konva.Text({
    align: "center",
    x: 0,
    width: c.videoWidth,
    y: 500,
    fontSize: 300,
    fontStyle: "bold",
    fill: "#000000",
    text: "Konva",
    opacity: 0,
  });

  layer.add(hello, from, konva);

  return combineAnimations(
    makeAnimation((d) => hello.x((d - 1) * c.videoWidth), {
      startFrame: 0,
      duration: 15 * c.videoFps,
    }),
    makeAnimation((d) => from.x((1 - d) * c.videoWidth), {
      startFrame: 15 * c.videoFps,
      duration: 15 * c.videoFps,
    }),
    makeAnimation((d) => konva.opacity(d), {
      startFrame: 30 * c.videoFps,
      duration: 15 * c.videoFps,
    })
  );
}

async function renderLogo(layer) {
  const image = await loadImageAsset("feedmaker.png");
  const aspect = image.width() / image.height();
  image.width(aspect * 100);
  image.height(100);
  image.y(c.videoHeight - 100 - 50);
  image.x(c.videoWidth - image.width() - 75);
  image.cache();
  image.opacity(0);

  layer.add(image);

  return makeAnimation((d) => image.opacity(d), {
    startFrame: 45 * c.videoFps,
    duration: 15 * c.videoFps,
  });
}

export async function konvaRenderVideo({ outputDir, output }) {
  const stage = new Konva.Stage({
    width: c.videoWidth,
    height: c.videoHeight,
  });
  const start = performance.now();
  const frames = 60 * c.videoFps;
  try {
    const layer = new Konva.Layer();
    stage.add(layer);

    const animate = combineAnimations(
      renderBackground(layer),
      renderText(layer),
      await renderLogo(layer)
    );

    console.log("generating frames...");
    for (let frame = 0; frame < frames; ++frame) {
      animate(frame);

      layer.draw();

      await saveFrame({ stage, outputDir, frame });

      if ((frame + 1) % c.videoFps === 0) {
        console.log(`rendered ${(frame + 1) / c.videoFps} second(s)`);
      }
    }
  } finally {
    stage.destroy();
  }

  console.log("creating video");
  await createVideo({ fps: c.videoFps, outputDir, output });
  const time = performance.now() - start;
  console.log(`done in ${time / 1000} s. ${(frames * 1000) / (time || 0.01)} FPS`);
}
