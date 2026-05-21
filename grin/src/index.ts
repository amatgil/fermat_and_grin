import { Vec2 } from "./Vec2.js";
import { init_listeners } from "./eventListeners.js";

export class ExperimentGrin {
  g: CanvasRenderingContext2D;
  g_width: number;
  g_height: number;

  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.g_width = width;
    this.g_height = height;
  }

  redraw() {}
}

function start() {
  const canvas = document.getElementById("c") as HTMLCanvasElement;

  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.7;

  canvas.width = width;
  canvas.height = height;

  const g = canvas.getContext("2d") as CanvasRenderingContext2D;
  const experiment = new ExperimentGrin(g, width, height);
  init_listeners(experiment);

  experiment.redraw();
}

(window as any).start = start;
