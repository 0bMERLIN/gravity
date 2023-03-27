import { Vector, Color } from "p5";
import { G } from "../Math.js";
import { Simulation } from "../Simulation.js";
import { Body } from "./Body";


export class DynamicBody extends Body {
    constructor(public _pos: Vector, public vel: Vector, name: String, mass: number, col?: Color) {
        super(name, mass, createVector(0, 0), col);
    }

    calculateAccelerations(sim: Simulation) {
        return sim.entities.map(b => {
            if (b == this || !(b instanceof Body))
                return createVector(0, 0);

            // m
            const r = this._pos.dist(b.pos);

            // m/s^2
            const g = (G * b.mass) / (r ** 2);
            return b.pos.copy().sub(this.pos).normalize().mult(g);
        });
    }

    tick(sim: Simulation, dt: number) {
        const forces = this.calculateAccelerations(sim);
        const acc = forces.reduce((prev, curr) => prev.add(curr));
        acc.mult(dt);
        this.vel.add(acc);
        this._pos.add(this.vel.copy().mult(dt));
    }

    get pos() {
        return this._pos.copy();
    }
}
