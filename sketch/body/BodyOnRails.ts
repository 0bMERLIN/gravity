import { Color, Vector } from "p5";
import { CameraController } from "../CameraController.js";
import { G } from "../Math.js";
import { Simulation } from "../Simulation.js";
import { Body } from "./Body.js";

export class BodyOnRails extends Body {

    constructor(public parent: Body, public argumentOfPeriapsisDeg: number, public eccentricity: number, public semiMajorAxisM: number, name: String, mass: number, col?: Color) {
        super(name, mass, createVector(0, 0), col);
        if (eccentricity >= 1 || eccentricity < 0) {
            throw Error(`Error while initiliazing "${name}": eccentricity must be >= 0 and < 1, not ${eccentricity}!`);
        }
    }

    eccentricAnomaly(sim: Simulation) {
        const n = sqrt((G * (this.parent.mass + this.mass)) / this.semiMajorAxisM ** 3); // mean motion
        const M = n * sim.timeSec; // mean anomaly
        let E = M; // initial guess for eccentric anomaly

        let i;
        let maxIter = 10; // TODO: very low - fix?
        for (i = 0; i < maxIter; i++) {
            const dE = (M - E + this.eccentricity * sin(E)) / (1 - this.eccentricity * cos(E)); // Newton-Raphson iteration
            E += dE * 0.01;
            if (abs(dE) < 1e-4) break; // converged
        }

        return E;
    }

    trueAnomaly(sim: Simulation) {
        const E = this.eccentricAnomaly(sim);
        const theta = 2 * atan(sqrt((1 + this.eccentricity) / (1 - this.eccentricity)) * tan(E / 2)); // true anomaly
        return theta;
    }

    angularMomentumVec(sim: Simulation) {
        return this.pos.copy().sub(this.parent.pos).cross(this.velocityVector(sim));
    }

    angularMomentum(sim: Simulation) {
        return this.angularMomentumVec(sim).mag();
    }

    // compute orbital velocity state vector relative to the parents parent (sun, if `this` is an entity orbiting earth.)
    velocityVector(sim: Simulation) {

        //
        const GM = G * (this.parent.mass + this.mass);

        // distance from current parent
        const dist = this.pos.dist(this.parent.pos);

        // https://downloads.rene-schwarz.com/download/M001-Keplerian_Orbit_Elements_to_Cartesian_State_Vectors.pdf
        // pain.
        const E = this.eccentricAnomaly(sim);
        const vDir = createVector(
            -sin(E),
            sqrt(1 - this.eccentricity ** 2) * cos(E),
            0
        );

        // done :)
        return vDir.copy().mult(
            sqrt(GM * (2 / dist - 1 / this.semiMajorAxisM))
        ).rotate(radians(this.argumentOfPeriapsisDeg));
    }

    tick(sim: Simulation, _dt: number) {
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

    // velocity relative to parent body
    relVel() {
        const r = this.pos.dist(this.parent.pos);
        const GM = G * (this.parent.mass + this.mass);
        return sqrt(GM * (2 / r - 1 / this.semiMajorAxisM));
    }

    drawOrbit(cam: CameraController) {
        // how far is the focus from the center?
        const dF = this.semiMajorAxisM * this.eccentricity;

        // direction from focus to the center
        const FPnorm = createVector(cos(radians(this.argumentOfPeriapsisDeg)), sin(radians(this.argumentOfPeriapsisDeg)));

        // vector from focus to center
        const FP = FPnorm.copy().mult(dF);

        // center
        const P = cam.worldToScreen(this.parent.pos.sub(FP));

        // :)
        const semiMinorAxis = sqrt(this.semiMajorAxisM ** 2 - (this.semiMajorAxisM * this.eccentricity) ** 2);

        push();
        // color
        noFill();
        const distToScreenCenter = createVector(width / 2, height / 2).dist(cam.worldToScreen(this.parent.pos));
        stroke(255, 0, 0, .8 * (255 - 255 * distToScreenCenter / width));
        strokeWeight(3);

        // draw!
        translate(P.x, P.y);
        rotate(radians(this.argumentOfPeriapsisDeg));
        ellipse(0, 0, cam.worldToScreenDist(this.semiMajorAxisM) * 2, cam.worldToScreenDist(semiMinorAxis) * 2, 100);
        pop();
    }

    draw(cam: CameraController) {
        push();
        super.draw(cam);
        this.drawOrbit(cam);
        pop();
    }
}