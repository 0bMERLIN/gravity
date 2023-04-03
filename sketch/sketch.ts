import { Vector } from "p5";
import { Body } from "./body/Body.js";
import { Entity } from "./Entity.js";
import { CameraController } from "./CameraController.js";
import { secToDay } from "./Math.js";
import { Simulation } from "./Simulation.js";

declare global {
    interface Window {
        setup(): void
        draw(): void
        keyPressed(): void
        mousePressed(): void
        windowResized(): void
    }
}

class FreeFloatingCamera extends Entity {
    tick(_sim: Simulation, _dt: number): void {

    }

    draw(_cam: CameraController): void {

    }

    setPos(p: Vector) {
        this._pos = p;
    }
}

let sim: Simulation;

window.setup = () => {
    createCanvas(windowWidth, windowHeight)
    sim = new Simulation();
}

window.windowResized = () => {
    resizeCanvas(windowWidth, windowHeight);
}

window.draw = () => {
    background(0);

    fill(255, 255, 255);
    text(`t: ${Math.round(sim.timeDay)} days`, 20, 20);
    text(`zoom: ${sim.cameraController.zoom}`, 20, 50);
    text(`timeStep: ${secToDay(sim.timeStep)} days`, 20, 80);

    sim.tick(deltaTime);

    sim.draw();
}

window.mouseWheel = (event: any) => {
    sim.cameraController.zoom *= .5 + max(0, Math.sign(event.delta));
}

window.keyPressed = () => {
    if (key == ',') {
        sim.timeStep /= 2;
    }
    if (key == '.') {
        sim.timeStep *= 2;
    }
}

window.mousePressed = () => {
    const nearbyBodies = sim.entities
        // find all bodies
        .filter(e => e instanceof Body).map(e => e as Body)

        // find all bodies within selection distance
        .filter(b =>
            sim.cameraController.worldToScreen(b.pos).dist(createVector(mouseX, mouseY)) < b.drawRadius * 2
        );

    if (nearbyBodies.length > 0) {
        sim.cameraController.setTarget(nearbyBodies[0]);
    }

    else {
        sim.cameraController.setTarget(new FreeFloatingCamera(sim.cameraController.screenToWorld(createVector(mouseX, mouseY))));
    }
}
