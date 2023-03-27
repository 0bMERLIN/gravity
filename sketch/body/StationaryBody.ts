import { Vector } from "p5";
import { Simulation } from "../Simulation.js";
import { Body } from "./Body.js";

export class StationaryBody extends Body {
    tick(_sim: Simulation, _dt: number) {

    }

    get pos(): Vector {
        return this._pos.copy();
    }
}