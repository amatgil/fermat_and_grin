import { Vec2 } from "./Vec2.js";
import { init_listeners } from "./eventListeners.js";

const REAL_WIDTH: number = 10;
const REAL_HEIGHT: number = 5;

const TAU = 6.28318530717958647692;
const PI = TAU / 2;

// TOTES les coordenades son normalitzades ([0..1]), i (0, 0) és top-left
export class ExperimentFermat {
  ray_start: Vec2;
  ray_end: Vec2;
  ns: number[];
  g: CanvasRenderingContext2D;
  g_width: number;
  g_height: number;

  // Assigno els valors que serien per defecte
  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.ray_start = new Vec2(0, 0.6);
    this.ray_end = new Vec2(1, 0.3);
    this.ns = [1, 1.33, 1]; // inclou el primer '1' sempre
    this.g_width = width;
    this.g_height = height;
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

  compute_time(media_change_verticals: number[]): number {
    let ret: number = 0;

    const num_transicions = this.ns.length;
    if (media_change_verticals.length != num_transicions) {
      throw Error("media change vertical no correspon amb ns");
    }

    let prev_point = this.ray_start;
    for (let i = 0; i < num_transicions; ++i) {
      let meeting_point = new Vec2(
        (i + 1) / num_transicions,
        media_change_verticals[i],
      );

      let dist = Vec2.sub(meeting_point, prev_point).length();
      let vel = 1 / this.ns[i];
      ret += dist / vel;
      prev_point = meeting_point;
    }

    return ret;
  }

  draw_ray(media_change_verticals: number[]) {
    this.g.strokeStyle = "red";
    let punts = this.compute_ray(media_change_verticals);
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
}

function start() {
  console.log("And then we fermat all over the place");
  let canvas = document.getElementById("c") as HTMLCanvasElement;

  const width = window.innerWidth * 0.7;
  const height = window.innerHeight * 0.7;

  canvas.width = width;
  canvas.height = height;

  let g = canvas.getContext("2d") as CanvasRenderingContext2D;
  let experiment = new ExperimentFermat(g, width, height);
  init_listeners(experiment);

  experiment.draw_ray([0.8, 0.2, 0.6]);
  experiment.draw_media_transitions();
  console.log(experiment.compute_time([0.8, 0.2, 0.6]));
}

(window as any).start = start;
