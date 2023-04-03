import { BodyOnRails } from "./body/BodyOnRails.js";
import { DynamicBody } from "./body/DynamicBody.js";
import { Entity } from "./Entity.js";
import { StationaryBody } from "./body/StationaryBody.js";
import { CameraController } from "./CameraController.js";
import { AU, MASS_EARTH, MASS_MOON, SOLAR_MASS } from "./Math.js";
import { Vector } from "p5";

class Trail extends Entity {

    private points: Vector[] = []
    private lastPush = 0;

    constructor(private following: Entity) {
        super(following.pos);
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
        if (this.points.length > 10) this.points.pop();

        if (sim.timeSec - this.lastPush > 100000) {
            this.lastPush = sim.timeSec;
            this.points.unshift(this.following.pos.sub(sim.cameraController.currentPos));
        }
    }
}

export class Simulation {
    timeSec = 0
    get timeMin() { return this.timeSec / 60; }
    get timeHour() { return this.timeMin / 60 }
    get timeDay() { return this.timeHour / 24 }
    timeStep = 10000; // seconds

    entities: Entity[] = [];

    cameraController: CameraController

    nSubTicks = 500;

    constructor() {
        const sun = new StationaryBody("Sun", SOLAR_MASS, createVector(0, 0), color(255, 255, 0));
        const earth = new BodyOnRails(sun, 90, 0, AU, "Earth", MASS_EARTH, color(0, 255, 0));
        const moon = new BodyOnRails(earth, 0, 0, 0.002569 * AU, "Moon", MASS_MOON, color(80, 80, 80));

        this.entities.push(earth, sun);

        this.tick(0.1);

        const spacecraft = new DynamicBody(
            earth.pos.add(createVector(0, AU * 0.002569)),
            createVector(-29000 - 1830, 0),
            "Spacecraft", 0, color(255, 0, 255));

        this.entities.push(spacecraft);

        this.entities.push(new Trail(spacecraft))

        this.cameraController = new CameraController(earth, 500);
    }

    focus(e: Entity) {
        this.cameraController.setTarget(e);
    }

    tick(dt: number) {
        for (let i = 0; i < this.nSubTicks + 1; i++) {
            const step = (this.timeStep * (dt / 1000)) / this.nSubTicks;
            this.timeSec += step;

            for (const body of this.entities) body.tick(this, step);
        }
    }

    draw() {
        for (const body of this.entities)
            body.draw(this.cameraController);
    }
}
