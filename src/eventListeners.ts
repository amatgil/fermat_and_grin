import { ExperimentFermat } from "./index.js";

export function init_listeners(exp: ExperimentFermat) {
  /*
  const A_slider = document.getElementById("amplitude") as HTMLInputElement;
  const lambda_slider = document.getElementById("lambda") as HTMLInputElement;
  const a_slider = document.getElementById("slit-slit") as HTMLInputElement;
  const L_slider = document.getElementById("slits-plane") as HTMLInputElement;
  const iter_slider = document.getElementById("iter") as HTMLInputElement;

  A_slider?.addEventListener("input", () => {
    const val = parseFloat(A_slider.value);
    exp.A = Experiment.default_A + val * 600;
    exp.draw_interference_pattern();
  });

  lambda_slider?.addEventListener("input", () => {
    const val = parseFloat(lambda_slider.value);
    exp.lambda = Experiment.default_lambda + val * 5000;
    exp.draw_interference_pattern();
  });

  a_slider?.addEventListener("input", () => {
    const val = parseFloat(a_slider.value);
    exp.a = Experiment.default_a + val * 0.1;
    exp.recalculate_slits();
    exp.draw_interference_pattern();
  });

  L_slider?.addEventListener("input", () => {
    const val = parseFloat(L_slider.value);
    exp.L = Experiment.default_L + val * 200;
    exp.draw_interference_pattern();
  });

  iter_slider?.addEventListener("input", () => {
    const val = parseFloat(iter_slider.value);
    exp.iter = Math.floor(Experiment.default_iter + val * 20);
    exp.draw_interference_pattern();
  });
   */
}
