import { Vector, Color } from "p5";
import { CameraController } from "./CameraController.js";
import { G, GM, secToDay } from "./Math.js";
import { Simulation } from "./Simulation.js";

export abstract class Body {

    public col: p5.Color

    // units: mass -> kg, spacial -> km
    constructor(public name: String, public mass: number, public _pos: Vector, col?: Color) {
        colorMode(HSB);
        if (col == null) this.col = color(random(0, 255), 250, 220);
        else this.col = col;
        colorMode(RGB);
    }

    abstract get pos(): Vector;

    draw(cam: CameraController) {
        push();
        noStroke();
        fill(this.col);
        const screenPos = cam.worldToScreen(this.pos);
        circle(screenPos.x, screenPos.y, 10);
        pop();
    }

    abstract tick(sim: Simulation, dt: number): void;
}

export class BodyOnRails extends Body {

    constructor(public parent: Body, public argumentOfPeriapsisDeg: number, public eccentricity: number, public semiMajorAxisM: number, name: String, mass: number, col?: Color) {
        super(name, mass, createVector(0, 0), col);
        if (eccentricity >= 1 || eccentricity < 0) {
            throw Error(`Error while initiliazing "${name}": eccentricity must be >= 0 and < 1, not ${eccentricity}!`);
        }
    }

    trueAnomaly(sim: Simulation) {
        const n = sqrt(GM(this.parent.mass + this.mass) / this.semiMajorAxisM ** 3); // mean motion
        const M = n * sim.timeSec; // mean anomaly
        let E = M; // initial guess for eccentric anomaly
        while (true) {
            const dE = (M - E + this.eccentricity * sin(E)) / (1 - this.eccentricity * cos(E)); // Newton-Raphson iteration
            E += dE;
            if (abs(dE) < 1e-4) break; // converged
        }
        const theta = 2 * atan(sqrt((1 + this.eccentricity) / (1 - this.eccentricity)) * tan(E / 2)); // true anomaly
        return theta;
    }

    tick(sim: Simulation, _dt: number) { // TODO: how does this work...
        const omega = this.argumentOfPeriapsisDeg; // argument of periapsis in degrees

        // calculate true anomaly
        const theta = this.trueAnomaly(sim);

        // calculate distance from parent
        const r = this.semiMajorAxisM * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * cos(theta));
        this._pos = createVector(cos(theta + radians(omega)), sin(theta + radians(omega))).mult(r);
    }

    get pos(): Vector {
        return this._pos.copy().add(this.parent.pos);
    }

    draw(cam: CameraController) {
        push();
        super.draw(cam);

        const dF = this.semiMajorAxisM * this.eccentricity;

        const FPnorm = createVector(cos(radians(this.argumentOfPeriapsisDeg)), sin(radians(this.argumentOfPeriapsisDeg)));
        const FP = FPnorm.copy().mult(dF);
        
        stroke(255, 0, 0);
        const Ps = cam.worldToScreen(this.parent.pos);
        const foo = Ps.copy().sub(cam.worldToScreen(FP));
        line(Ps.x, Ps.y, foo.x, foo.y)

        const p = cam.worldToScreen(this.parent.pos.add(FP));

        const minorAxis = sqrt(this.semiMajorAxisM**2 - (this.semiMajorAxisM * this.eccentricity)**2);

        fill(255, 0, 0);

        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        ellipse(p.x, p.y, cam.worldToScreenDist(this.semiMajorAxisM)*2, cam.worldToScreenDist(minorAxis) * 2, 100)

        pop();
    }
}

export class StationaryBody extends Body {
    tick(_sim: Simulation, _dt: number) {

    }

    get pos(): Vector {
        return this._pos.copy();
    }
}

export class DynamicBody extends Body {
    constructor(public _pos: Vector, public vel: Vector, name: String, mass: number, col?: Color) {
        super(name, mass, createVector(0, 0), col);
    }

    calculateAccelerationsMPS(sim: Simulation) {
        return sim.bodies.map(b => {
            if (b == this) return createVector(0, 0);

            // m
            const r = this._pos.dist(b.pos);

            // m/s^2
            const g = (G * b.mass) / (r ** 2);
            return b.pos.copy().sub(this.pos).normalize().mult(g);
        });
    }

    tick(sim: Simulation, dt: number) {
        const forces = this.calculateAccelerationsMPS(sim);
        const acc = forces.reduce((prev, curr) => prev.add(curr));
        acc.mult(dt);
        this.vel.add(acc);
        this._pos.add(this.vel.copy().mult(dt));
    }

    get pos() {
        return this._pos.copy();
    }
}
