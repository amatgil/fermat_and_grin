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
  boundary_heights: number[];

  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.g_width = width;
    this.g_height = height;

    this.n1 = 1.47;
    this.delta = 0.01;
    this.num_regions = 10;
    this.radi_fibra = 1; // Ni idea de quines unitats posar lmao

    this.angle_raig = degToRad(10); // En radians
    this.height_raig = 0;
    this.alpha = 5;
    this.cable_length = 300; // En metres (suposo)
    this.ns = [];
    this.boundary_heights = [];
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
    
    let n0 = 1.0 // El raig comença a l'aire
    let n1 = this.ns[0];
    let theta_in = this.angle_raig;
    // Angle with respect to the horizontal
    let theta_out = this.compute_refracted_angle(n0, theta_in, n1); 
    
    theta_in = Math.PI/2 - theta_out;

    let region_height = (2*this.num_regions-1)/(2*this.radi_fibra);
    
    // Vector de punts per on passa el raig:
    let points: Vec2[] = []
    
    // Direcció cap on va el raig:
    //  - Cap a dalt: +1
    //  - Cap a baix: -1
    let sign = this.angle_raig/Math.abs(this.angle_raig);

    let current_region = 0; // Crec que sempre ha de començar en mig
    let current_point = new Vec2(0, this.height_raig);

    while (current_point.x < this.cable_length) {

        // 1. Trobar l'angle de sortida:
        if (Math.abs(current_region+sign) >= this.num_regions) {
            // REFLEXIÓ TOTAL INTERNA
            sign *= -1;
            theta_out = theta_in;
        }
        else {
            // REFRACCIÓ
            let n1 = this.ns[Math.abs(current_region)];
            let n2 = this.ns[Math.abs(current_region+sign)];
            theta_out = this.compute_refracted_angle(n1, theta_in, n2);
        }

        // 2. Trobar els desplaçaments que pot fer en X i en Y fins entrar en una nova regió
        let delta_x =  region_height*Math.tan(theta_out)
        current_point.x += delta_x;
        current_point.y += region_height*sign;
        points.push(new Vec2(current_point.x, current_point.y));
        
        // 3. Passar a la següent regió
        current_region += sign;
    }
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


  experiment.compute_indices_of_refraction_array();
  console.log(experiment.ns);
  experiment.compute_ray_points();
  experiment.redraw();
}

(window as any).start = start;
