import { Vector } from "p5";
import { CameraController } from "./CameraController";
import { Simulation } from "./Simulation";

export abstract class Entity {

    constructor(public _pos: Vector, public name: String) {

    }

    get pos() {
        return this._pos;
    }

    abstract tick(sim: Simulation, dt: number): void;
    abstract draw(cam: CameraController): void;
}
