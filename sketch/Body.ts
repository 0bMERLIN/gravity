import { Vector, Color } from "p5";
import { CameraController } from "./CameraController.js";
import { AU, GM } from "./Math.js";
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

    abstract draw(cam: CameraController): void;
    abstract tick(sim: Simulation): void;
}

export class BodyOnRails extends Body {

    constructor(public parent: Body, public eccentricity: number, public semiMajorAxisAU: number, name: String, mass: number, col?: Color) {
        super(name, mass, createVector(0, 0), col);
        if (eccentricity >= 1 || eccentricity < 0) {
            throw Error(`Error while initiliazing "${name}": eccentricity must be >= 0 and < 1, not ${eccentricity}!`);
        }
    }

    get semiMajorAxisKm() {
        return this.semiMajorAxisAU * AU;
    }

    trueAnomaly(sim: Simulation) {
        const n = sqrt(GM(this.parent.mass + this.mass) / this.semiMajorAxisKm ** 3); // mean motion
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

    tick(sim: Simulation) { // TODO: how does this work...
        // calculate focus
        const omega = 45; // argument of periapsis in degrees
        const focus = createVector(this.eccentricity * cos(radians(omega)), this.eccentricity * sin(radians(omega)));

        // calculate true anomaly
        const theta = this.trueAnomaly(sim);

        // calculate distance from parent
        const r = this.semiMajorAxisKm * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * cos(theta));

        this._pos = createVector(cos(theta + radians(omega)), sin(theta + radians(omega))).mult(r).add(focus);
    }

    draw(cam: CameraController) {
        push();
        fill(this.col);
        const screenPos = cam.worldToScreen(this.pos);
        circle(screenPos.x, screenPos.y, 20);
        pop();
    }

    get pos(): Vector {
        return this._pos.copy().add(this.parent.pos);
    }
}

export class StationaryBody extends Body {
    tick() {

    }

    draw(cam: CameraController) {
        push();
        fill(this.col);
        const screenPos = cam.worldToScreen(this.pos);
        console.log(screenPos)
        circle(screenPos.x, screenPos.y, 20);
        pop();
    }

    get pos(): Vector {
        return this._pos.copy();
    }
}
