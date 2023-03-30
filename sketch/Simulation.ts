import { BodyOnRails } from "./body/BodyOnRails.js";
import { DynamicBody } from "./body/DynamicBody.js";
import { Entity } from "./Entity.js";
import { StationaryBody } from "./body/StationaryBody.js";
import { CameraController } from "./CameraController.js";
import { AU, MASS_EARTH, MASS_MOON, SOLAR_MASS } from "./Math.js";
import { Vector } from "p5";

// alpha: 0.0 to 1.0
type TrailPoint = { position: Vector, alpha: number }

class Trail extends Entity {

    private points: TrailPoint[] = []

    constructor(private following: Entity) {
        super(following.pos);
    }

    draw(cam: CameraController) {
        let last = this.following.pos;

        for (const p of this.points) {
            const P = cam.worldToScreen(p.position);
            const L = cam.worldToScreen(last);

            push();
            strokeWeight(3);
            stroke(255, 0, 0, p.alpha * 255);
            point(P.x, P.y);
            pop();

            last = p.position.copy();
        }
    }

    tick(_sim: Simulation, dt: number) {
        if (this.points.length == 0 || this.points[this.points.length-1].alpha < .999) {
            this.points.push({ position: this.following.pos.copy(), alpha: 1 });
        }

        this.points = this.points
            // decrease alpha
            .map(p => ({ ...p, alpha: p.alpha - 0.00001 * dt }))
            // remove points with alpha < 0
            .filter(p => p.alpha > 0);
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
