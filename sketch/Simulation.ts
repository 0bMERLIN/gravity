import { BodyOnRails } from "./body/BodyOnRails.js";
import { DynamicBody } from "./body/DynamicBody.js";
import { Entity } from "./Entity.js";
import { StationaryBody } from "./body/StationaryBody.js";
import { CameraController } from "./CameraController.js";
import { AU, G, MASS_EARTH, MASS_MOON, SOLAR_MASS } from "./Math.js";
import { Vector } from "p5";
import { PatchedConicsBody } from "./body/PatchedConicsBody.js";

class Trail extends Entity {

    private points: Vector[] = []
    private lastPush = 0;

    constructor(private following: Entity, name: String = "Trail") {
        super(following.pos, "Trail");
    }

    draw(cam: CameraController) {
        push();
        strokeWeight(3);
        stroke(255, 0, 0, 255);
        noFill();

        beginShape();

        const F = cam.worldToScreen(this.following.pos);
        curveVertex(F.x, F.y);
        curveVertex(F.x, F.y);

        for (let i = 0; i < this.points.length; i++) {
            const P = cam.worldToScreen(this.points[i].copy().add(cam.currentPos));
            curveVertex(P.x, P.y);
        }


        endShape();

        pop();
    }

    tick(sim: Simulation, _dt: number) {
        if (this.points.length > 30) this.points.pop();

        if (this.lastPush == 0 || sim.timeSec - this.lastPush > 100000) {
            this.lastPush = sim.timeSec;
            this.points.unshift(this.following.pos.sub(sim.cameraController.currentPos));
        }
    }
}

export class Simulation {
    timeSec = 60*60*24*4.225 - 60*60*10;
    get timeMin() { return this.timeSec / 60; }
    get timeHour() { return this.timeMin / 60 }
    get timeDay() { return this.timeHour / 24 }
    timeStep = 10000; // seconds

    entities: Entity[] = [];

    cameraController: CameraController

    nSubTicks = 500;

    paused = false;

    sun = new StationaryBody("Sun", SOLAR_MASS, createVector(0, 0), color(255, 255, 0));
    earth = new BodyOnRails(this.sun, 90, 0, AU, "Earth", MASS_EARTH, color(0, 255, 0));
    moon = new BodyOnRails(this.earth, 90, 0, 0.002569 * AU, "Moon", MASS_MOON, color(80, 80, 80));

    constructor() {
        const x = new PatchedConicsBody(this.moon, 130, 0.7, 66176154, "X", 0, color(255, 0, 255));
        //const y = new DynamicBody(createVector(-10659205646.770973, 149454454605.03372), createVector(-672 + -29710, 367 + -2164), "Y", 0);

        this.entities.push(this.earth, this.sun, this.moon, x);

        this.cameraController = new CameraController(this.earth, 500);
    }

    createEntity(e: Entity) {
        this.entities.push(e);
    }

    deleteEntity(name: String) {
        this.entities = this.entities.filter(e => e.name != name);
    }

    focus(e: Entity) {
        this.cameraController.setTarget(e);
    }

    tick(dt: number) {
        const es = [...this.entities]; // avoid concurrent modification exceptions

        for (let i = 0; i < this.nSubTicks + 1; i++) {
            if (this.paused) return;
            const step = (this.timeStep * (dt / 1000)) / this.nSubTicks;
            this.timeSec += step;

            for (const body of es) body.tick(this, step);
        }
    }

    draw() {
        for (const body of this.entities)
            body.draw(this.cameraController);
    }
}
