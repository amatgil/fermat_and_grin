import { ExperimentFermat } from "./fermat.js";

function degenerate_1() {
  const canvas = document.getElementById("c") as HTMLCanvasElement;
  const g = canvas.getContext("2d") as CanvasRenderingContext2D;

  let exp = new ExperimentFermat(g, 100, 100);
  exp.ns = [1.33, 1.33, 1.33, 1.33];
  exp.media_change_verticals = [1.57, 1.57, 1.57, 1.57];

  const expected = [1.57, 1.57, 1.57, 1.57];
  for (let i = 0; i < 1000; ++i) {
    exp.step_descent();
  }
  for (let i = 0; i < expected.length; ++i) {
    if (Math.abs(exp.media_change_verticals[i] - expected[i]) > 0.01) {
      console.log("EI: El degenerate_1 falla");
    }
  }
}

export function run_tests() {
  //degenerate_1();
}
