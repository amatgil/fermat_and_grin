import { ExperimentFermat } from "./fermat.js";
const TAU = 6.28318530717958647692;

function createSliderWithText(
  value: string,
  min: string,
  max: string,
  step: string,
  onChange: () => void,
) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.maxWidth = "fit-content"
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "0.5rem";
  wrapper.style.marginBottom = "0.25rem";

  const range = document.createElement("input");
  range.type = "range";
  range.min = min;
  range.max = max;
  range.step = step;
  range.value = value;

  const numberInput = document.createElement("input");
  numberInput.type = "number";
  numberInput.min = min;
  numberInput.max = max;
  numberInput.step = step;
  numberInput.value = value;
  numberInput.style.width = "4rem";

  range.addEventListener("input", () => {
    numberInput.value = range.value;
    onChange();
  });

  numberInput.addEventListener("input", () => {
    const parsed = Number(numberInput.value);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, Number(min)), Number(max));
      range.value = clamped.toString();
      numberInput.value = clamped.toString();
      onChange();
    }
  });

  numberInput.addEventListener("change", () => {
    let parsed = Number(numberInput.value);
    if (Number.isNaN(parsed)) {
      parsed = Number(range.value);
    }
    const clamped = Math.min(Math.max(parsed, Number(min)), Number(max));
    range.value = clamped.toString();
    numberInput.value = clamped.toString();
    onChange();
  });

  wrapper.appendChild(range);
  wrapper.appendChild(numberInput);
  return wrapper;
}

export function init_listeners(exp: ExperimentFermat) {
  const button_que_fa_start = document.getElementById("start_animation_button");
  const button_que_fa_stop = document.getElementById("stop_animation_button");
  const button_add_ns = document.getElementById("add_index_refrac");
  const button_rm_ns = document.getElementById("remove_index_refrac");
  const button_randomize = document.getElementById(
    "randomitza_valors_existents",
  );
  const print_res = document.getElementById("imprimeix_resultat");

  button_que_fa_start?.addEventListener("click", () => {
    exp.start_descent();
  });
  button_que_fa_stop?.addEventListener("click", () => {
    exp.stop_descent();
  });
  button_add_ns?.addEventListener("click", () => {
    const nss = document.getElementById("input_ns");
    const nsSlider = createSliderWithText("1.33", "1", "2", "0.01", () => {
      exp.redraw();
    });
    nss?.appendChild(nsSlider);

    const hs = document.getElementById("input_heights");
    const hSlider = createSliderWithText("0.5", "0", "1", "0.01", () => {
      exp.redraw();
    });
    hs?.appendChild(hSlider);

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
  button_randomize?.addEventListener("click", () => {
    exp.randomitza_valors_existents();
  });

  const output_area = document.getElementById("output") as HTMLTextAreaElement;
  output_area.value = "";
  print_res?.addEventListener("click", () => {

    output_area.value = "";
    let angles_array:string[] = [];
    exp.angles_pel_print.forEach((e) => angles_array.push((e*360/(2*Math.PI)).toFixed(4)));
    output_area.value = output_area.value.concat("Indexos: " + exp.ns.toString() + "\n");
    output_area.value = output_area.value.concat("Angles: "+ angles_array.toString() + "\n");
    output_area.value = output_area.value.concat("Igualtats de snell:\n")

    const vueltas = exp.ns.length;
    for (let i = 0; i < vueltas - 1; ++i) {
      const a = exp.ns[i] * Math.sin(exp.angles_pel_print[i]);
      const b = exp.ns[i + 1] * Math.sin(exp.angles_pel_print[i + 1]);
      output_area.value = output_area.value.concat("\t" + a.toFixed(3), "=", b.toFixed(3) + "\n");
    }
  });
}
