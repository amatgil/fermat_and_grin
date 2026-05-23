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
    region_height: number;

    angle_raig: number;
    height_raig: number;
    alpha: number;

    cable_length: number;
    ns: number[];
    ray_points: Vec2[];

    constructor(g: CanvasRenderingContext2D, width: number, height: number) {
    this.g = g;
    this.g_width = width;
    this.g_height = height;

    this.n1 = 1.47;
    this.delta = 0.01;
    this.num_regions = 5;
    this.radi_fibra = 1; // Ni idea de quines unitats posar lmao
    this.region_height = (2.0*this.radi_fibra)/(2.0*this.num_regions-1.0);

    this.angle_raig = degToRad(10); // En radians
    this.height_raig = 0;
    this.alpha = 2;
    this.cable_length = 100; // En metres (suposo)
    this.ns = [];
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

    advance_ray_to_next_doundary(current_region: number, direction: number, theta_in: number) {
        if (Math.abs(current_region+direction) >= this.num_regions) {
            throw Error("El raig ha sortit del material! " + current_region);
        }

        let theta_out;

        // Refracció:
        let n1 = this.ns[Math.abs(current_region)];
        let n2 = this.ns[Math.abs(current_region+direction)];

        let critical_angle = Math.asin(n2/n1);

        if (theta_in >= critical_angle) {
            // Reflexió total interna:
            theta_out = theta_in;
            direction *= -1;
        }
        else {
            theta_out = this.compute_refracted_angle(n1, theta_in, n2); 
            current_region += direction;
        }

        console.log( "current region:", current_region, `${current_region} -> ${current_region+direction}`, "(" + n1 + ", " + n2 + ")");
        console.log( "\t", `(${Math.floor(100*360*theta_in/(2*Math.PI))/100}, ${Math.floor(100*360*theta_out/(2*Math.PI))/100})`);

        // 2. Trobar els desplaçaments que pot fer en X i en Y fins entrar en una nova regió
        let delta_x = this.region_height*Math.tan(theta_out);
        
        let P = this.ray_points[this.ray_points.length-1];
        let current_point = new Vec2(P.x, P.y);

        current_point.x += delta_x;
        current_point.y += this.region_height*direction;

        this.ray_points.push(current_point);

        return [current_region, theta_out, direction];
    }


    compute_ray_points() {

        let n0 = 1.0 // El raig comença a l'aire
        let n1 = this.ns[0];

        let theta_in = this.angle_raig;
        // Angle with respect to the horizontal
        let theta_out = this.compute_refracted_angle(n0, theta_in, n1); 

        theta_in = Math.PI/2 - theta_out;

        // Direcció cap on va el raig:
        //  - Up: +1
        //  - Down: -1
        let direction = this.angle_raig/Math.abs(this.angle_raig);

        let current_region = 0; // Crec que sempre ha de començar en mig
        let current_point = new Vec2(
            this.region_height*Math.tan(theta_in)/2, 
            this.region_height*direction/2
        );

        this.ray_points.push(current_point);

        while (current_point.x < this.cable_length) {
            [current_region, theta_in, direction] = this.advance_ray_to_next_doundary(current_region, direction, theta_in);
            current_point = this.ray_points[this.ray_points.length-1];
        }
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

    redraw() {
        this.draw_media_backgrounds();
        this.g.strokeStyle = "red"
        this.g.lineWidth = 4;
        this.draw_ray();
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
experiment.compute_ray_points();
experiment.redraw();
}

(window as any).start = start;
