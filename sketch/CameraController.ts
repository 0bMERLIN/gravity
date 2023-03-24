import { Vector } from "p5";
import { Body } from "./Body.js";

export class CameraController {
    private target: Body;
    private startTimeMs: number;

    constructor(private focusedBody: Body, private lerpSpeedMs: number, public zoom: number = 10**8.7) {
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
        const relPos = v.copy().sub(this.currentPos);
        const zoomed = relPos.div(this.zoom);
        return zoomed.add(createVector(width / 2, height / 2));
    }

    worldToScreenDist(d: number): number {
        return d / this.zoom;
    }
}