import { Body, BodyOnRails, StationaryBody } from "./Body.js";
import { CameraController } from "./CameraController.js";
import { MASS_EARTH, MASS_MOON, MASS_SUN } from "./Math.js";

export class Simulation {
    timeSec = 0
    get timeMin() { return this.timeSec / 60; }
    get timeHour() { return this.timeMin / 60 }
    get timeDay() { return this.timeHour / 24 }
    timeStep = 1000000; // seconds

    bodies: Body[] = [];

    cameraController: CameraController

    constructor() {
        const sun = new StationaryBody("Sun", MASS_SUN, createVector(0, 0), color(255, 255, 0))
        const earth = new BodyOnRails(sun, 0, 1, "Earth", MASS_EARTH, color(0, 255, 0));
        const moon = new BodyOnRails(earth, 0, .002569, "Moon", MASS_MOON, color(80, 80, 80))
        this.bodies.push(earth, sun, moon);
        this.cameraController = new CameraController(earth, 500);
    }

    tick(dt: number) {
        this.timeSec += this.timeStep * (dt / 1000);
    }

    draw() {
        for (const body of this.bodies) body.draw(this.cameraController);
    }
}
