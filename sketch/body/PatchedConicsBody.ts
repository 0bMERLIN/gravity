import { Color, Vector } from "p5";
import { CameraController } from "../CameraController.js";
import { BodyOnRails } from "./BodyOnRails.js";
import { Simulation } from "../Simulation.js";
import { G } from "../Math.js";
import { Entity } from "../Entity.js";

// for visualization:
// a vastly overengineered arrow, you can place into the world to visualize velocities, etc.
class ArrowEntity extends Entity {
    constructor(public vec: Vector, pos: Vector, name: String, public screenLength: number = 100, public col: Color = color(255, 0, 0), public thickness: number = 5) {
        super(pos, name);
    }

    tick(_sim: Simulation, _dt: number): void {

    }

    draw(cam: CameraController): void {
        const start = cam.worldToScreen(this.pos);
        const end = cam.worldToScreen(this.pos.copy().add(this.vec.copy().normalize().mult(cam.screenToWorldDist(this.screenLength))));
        push();
        stroke(this.col);
        strokeWeight(this.thickness);
        // rotate vector slightly and shorten, to get position of the arrows head line ends
        const tipLeftSide = start.copy().add(end.copy().sub(start).mult(0.8).rotate(radians(10)));
        const tipRightSide = start.copy().add(end.copy().sub(start).mult(0.8).rotate(radians(-10)));

        line(start.x, start.y, end.x, end.y);
        line(end.x, end.y, tipLeftSide.x, tipLeftSide.y);
        line(end.x, end.y, tipRightSide.x, tipRightSide.y);
        pop();
    }
}

export class PatchedConicsBody extends BodyOnRails {

    parentSOI() {
        if (this.parent instanceof BodyOnRails)
            return this.parent.semiMajorAxisM * (this.parent.mass / this.parent.parent.mass) ** (2 / 5);
        else
            return Infinity;
    }

    switchSOIParent(sim: Simulation) { // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        if (!(this.parent instanceof BodyOnRails)) return;
        if (!(this.parent.parent instanceof BodyOnRails)) return;

        const v = this.velocityVector(sim).add(this.parent.velocityVector(sim)).add(createVector(0,0,0.1));

        /*
        sim.paused = true;
            console.log(v.mag());
            sim.createEntity(new ArrowEntity(v, this.pos.copy(), "vel"));*/

        // https://orbital-mechanics.space/classical-orbital-elements/orbital-elements-and-the-state-vector.html
        // orbital state vectors to orbital elements, relative to parents parent
        const GM = G * (this.mass, this.parent.parent.mass);
        const relPos = this.pos.copy().sub(this.parent.parent.pos);
        const angularMomentum = relPos.cross(v); // AAAAAAAAAAAAAAAAAAAAAAA

        // node line
        const K = createVector(0, 0, 1);
        const nVec = K.copy().cross(angularMomentum);
        const N = nVec.mag();

        // eccentricity
        const eVec = v.copy().cross(angularMomentum).div(GM).sub(relPos.copy().normalize());
        const e = eVec.mag();

        // argument of periapsis
        const omega = degrees(2 * PI * acos(nVec.copy().dot(eVec) / (N * e)))
        
        //sim.paused = true;

        this.eccentricity = e;
        this.argumentOfPeriapsisDeg = omega;
        this.semiMajorAxisM = relPos.mag();
        this.parent = this.parent.parent;
    }

    tick(sim: Simulation, dt: number) {
        super.tick(sim, dt);
        //this.parent.name != "Earth" && 
        if (this.parent instanceof BodyOnRails && this.pos.dist(this.parent.pos) > this.parentSOI()) {
            this.switchSOIParent(sim);
        }
    }

    draw(cam: CameraController) {
        push();
        super.draw(cam);
        this.drawOrbit(cam);

        fill(255, 0, 0, 50);
        const screenPos = cam.worldToScreen(this.parent.pos);
        circle(screenPos.x, screenPos.y, 2 * cam.worldToScreenDist(this.parentSOI()));
        pop();
    }
}