export class Vec2 {
  x: number;
  y: number;

  constructor(_x: number, _y: number) {
    this.x = _x;
    this.y = _y;
  }

  /**
   * Adds v1 and v2 and returns the resulting Vec2
   */
  static add(v1: Vec2, v2: Vec2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * Subtracts v1 and v2 and returns the resulting Vec2
   */
  static sub(v1: Vec2, v2: Vec2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * Length of the vector
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Returns a copy of "this" scaled by the specified scalar.
   */
  scale(s: number) {
    return new Vec2(s * this.x, s * this.y);
  }

  static max(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
  }

  static min(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
  }

  static distance(v1: Vec2, v2: Vec2): number {
    return this.sub(v1, v2).length();
  }
}
