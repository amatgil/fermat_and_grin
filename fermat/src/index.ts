import { init_listeners } from "./eventListeners.js";
import { energyData, ExperimentFermat } from "./fermat.js";

const REAL_WIDTH: number = 10;
const REAL_HEIGHT: number = 5;

const TAU = 6.28318530717958647692;
const PI = TAU / 2;

const DELTA_IN_STEPS = 0.045;
const TEMPS_ENTRE_STEPS = 10; // en millisegons

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

  (window as any).exp = experiment;
}

(window as any).start = start;
(window as any).energyData = energyData;
