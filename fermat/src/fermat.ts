import { Vec2 } from "./Vec2.js";
const REAL_WIDTH: number = 10;
const REAL_HEIGHT: number = 5;

const TAU = 6.28318530717958647692;
const PI = TAU / 2;

const DELTA_IN_STEPS = 0.045;
const TEMPS_ENTRE_STEPS = 10; // en millisegons

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
  angles_pel_print: number[];
  are_we_showing_snell: boolean;

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
    this.angles_pel_print = [];
    this.are_we_showing_snell = true;
  }

  set_default_parameters() {
    // TODO
  }
  overlay_snell() {
    this.g.strokeStyle = "green";
    let arrx: number[] =[]; 
    let arry: number[] =[]; 
    let punts = this.what_snell_predicts();
    punts.forEach((element) => {arrx.push(element.x as number);
                                arry.push(element.y as number);
    });

    console.log(`X: ${arrx}`);
    console.log(`Y: ${arry}`);
    this.g.beginPath();


    const N = this.ns.length;
    this.g.moveTo(punts[0].x * this.g_width, punts[0].y * this.g_height); // assumeixo que no està buit, que hauria de ser correcte crec
    for (let p of punts) {
      this.g.lineTo(p.x * this.g_width, p.y * this.g_height);
    }
    this.g.stroke();
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
    this.angles_pel_print = [];
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

      // Diagrama en text perquè em fa pal anar a buscar paper
      //    + <--- prev_point
      //    | \
      //    |   \ h
      //   l|     \
      //    |       \
      //    |        a\
      //    +----------+  <---- meeting_point
      //        1
      //         1
      //    +----------+  <---- meeting_point
      //    |        a/
      //    |       /
      //    |      /
      //   l|    / h
      //    |  /
      //    +   <--- prev_point

      // const l = meeting_point.y - prev_point.y;
      // const a = Math.atan(l); // tan(a) = l/1 => a = atan(l)
      // const h = 1 / Math.cos(a); // cos(a) = 1/h => h = 1/cos(a)
      //this.angles_pel_print.push(a);

      //let vel = 1 / this.ns[i];
      //ret += h / vel;
      //prev_point = meeting_point;

      const a = Math.atan(Vec2.sub(meeting_point, prev_point).y);
      const dist = 1 / Math.cos(a);
      this.angles_pel_print.push(a);

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
    this.g.strokeStyle = "white";
    const aux = this.g.lineWidth;
    this.g.lineWidth = 1;
    for (let i = 0; i < num_transicions; ++i) {
      let x = ((i + 1) / num_transicions) * this.g_width;
      let y = this.g_height;
      this.g.beginPath();
      this.g.moveTo(x, 0);
      this.g.lineTo(x, y);
      this.g.stroke();
    }
    this.g.lineWidth = aux;
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

  set_compute_indicator() {
    const canvas_elem = document.getElementById("c");
    if (canvas_elem?.style != undefined) {
      canvas_elem.style.border = "5px solid green";
    }
  }
  unset_compute_indicator() {
    const canvas_elem = document.getElementById("c");
    if (canvas_elem?.style != undefined) {
      canvas_elem.style.border = "5px solid black";
    }
  }

  start_descent() {
    console.log("Iniciant el descent");
    this.set_compute_indicator();
    if (!(this.descent_timer_id === null)) {
      console.log("Ja estavem descendint");
    } else {
      this.descent_timer_id = setInterval(() => {
        this.step_descent();
      }, TEMPS_ENTRE_STEPS);
    }
  }

  step_descent() {
    let keep_going = true;
    let iterations = 0;
    const max_iterations_allowed = iterations < 20000 * this.ns.length;
    while (keep_going && max_iterations_allowed) {
      // L'angle si que el podem modificar !!
      // No podem tocar l'últim punt (ni el de l'esquerra de tot ni el de la dreta de tot)
      const index_to_tweak = Math.floor(
        Math.random() * (this.media_change_verticals.length - 1),
      );

      let delta = Math.random() * DELTA_IN_STEPS;
      if (Math.random() < 0.5) delta = delta * -1;

      const old_h = this.media_change_verticals[index_to_tweak];
      const new_h = clamp(old_h + delta, 0, 1);

      const old_time = this.compute_time();
      this.media_change_verticals[index_to_tweak] = new_h;
      const new_time = this.compute_time();

      if (new_time < old_time) keep_going = false;
      else this.media_change_verticals[index_to_tweak] = old_h;

      iterations += 1;
    }
    this.refresh_outputs();
    if (iterations >= 500) {
      // No hem fet progrès, cancelem
      console.log("Hem fet massa iteracions sense progrès, parem");
      this.stop_descent();
    }
  }

  stop_descent() {
    console.log("Parant el descent");
    this.unset_compute_indicator();
    if (this.descent_timer_id === null) {
      console.log("No hi havia cap timer actiu");
    } else {
      clearTimeout(this.descent_timer_id);
      this.descent_timer_id = null;
    }
  }


  static refractedHeight_with_newton(
    A: number,
    B: number,
    n1: number,
    n2: number,
    tolerance = 1e-4,
    maxIterations = 50
  ): number {
    // First choice:
    let y = (A + B) / 2;

    for (let i = 0; i < maxIterations; i++) {
      const L1 = A - y;
      const L2 = y - B;

      // f(y)
      const f =
        n1 * L1 / Math.sqrt(1 + L1 * L1) -
        n2 * L2 / Math.sqrt(1 + L2 * L2);

      // f'(y) [Trobada utilitzant matlab jajajaja]
      const fp = 
          + (n1*(A - y)*(2*A - 2*y))/(2*Math.pow((A - y)*(A - y) + 1, 3/2)) 
          - n2/Math.sqrt((B - y)*(B - y) + 1) 
          - n1/Math.sqrt((A - y)*(A - y) + 1) 
          + (n2*(B - y)*(2*B - 2*y))/(2*Math.pow((B - y)*(B - y) + 1, 3/2))


      const yNext = y - f / fp;

      // Has it converged?
      if (Math.abs(yNext - y) < tolerance) {
        return yNext;
      }

      y = yNext;
    }

    throw new Error(
      "didn't converge"
    );
  }

  what_snell_predicts(): Vec2[] {
    let ret: Vec2[] = [];

    const num_transicions = this.ns.length;
    if (this.media_change_verticals.length != num_transicions) {
      throw Error("media change vertical no correspon amb ns");
    }

    // n1*sin(a1) = n2*sin(a2)
    ret.push(this.ray_start);
    let heights = [0.5].concat(this.media_change_verticals);
    const N = heights.length;
    for (let i = 1; i < N-1; ++i) {
      const n1: number = this.ns[i-1];
      const n2: number = this.ns[i];

      const A = heights[i-1];
      const B = heights[i+1];

      //console.log(A, B, n1, n2)
      console.log("num transicions:", num_transicions);
      let h = ExperimentFermat.refractedHeight_with_newton(A,B,n1,n2);
      let meeting_point = new Vec2(
        (i) / (num_transicions), 
        h);
      ret.push(meeting_point);
    }
    ret.push(new Vec2(1, heights[N-1]))
    return ret;
  }
  draw_what_snell_predicts() {
    this.g.strokeStyle = "green";

    let punts = this.what_snell_predicts();

    this.g.beginPath();
    this.g.moveTo(punts[0].x * this.g_width, punts[0].y * this.g_height); // assumeixo que no està buit, que hauria de ser correcte crec
    for (let p of punts.slice(1)) {
      this.g.lineTo(p.x * this.g_width, p.y * this.g_height);
    }
    this.g.stroke();
  }

  redraw() {
    this.g.lineWidth = 3;
    if (this.descent_timer_id === null) this.refresh_inputs();
    this.g.clearRect(0, 0, this.g_width, this.g_height);
    this.draw_media_backgrounds();
    this.draw_media_transitions();
    if (this.are_we_showing_snell) this.overlay_snell();
    this.draw_ray();
    const time_report = document.getElementById("time_taken");
    if (time_report === null) throw Error("algú ha borrat lo del temps");

    time_report.innerHTML = this.compute_time().toString();
  }

  randomitza_valors_existents() {
    console.log("Randomitzant");
    if (this.ns.length === 0)
      window.alert("Has d'afegir els botons, abans (amb 'Afegeix-ne')");
    this.ns = this.ns.map((_) => 1 + Math.random());
    this.media_change_verticals = this.media_change_verticals.map((_) =>
      Math.random(),
    );
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
  refresh_outputs() {
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

// For seeing what gradient descent is dealing with
export function energyData(exp: ExperimentFermat, index: number): string {
  const granularitat = 0.01;
  let output: string = "";

  for (let y = 0; y < 1; y += granularitat) {
    exp.media_change_verticals[index] = y;
    output += `${y},${exp.compute_time()}\n`;
  }

  return output;
}

function clamp(x: number, lower: number, upper: number): number {
  return Math.min(Math.max(lower, x), upper);
}
