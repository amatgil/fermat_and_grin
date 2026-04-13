export class Vec3 {
    constructor(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }
    static fromArray(arr) {
        return new Vec3(arr[0], arr[1], arr[2]);
    }
    /**
     * Adds v1 and v2 and returns the resulting Vec3
     */
    static add(v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    /**
     * Subtracts v1 and v2 and returns the resulting Vec3
     */
    static sub(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    /**
     * Length of the vector
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    /**
     * Returns a copy of "this" scaled by the specified scalar.
     */
    scale(s) {
        return new Vec3(s * this.x, s * this.y, s * this.z);
    }
    static max(v1, v2) {
        return new Vec3(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y), Math.max(v1.z, v2.z));
    }
    static min(v1, v2) {
        return new Vec3(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y), Math.min(v1.z, v2.z));
    }
    static distance(v1, v2) {
        return this.sub(v1, v2).length();
    }
}
