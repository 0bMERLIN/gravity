import { Vector, Color } from "p5";
import { CameraController } from "../CameraController.js";
import { Simulation } from "../Simulation.js";
import { Entity } from "../Entity.js";

export abstract class Body extends Entity {

    public col: p5.Color

    // units: mass -> kg, spacial -> km
    constructor(public name: String, public mass: number, public _pos: Vector, col?: Color, public drawRadius: number = 15) {
        super(_pos, name);
        colorMode(HSB);
        if (col == null) this.col = color(random(0, 255), 250, 220);
        else this.col = col;
        colorMode(RGB);
    }

    abstract get pos(): Vector;

    draw(cam: CameraController) {
        push();
        noStroke();
        const c: Color = Object.create(this.col);
        const mPos = createVector(mouseX, mouseY);
        const distToMouse = mPos.dist(cam.worldToScreen(this.pos));
        c.setAlpha(100 + max(0, 255 - distToMouse * this.drawRadius / 1.5));
        fill(c);
        const screenPos = cam.worldToScreen(this.pos);
        circle(screenPos.x, screenPos.y, this.drawRadius);
        pop();
    }

    abstract tick(sim: Simulation, dt: number): void;
}


