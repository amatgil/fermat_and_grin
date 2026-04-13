import {Vec3} from "./Vec3.js"
import {init_listeners} from "./eventListeners.js"

const REAL_WIDTH: number = 10;
const REAL_HEIGHT: number = 5;

const mm_to_amstrong = 10_000_000;
const PI = 3.14159265358979323;

export class Experiment {

static readonly default_lambda = 5000; // Amstrongs
static readonly default_a = 0.1;   // mm
static readonly default_L = 200;   // mm
static readonly default_T = 2*PI;  // radians 
static readonly default_A = 300;   // N/C
static readonly default_iter = 10;

lambda: number; // Amstrongs
a: number; // mm
L: number; // mm
T: number; // radians
A: number; // Amplitude (N / C)
iter: number; // iteration count
slits: Vec3[];

g: CanvasRenderingContext2D;
width: number;
height: number;


constructor(g: CanvasRenderingContext2D,
            width: number,
            height: number) {

    this.lambda = Experiment.default_lambda; // Amstrongs
    this.a = Experiment.default_a;   // mm
    this.L = Experiment.default_L;   // mm
    this.T = Experiment.default_T;  // radians 
    this.A = Experiment.default_A;   // N/C
    this.iter = Experiment.default_iter; // # iterations

    let S1: Vec3 = new Vec3( this.a/2,0,0);
    let S2: Vec3 = new Vec3(-this.a/2,0,0);
    this.slits = [S1, S2];

    this.g = g;
    this.width = width;
    this.height = height;
}

set_default_parameters() {
    this.lambda = 5000; // Amstrongs
    this.a = 0.1; // mm
    this.L = 200; // mm
    this.T = 2*PI;
    this.A = 300;

    let S1: Vec3 = new Vec3( this.a/2,0,0);
    let S2: Vec3 = new Vec3(-this.a/2,0,0);
    let S3: Vec3 = new Vec3(0,this.a/2,0);
    let S4: Vec3 = new Vec3(0,-this.a/2,0);
    this.slits = [S1, S2, S3, S4];
}

recalculate_slits() {
    let S1: Vec3 = new Vec3( this.a/2,0,0);
    let S2: Vec3 = new Vec3(-this.a/2,0,0);
    this.slits = [S1, S2];

    let S3: Vec3 = new Vec3(this.a/2,this.a/2,0);
    let S4: Vec3 = new Vec3(0,-this.a/2,0);
    this.slits = [S1, S2, S3, S4];

}

static to_world_space(i: number, j: number, width: number, height: number): [number, number] {
    let x = (i/width)*REAL_WIDTH - REAL_WIDTH/2;
    let y = (j/height)*REAL_HEIGHT - REAL_HEIGHT/2;
    return [x, y];
}

electric_field(r: Vec3, j: number, M: number): number {
    let N = this.slits.length;
    let S = 0;
    for (let src of this.slits) {
        const Amplitude = this.A/Vec3.distance(src, r);
        const Phase = (Vec3.distance(src,r)*mm_to_amstrong)/this.lambda - j/this.T;

        S += Amplitude*Math.cos(2*PI*Phase);
    }
    return S;
}

intensitat_E(M: number, r: Vec3): number {
    let Sum = 0;
    for (let j = 0; j < M; ++j) {
        const E = this.electric_field(r, j, M);
        Sum += E*E;
    }
    return Sum/M;
}

draw_interference_pattern(): void {
    
    let pixels: Uint8ClampedArray = new Uint8ClampedArray(4*this.width*this.height);

    let [min_I, max_I] = [10e7, 10e-7];
    for (let j = 0; j < this.height; ++j) {
        for (let i = 0; i < this.width; ++i) {
            let [x, y] = Experiment.to_world_space(i, j, this.width, this.height);
            let p = 4*(j*this.width + i);

            let I = this.intensitat_E(this.iter, new Vec3(x,y,this.L));
            
            min_I = Math.min(min_I, I);
            max_I = Math.max(max_I, I);
            
            pixels[p + 0] = 255*I;
            pixels[p + 1] = 255*I;
            pixels[p + 2] = 255*I;
            pixels[p + 3] = 255*I;
        }   
    }

    let image: ImageData = new ImageData(pixels, this.width, this.height, {colorSpace:"srgb"});
    this.g.putImageData(image, 0, 0);
}

}

function start() {
    console.log("Hello world!");
    let canvas = document.getElementById("c") as HTMLCanvasElement; 

    const width  = 100; //canvas.clientWidth;
    const height = 100; //canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;
    
    let g = canvas.getContext("2d") as CanvasRenderingContext2D;
    let experiment: Experiment = new Experiment(g, width, height);
    init_listeners(experiment);

    experiment.draw_interference_pattern();
}

(window as any).start = start;