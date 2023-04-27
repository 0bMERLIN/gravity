import { Vector } from "p5";
import { Entity } from "./Entity.js";

export class CameraController {
    private target: Entity;
    private startTimeMs: number;

    constructor(private focusedEntity: Entity, private lerpSpeedMs: number, public zoom: number = 10**6) {
        this.target = focusedEntity;
    }

    setTarget(target: Entity) {
        this.target = target;
        this.startTimeMs = millis();
    }

    get currentPos(): Vector {
        const timeSinceAnimStart = millis() - this.startTimeMs;

        if (this.target == this.focusedEntity) {
            return this.focusedEntity.pos;
        }

        if (timeSinceAnimStart > this.lerpSpeedMs) {
            this.focusedEntity = this.target;
            return this.focusedEntity.pos;
        }

        return this.focusedEntity.pos.lerp(this.target.pos, timeSinceAnimStart / this.lerpSpeedMs);
    }

    worldToScreen(v: Vector): Vector {
        const relPos = v.copy().sub(this.currentPos);
        const zoomed = relPos.div(this.zoom);
        return zoomed.add(createVector(width / 2, height / 2));
    }

    worldToScreenDist(d: number): number {
        return d / this.zoom;
    }

    screenToWorld(v: Vector) {
        return v.copy().sub(createVector(width / 2, height / 2)).mult(this.zoom).add(this.currentPos);
    }

    screenToWorldDist(d: number): number {
        return d * this.zoom;
    }
}