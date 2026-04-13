import { Experiment } from "./index.js";
export function init_listeners(exp) {
    const A_slider = document.getElementById("amplitude");
    const lambda_slider = document.getElementById("lambda");
    const a_slider = document.getElementById("slit-slit");
    const L_slider = document.getElementById("slits-plane");
    const iter_slider = document.getElementById("iter");
    A_slider === null || A_slider === void 0 ? void 0 : A_slider.addEventListener("input", () => {
        const val = parseFloat(A_slider.value);
        exp.A = Experiment.default_A + val * 600;
        exp.draw_interference_pattern();
    });
    lambda_slider === null || lambda_slider === void 0 ? void 0 : lambda_slider.addEventListener("input", () => {
        const val = parseFloat(lambda_slider.value);
        exp.lambda = Experiment.default_lambda + val * 5000;
        exp.draw_interference_pattern();
    });
    a_slider === null || a_slider === void 0 ? void 0 : a_slider.addEventListener("input", () => {
        const val = parseFloat(a_slider.value);
        exp.a = Experiment.default_a + val * 0.1;
        exp.recalculate_slits();
        exp.draw_interference_pattern();
    });
    L_slider === null || L_slider === void 0 ? void 0 : L_slider.addEventListener("input", () => {
        const val = parseFloat(L_slider.value);
        exp.L = Experiment.default_L + val * 200;
        exp.draw_interference_pattern();
    });
    iter_slider === null || iter_slider === void 0 ? void 0 : iter_slider.addEventListener("input", () => {
        const val = parseFloat(iter_slider.value);
        exp.iter = Math.floor(Experiment.default_iter + val * 20);
        exp.draw_interference_pattern();
    });
}
