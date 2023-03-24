import { Body, BodyOnRails, DynamicBody, StationaryBody } from "./Body.js";
import { CameraController } from "./CameraController.js";
import { AU, MASS_EARTH, MASS_MOON, MASS_SUN } from "./Math.js";

export class Simulation {
    timeSec = 0
    get timeMin() { return this.timeSec / 60; }
    get timeHour() { return this.timeMin / 60 }
    get timeDay() { return this.timeHour / 24 }
    timeStep = 10000; // seconds

    bodies: Body[] = [];

    cameraController: CameraController

    nSubTicks = 100;

    constructor() {
        const sun = new StationaryBody("Sun", MASS_SUN, createVector(0, 0), color(255, 255, 0));
        const earth = new BodyOnRails(sun, 0, .5, AU, "Earth", MASS_EARTH, color(0, 255, 0));
        // const moon = new BodyOnRails(earth, 0, 0, 0.002569 * AU, "Moon", MASS_MOON, color(80, 80, 80));

        this.bodies.push(earth, sun);

        this.tick(0.0001);

        // const spacecraft = new DynamicBody(
        //     earth.pos.add(createVector(0, 384_400_000)),
        //     createVector(-29780 - 1000, 0),
        //     "Spacecraft", 0, color(255, 0, 255));

        // this.bodies.push(spacecraft);
        this.cameraController = new CameraController(sun, 500);
    }

    tick(dt: number) {
        for (let i = 0; i < this.nSubTicks + 1; i++) {
            const step = (this.timeStep * (dt / 1000)) / this.nSubTicks;
            this.timeSec += step;

            for (const body of this.bodies) body.tick(this, step);
            if (this.cameraController != null) {
                this.draw();
            }
        }
    }

    draw() {
        for (const body of this.bodies)
            body.draw(this.cameraController);
    }
}
