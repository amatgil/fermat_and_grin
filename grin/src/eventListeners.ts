import { ExperimentGrin } from "./index.js";

function toNumber(value: string): number {
  return Number(value);
}

function degreesToRadians(deg: number): number {
  return (deg / 360) * 2 * Math.PI;
}

function radiansToDegrees(rad: number): number {
  return (rad / (2 * Math.PI)) * 360;
}

export function init_listeners(exp: ExperimentGrin) {
  const controlBindings = [
    {
      sliderId: "slider_n1",
      inputId: "input_n1",
      getValue: () => exp.n1,
      setValue: (value: number) => { exp.n1 = value; },
      formatValue: (value: number) => value.toFixed(2),
    },
    {
      sliderId: "slider_delta",
      inputId: "input_delta",
      getValue: () => exp.delta,
      setValue: (value: number) => { exp.delta = value; },
      formatValue: (value: number) => value.toFixed(3),
    },
    {
      sliderId: "slider_num_regions",
      inputId: "input_num_regions",
      getValue: () => exp.num_regions,
      setValue: (value: number) => { exp.num_regions = Math.max(2, Math.round(value)); },
      formatValue: (value: number) => String(Math.round(value)),
    },
    {
      sliderId: "slider_angle_raig",
      inputId: "input_angle_raig",
      getValue: () => radiansToDegrees(exp.angle_raig),
      setValue: (value: number) => { exp.angle_raig = degreesToRadians(value); },
      formatValue: (value: number) => String(Math.round(value)),
    },
    {
      sliderId: "slider_aspect_ratio",
      inputId: "input_aspect_ratio",
      getValue: () => exp.aspect_ratio,
      setValue: (value: number) => { exp.setAspectRatio(value) },
      formatValue: (value: number) => value.toFixed(2),
    },
    {
      sliderId: "slider_alpha",
      inputId: "input_alpha",
      getValue: () => exp.alpha,
      setValue: (value: number) => { exp.alpha = value; },
      formatValue: (value: number) => value.toFixed(1),
    },
  ];


  function bindControl(binding: typeof controlBindings[number]) {
    const slider = document.getElementById(binding.sliderId) as HTMLInputElement | null;
    const input = document.getElementById(binding.inputId) as HTMLInputElement | null;
    if (!slider || !input) return;

    const updateDomValue = (value: number) => {
      const formatted = binding.formatValue(value);
      slider.value = formatted;
      input.value = formatted;
    };

    const applyValue = (value: number) => {
      if (!Number.isFinite(value)) return;
      binding.setValue(value);
      exp.compute_ray_points();
      exp.redraw();
      updateDomValue(binding.getValue());
    };

    slider.addEventListener("input", () => {
      const value = toNumber(slider.value);
      applyValue(value);
    });

    input.addEventListener("change", () => {
      const value = toNumber(input.value);
      if (Number.isFinite(value)) {
        applyValue(value);
      } else {
        updateDomValue(binding.getValue());
      }
    });

    updateDomValue(binding.getValue());
  }

  controlBindings.forEach(bindControl);
}
