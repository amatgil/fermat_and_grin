import { Vec2 } from "./Vec2.js";
import { init_listeners } from "./eventListeners.js";

const REAL_WIDTH: number = 10;
const REAL_HEIGHT: number = 5;

const TAU = 6.28318530717958647692;
const PI = TAU / 2;

const DELTA_IN_STEPS = 0.01;

// TOTES les coordenades son normalitzades ([0..1]), i (0, 0) és top-left
export class ExperimentFermat {
  ray_start: Vec2;
  ray_end: Vec2;
  ns: number[];
  media_change_verticals: number[];
  g: CanvasRenderingContext2D;
  g_width: number;
  g_height: number;
  descent_timer_id: null | number;
  temps_entre_steps_del_descent: number;

  // Assigno els valors que serien per defecte
  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.ray_start = new Vec2(0, 0.5); // normalitzades
    this.ray_end = new Vec2(1, 0.3); // normalitzades
    this.ns = [1, 1.33, 1]; // inclou el primer '1' sempre
    this.media_change_verticals = [0.5, 0.5, 0.5]; // l'últim és la target!
    this.g_width = width;
    this.g_height = height;
    this.descent_timer_id = null;
    this.temps_entre_steps_del_descent = 0.005; // en segons
  }

  set_default_parameters() {
    // TODO
  }
  overlay_snell() {
    // TODO
  }

  // Retorna el path que seguirà segons tots els rays
  compute_ray(
    // percentatge, [0..1] (varia aleatoriament)
    // és important que la seva length sigui this.ns.length
    media_change_verticals: number[],
  ): Vec2[] {
    let ret: Vec2[] = [];

    const num_transicions = this.ns.length;
    if (media_change_verticals.length != num_transicions) {
      throw Error("media change vertical no correspon amb ns");
    }

    ret.push(this.ray_start);
    for (let i = 0; i < num_transicions; ++i) {
      let meeting_point = new Vec2(
        (i + 1) / num_transicions,
        media_change_verticals[i],
      );
      ret.push(meeting_point);
    }

    return ret;
  }

  compute_time(): number {
    let ret: number = 0;

    const num_transicions = this.ns.length;
    if (this.media_change_verticals.length != num_transicions) {
      throw Error("media change vertical no correspon amb ns");
    }

    let prev_point = this.ray_start;
    for (let i = 0; i < num_transicions; ++i) {
      let meeting_point = new Vec2(
        (i + 1) / num_transicions,
        this.media_change_verticals[i],
      );

      let dist = Vec2.sub(meeting_point, prev_point).length();
      let vel = 1 / this.ns[i];
      ret += dist / vel;
      prev_point = meeting_point;
    }

    return ret;
  }

  draw_ray() {
    this.g.strokeStyle = "red";
    let punts = this.compute_ray(this.media_change_verticals);
    this.g.beginPath();
    this.g.moveTo(punts[0].x * this.g_width, punts[0].y * this.g_height); // assumeixo que no està buit, que hauria de ser correcte crec
    for (let p of punts.slice(1)) {
      this.g.lineTo(p.x * this.g_width, p.y * this.g_height);
    }
    this.g.stroke();
  }

  draw_media_transitions() {
    const num_transicions = this.ns.length;
    this.g.strokeStyle = "blue";
    for (let i = 0; i < num_transicions; ++i) {
      let x = ((i + 1) / num_transicions) * this.g_width;
      let y = this.g_height;
      this.g.beginPath();
      this.g.moveTo(x, 0);
      this.g.lineTo(x, y);
      this.g.stroke();
    }
  }

  draw_media_backgrounds() {
    const num_transicions = this.ns.length;
    for (let i = 0; i < num_transicions; ++i) {
      let x = (i / num_transicions) * this.g_width;
      let a = this.ns[i] - 1; // perquè els limits son 1 i 2
      this.g.fillStyle = `rgba(1, 1, 1, ${a})`;
      this.g.beginPath();
      this.g.fillRect(
        x,
        0,
        (1 / num_transicions) * this.g_width,
        this.g_height,
      );
      this.g.stroke();
    }
  }

  start_descent() {
    console.log("Iniciant el descent");
    if (!(this.descent_timer_id === null)) {
      console.log("Ja estavem descendint");
    } else {
      this.descent_timer_id = setInterval(
        () => {this.step_descent()},
        this.temps_entre_steps_del_descent * 1000,
      );
    }
  }

  step_descent() {
    let keep_going = true;
    let iterations = 0;
    while (keep_going && iterations < 500) {
        // Menys 1 per no permetre modificar la última (si no, passem a linia recta)
        const index_to_tweak = Math.floor(Math.random() * (this.media_change_verticals.length-1));

        let delta = undefined;
        if (Math.random() < 0.5) delta = -DELTA_IN_STEPS;
        else                     delta =  DELTA_IN_STEPS;

        const old_h = this.media_change_verticals[index_to_tweak];
        const new_h = Math.max(0, Math.min(1, old_h + delta));

        const old_time = this.compute_time();
        this.media_change_verticals[index_to_tweak] = new_h;
        const new_time = this.compute_time();

        if (new_time <= old_time) keep_going = false;
        else this.media_change_verticals[index_to_tweak] = old_h;

        iterations += 1;
    }
    this.refresh_outputs();
    if (iterations >= 500) {
        // No hem fet progrès, cancelem
        console.log("Parem de fer això")
        this.stop_descent();
    }
  }

  stop_descent() {
    console.log("Parant el descent");
    if (this.descent_timer_id === null) {
      console.log("No hi havia cap timer actiu");
    } else {
      clearTimeout(this.descent_timer_id);
      this.descent_timer_id = null;
    }
  }

  redraw() {
    this.refresh_inputs();
    this.g.clearRect(0, 0, this.g_width, this.g_height);
    this.draw_media_backgrounds();
    this.draw_ray();
    this.draw_media_transitions();
    const time_report = document.getElementById("time_taken");
    if (time_report === null) throw Error("algú ha borrat lo del temps");

    time_report.innerHTML = this.compute_time().toString();
  }

  randomitza_valors_existents()
    {
      console.log("Randomitzant");
      this.ns                     = this.ns.map(_ => 1+Math.random());
      this.media_change_verticals = this.media_change_verticals.map(_ => Math.random());
      this.refresh_outputs();
  }
  // Refresca indexs i heights
  refresh_inputs() {
    {
      const nss = document.getElementById("input_ns");
      let indexs: number[] = [];
      if (nss?.childNodes === undefined) {
        throw Error("Whoopsie");
      }

      for (const child of nss?.childNodes) {
        if (child instanceof HTMLInputElement) {
          indexs.push(Number(child.value));
        } else {
          throw Error("Unreachable");
        }
      }
      this.ns = indexs;
    }
    {
      const hs = document.getElementById("input_heights");
      let heights: number[] = [];
      if (hs?.childNodes === undefined) {
        throw Error("Whoopsie");
      }

      for (const child of hs?.childNodes) {
        if (child instanceof HTMLInputElement) {
          heights.push(Number(child.value));
        } else {
          throw Error("Unreachable");
        }
      }
      this.media_change_verticals = heights;
    }
  }
  refresh_outputs()
    {
      {
          const nss = document.getElementById("input_ns");
          if (nss?.childNodes === undefined) {
              throw Error("Whoopsie");
          }

          nss.childNodes.forEach((child, i) => {
              if (child instanceof HTMLInputElement) {
                  child.value = this.ns[i].toString();
              } else {
                  throw Error("Unreachable");
              }
          });
      }

      {
          const hs = document.getElementById("input_heights");
          if (hs?.childNodes === undefined) {
              throw Error("Whoopsie");
          }

          hs.childNodes.forEach((child, i) => {
              if (child instanceof HTMLInputElement) {
                  child.value = this.media_change_verticals[i].toString();
              } else {
                  throw Error("Unreachable");
              }
          });
      }

      this.redraw();
  }
   
}

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
}

(window as any).start = start;
