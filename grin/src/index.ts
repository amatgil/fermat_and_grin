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
  ray_points: Vec2[];

  constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.g_width = width;
    this.g_height = height;

    this.n1 = 1.47;
    this.delta = 0.01;
    this.num_regions = 5;
    this.radi_fibra = this.g_height/2; // Ni idea de quines unitats posar lmao

    this.angle_raig = degToRad(10); // En radians
    this.height_raig = 0;
    this.alpha = 2;
    this.cable_length = this.g_width; // En metres (suposo)
    this.ns = [];
    this.boundary_heights = [];
    this.ray_points = []
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
    let res = n1*Math.sqrt(inside_sqrt); 
    if (isNaN(res)) throw Error("Sqrt gave NAN:" + 
        ", " + "num_divisions " + num_divisions + 
        ", " + "delta " + delta + 
        ", " + "n1 " + n1 + 
        ", " + "alpha " + alpha + 
        ", " + "total_radius " + total_radius + 
        ", " + "r " + r) 
    return res; 
  }

  compute_indices_of_refraction_array() {
    this.ns = [];
    let region_height = (2.0*this.radi_fibra)/(2.0*this.num_regions-1.0);
    for (let i = 0; i < this.num_regions; ++i) {
        //let r = this.radi_fibra*(i/this.num_regions);
        let r = i*region_height;
        let n = ExperimentGrin.compute_index_of_refraction(this.num_regions, this.delta, this.n1, this.alpha, this.radi_fibra, r);
        this.ns.push(n);
    }
  }

  // Aplies snell's law to compute the refracted angle
  compute_refracted_angle(n1: number, theta_in: number, n2:number): number {
    let sintheta = n1*Math.sin(theta_in)/n2;
    let res = Math.asin(sintheta);
    if (isNaN(res)) console.log("NAN! n1=" + n1 + ", theta_in=" + theta_in + ", n2=" + n2 + ", sintheta=" + sintheta);
    return res;
  }

  compute_ray_points() {
    
    let n0 = 1.0 // El raig comença a l'aire
    let n1 = this.ns[0];
    let theta_in = this.angle_raig;
    // Angle with respect to the horizontal
    let theta_out = this.compute_refracted_angle(n0, theta_in, n1); 
    
    theta_in = Math.PI/2 - theta_out;

    let region_height = (2.0*this.radi_fibra)/(2.0*this.num_regions-1.0);
    
    // Vector de punts per on passa el raig:
    let points: Vec2[] = []
    
    // Direcció cap on va el raig:
    //  - Cap a dalt: +1
    //  - Cap a baix: -1
    let sign = this.angle_raig/Math.abs(this.angle_raig);


    console.log("Sign", sign);
    let current_region = 0; // Crec que sempre ha de començar en mig
    let current_point = new Vec2(0, this.height_raig);

    // REFRACCIÓ
    let _n1 = this.ns[Math.abs(current_region)];
    let _n2 = this.ns[Math.abs(current_region+sign)];
    theta_out = this.compute_refracted_angle(_n1, theta_in, _n2);

    if (isNaN(theta_out)) {  // Reflexió total interna
        theta_out = theta_in;
        sign *= -1;
    }
    
    points.push(new Vec2(current_point.x, current_point.y))

    let delta_x =  region_height/2*Math.tan(theta_out);
      
    current_point.x += delta_x;
    current_point.y += region_height/2*sign;
    points.push(new Vec2(current_point.x, current_point.y));
    
    // 3. Passar a la següent regió
    theta_in = theta_out;

    while (current_point.x < this.cable_length) {

        // 1. Trobar l'angle de sortida:
        if (Math.abs(current_region+sign) >= this.num_regions) {
            // REFLEXIÓ TOTAL INTERNA
            //sign *= -1;
            //theta_out = theta_in;
            throw Error("El raig ha sortit del material!");
        }
        else {
            // REFRACCIÓ
            let n1 = this.ns[Math.abs(current_region)];
            let n2 = this.ns[Math.abs(current_region+sign)];

            console.log(
              "current region:", current_region,
              `${current_region} -> ${current_region+sign}`, "(" + n1 + ", " + n2 + ")"
            );
            theta_out = this.compute_refracted_angle(n1, theta_in, n2);

            if (isNaN(theta_out)) {  // Reflexió total interna
                theta_out = theta_in;
                sign *= -1;
            }
        }

        // 2. Trobar els desplaçaments que pot fer en X i en Y fins entrar en una nova regió
        let delta_x =  region_height*Math.tan(theta_out);
        
        current_point.x += delta_x;
        current_point.y += region_height*sign;
        points.push(new Vec2(current_point.x, current_point.y));
        
        // 3. Passar a la següent regió
        current_region += sign;
        theta_in = theta_out;
    }
    this.ray_points = points;
  }

  draw_ray() {
    let [x_prev, y_prev] = [0, this.g_height/2];
    for (let p of this.ray_points) {
        let x = (p.x/this.cable_length)*this.g_width;
        let y = (-p.y+this.radi_fibra)/(2*this.radi_fibra)*this.g_height;
        this.g.beginPath();
        this.g.moveTo(x_prev, y_prev);
        this.g.lineTo(x, y);
        this.g.stroke();
        [x_prev, y_prev] = [x, y];
    }
  }

  draw_background() {
    let region_height = (2.0*this.radi_fibra)/(2.0*this.num_regions-1.0);
    let region_height_pixels = this.g_height*region_height/(2*this.radi_fibra);
    for (let i = 0; i < this.num_regions; ++i) {
      let j = this.num_regions-i-1;
      let blue = 255*i/this.num_regions;
      this.g.fillStyle = `rgb(0, 0, ${blue})`
      let rect_height = region_height_pixels + region_height_pixels*2*j; 
      let bottom_y = this.g_height/2- rect_height/2;
      this.g.fillRect(0, bottom_y, this.g_width, rect_height);
    }
  }
  redraw() {
    this.draw_background();
    this.g.strokeStyle = "red"
    this.g.stroke
    this.g.lineWidth = 4;
    this.draw_ray();

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
  experiment.compute_ray_points();
  experiment.redraw();
}

(window as any).start = start;
