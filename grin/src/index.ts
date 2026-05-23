import { Vec2 } from "./Vec2.js";
import { init_listeners } from "./eventListeners.js";

function degToRad(deg: number): number {
    return (deg/360)*2*Math.PI;
}

export class ExperimentGrin {
  g: CanvasRenderingContext2D;
  g_width: number;
  g_height: number;
  n1: number;
  delta: number;
  num_regions: number;
  
  radi_fibra: number;
  angle_raig: number;
  height_raig: number;
  alpha: number;

  cable_length: number;
  ns: number[];



  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.g_width = width;
    this.g_height = height;

    this.n1 = 1.47;
    this.delta = 0.01;
    this.num_regions = 10;
    this.radi_fibra = 1; // Ni idea de quines unitats posar lmao

    this.angle_raig = degToRad(10); // En radians
    this.height_raig = this.radi_fibra/2;
    this.alpha = 1;
    this.cable_length = 100; // En metres (suposo)
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
  static compute_index_of_refraction(num_divisions: number, delta: number, n1: number, alpha: number, total_radius: number, r: number): number {
    let inside_sqrt = 1 - 2*delta*Math.pow(r/total_radius, alpha);
    return n1*Math.sqrt(inside_sqrt);
  }

  compute_indices_of_refraction_array() {
    this.ns = [];
    for (let i = 0; i < this.num_regions; ++i) {
        let r = this.radi_fibra*(i/this.num_regions);
        let n = ExperimentGrin.compute_index_of_refraction(this.num_regions, this.delta, this.n1, this.alpha, this.radi_fibra, r);
        this.ns.push(n);
    }
  }

  // Aplies snell's law to compute the refracted angle
  compute_refracted_angle(n1: number, theta_in: number, n2:number): number {
    let sintheta = n1*Math.sin(theta_in)/n2;
    return Math.asin(sintheta);
  }

  compute_ray_points() {
    
    let initial_y = this.height_raig;
    let n0 = 1.0 // El raig comença a l'aire
    let n1 = this.ns[0];
    let theta_in = this.angle_raig;
    // Angle with respect to the horizontal
    let theta_out = this.compute_refracted_angle(n0, theta_in, n1); 
    

    let current_region = 0;
    let current_point = new Vec2(0, this.height_raig);
    let region_height = (2*this.num_regions-1)/(2*this.radi_fibra);
    /*
    while (current_point.x < this.cable_length) {
        // TODO!!!
    }*/
  }



  redraw() {
    this.draw_media_backgrounds();
  }

  draw_media_backgrounds() {
    const num_transicions = this.ns.length;
    for (let i = 0; i < num_transicions - 1; ++i) {
      let x = (i /((num_transicions * 2) - 1)) * this.g_height;
      let a = ((this.n1 - this.ns[(num_transicions - 1)-i]) / (this.n1 * this.delta)); // perquè els limits son 1 i 2
      this.g.fillStyle =`rgba(0, 0, 240, ${a})`;

      this.g.beginPath();
      this.g.fillRect(
        0,
        x,
        this.g_width,
        (1 / ((num_transicions * 2) - 1)) * this.g_height,
      );
      this.g.stroke();
    }
    for (let i = 0; i < num_transicions; ++i) {
      let x = ((i+num_transicions - 1) /((num_transicions * 2) - 1)) * this.g_height;
      let a = (this.n1 - this.ns[i]) / (this.n1 * this.delta); // perquè els limits son 1 i 2
      this.g.fillStyle =`rgba(0, 0, 240, ${a})`;

      this.g.beginPath();
      this.g.fillRect(
        0,
        x,
        this.g_width,
        (1 / ((num_transicions * 2) - 1)) * this.g_height,
      );
      this.g.stroke();
    }
  }
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

  experiment.compute_indices_of_refraction_array();
  console.log(experiment.ns);

  experiment.redraw();
}

(window as any).start = start;
