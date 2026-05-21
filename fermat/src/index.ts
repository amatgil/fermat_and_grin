import { init_listeners } from "./eventListeners.js";
import { run_tests } from "./tests.js";
import { ExperimentFermat } from "./fermat.js";

function start() {
  const canvas = document.getElementById("c") as HTMLCanvasElement;

  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.7;

  canvas.width = width;
  canvas.height = height;

  const g = canvas.getContext("2d") as CanvasRenderingContext2D;
  const experiment = new ExperimentFermat(g, width, height);
  init_listeners(experiment);

  experiment.redraw();
  run_tests();
}

(window as any).start = start;
