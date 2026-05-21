import { Vec2 } from "./Vec2.js";
import { init_listeners } from "./eventListeners.js";

export class ExperimentGrin {
  g: CanvasRenderingContext2D;
  g_width: number;
  g_height: number;
  n1: number;
  delta: number;
  num_regions: number;
  
  angle_raig: number;
  radi_fibra: number;
  alpha: number;

  longitud_cable: number;
  ns: number[];



  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.g_width = width;
    this.g_height = height;

    this.n1 = 1.47;
    this.delta = 0.01;
    this.num_regions = 10;
    this.angle_raig = 1; // En radians
    this.radi_fibra = 1; // Ni idea de quines unitats posar lmao
    this.alpha = 1;
    this.longitud_cable = 100; // En metres (suposo)
    this.ns = [];
  }

  /**
   * Computes the index of refraction in a GRIN fiber optic cable using the following formula:
   * n(r) = n1 · sqrt(1 - 2·delta·(r/a)^alpha)
   * @param num_divisions 
   * @param delta 
   * @param n1 
   * @param alpha 
   * @param amplada 
   * @param r 
   */
  compute_index_of_refraction(num_divisions: number, delta: number, n1: number, alpha: number, total_radius: number, r: number): number {
    let inside_sqrt = 1 - 2*delta*Math.pow(r/total_radius, alpha);
    return n1*Math.sqrt(inside_sqrt);
  }

  compute_indices_of_refraction_array(num_regions: number, delta: number, n1: number, alpha: number, total_radius: number): number[] {
    let ns = [];
    for (let i = 0; i < num_regions; ++i) {
        let r = total_radius*(i/num_regions);
        let n = this.compute_index_of_refraction(num_regions, delta, n1, alpha, total_radius, r);
        ns.push(n);
    }
    return ns;
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
