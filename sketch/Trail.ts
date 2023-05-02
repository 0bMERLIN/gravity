import { Vector } from "p5";
import { CameraController } from "./CameraController.js";
import { Entity } from "./Entity.js";
import { Simulation } from "./Simulation.js";

export class Trail extends Entity {

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
        if (this.points.length > 40) this.points.pop();

        if (this.lastPush == 0 || sim.timeSec - this.lastPush > 100000 * 0.7) {
            this.lastPush = sim.timeSec;
            this.points.unshift(this.following.pos.sub(sim.cameraController.currentPos));
        }
    }
}