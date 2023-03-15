import { Vector } from "p5";
import { Body } from "./Body.js";

export class CameraController {
    private target: Body;
    private startTimeMs: number;

    constructor(private focusedBody: Body, private lerpSpeedMs: number, public zoom: number = 10 ** 6) {
        this.target = focusedBody;
    }

    setTarget(target: Body) {
        this.target = target;
        this.startTimeMs = millis();
    }

    get currentPos(): Vector {
        const timeSinceAnimStart = millis() - this.startTimeMs;

        if (this.target == this.focusedBody) {
            return this.focusedBody.pos;
        }

        if (timeSinceAnimStart > this.lerpSpeedMs) {
            this.focusedBody = this.target;
            return this.focusedBody.pos;
        }

        return this.focusedBody.pos.lerp(this.target.pos, timeSinceAnimStart / this.lerpSpeedMs);
    }

    worldToScreen(v: Vector): Vector {
        return v.copy().sub(this.currentPos).div(this.zoom).add(createVector(width / 2, height / 2));
    }
}