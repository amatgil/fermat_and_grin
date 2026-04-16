import { ExperimentFermat } from "./index.js";

export function init_listeners(exp: ExperimentFermat) {
  const button_que_fa_start = document.getElementById("start_animation_button");
  const button_que_fa_stop = document.getElementById("stop_animation_button");
  const button_add_ns = document.getElementById("add_index_refrac");
  const button_rm_ns = document.getElementById("remove_index_refrac");

  button_que_fa_start?.addEventListener("click", () => {
    exp.start_descent();
  });
  button_que_fa_stop?.addEventListener("click", () => {
    exp.stop_descent();
  });
  button_add_ns?.addEventListener("click", () => {
    {
      const nss = document.getElementById("input_ns");
      const n = document.createElement("input");
      n.min = "1";
      n.max = "2";
      n.step = "0.01";
      n.value = "1.33";
      n.type = "range";
      n.addEventListener("change", () => {
        exp.redraw();
      });
      nss?.appendChild(n);
    }
    {
      const hs = document.getElementById("input_heights");
      const h = document.createElement("input");
      h.min = "0";
      h.max = "1";
      h.step = "0.01";
      h.value = "0.5";
      h.type = "range";
      h.addEventListener("change", () => {
        exp.redraw();
      });
      hs?.appendChild(h);
    }
    exp.redraw();
  });
  button_rm_ns?.addEventListener("click", () => {
    {
      const nss = document.getElementById("input_ns");
      if (nss?.childElementCount === 0) return;
      nss?.removeChild(nss.lastChild!);
    }
    {
      const hs = document.getElementById("input_heights");
      if (hs?.childElementCount === 0) return;
      hs?.removeChild(hs.lastChild!);
    }
    exp.redraw();
  });
}
