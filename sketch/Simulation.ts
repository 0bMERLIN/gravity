import { BodyOnRails } from "./body/BodyOnRails.js";
import { Entity } from "./Entity.js";
import { StationaryBody } from "./body/StationaryBody.js";
import { CameraController } from "./CameraController.js";
import { AU, MASS_EARTH, MASS_MOON, SOLAR_MASS } from "./Math.js";
import { PatchedConicsBody } from "./body/PatchedConicsBody.js";



export class Simulation {
    timeSec = 60 * 60 * 24 * 4.225 - 60 * 60 * 20;
    get timeMin() { return this.timeSec / 60; }
    get timeHour() { return this.timeMin / 60 }
    get timeDay() { return this.timeHour / 24 }
    timeStep = 10000; // seconds

    entities: Entity[] = [];

    cameraController: CameraController

    nSubTicks = 500;

    paused = false;

    sun = new StationaryBody("Sun", SOLAR_MASS, createVector(0, 0), color(255, 255, 0));
    earth = new BodyOnRails(this.sun, 90, 0, AU, 0, "Earth", MASS_EARTH, color(0, 255, 0));
    moon = new BodyOnRails(this.earth, 0, 0, 0.002569 * AU, 0, "Moon", MASS_MOON, color(80, 80, 80));

    constructor() {
        const x = new PatchedConicsBody(this.moon, 130, 0.7, 66176154, 0, "X", 0, color(255, 0, 255));
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
