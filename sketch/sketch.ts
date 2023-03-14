import { Color, Vector } from "p5";

const G = 6.67408 * (10 ** (-11));
const AU = 1.49597870691 * 10**8;
const SOLAR_MASS = 1.989 * 10 ** 30;

const MASS_EARTH = 3.00273 * 10 ** (-6) * SOLAR_MASS;
const MASS_SUN = SOLAR_MASS;
const MASS_MOON = 3.69432 * 10 ** (-8) * SOLAR_MASS;

var zoom = 10 ** 6;
var timeStep = 1000000; // seconds
var time = 0; // seconds

const GM = (combinedMass: number) => G * combinedMass * 10 ** (-9);

function worldToScreen(v: Vector): Vector {
  return v.copy().sub(cameraController.getCurrentPos()).div(zoom).add(createVector(width / 2, height / 2));
}

function screenToWorld(v: Vector): Vector {
  return v.copy().sub(createVector(width / 2, height / 2)).mult(zoom).add(cameraController.getCurrentPos());
}

class CameraController {
  private target: Body
  private startTimeMs: number

  constructor(private focusedBody: Body, private lerpSpeedMs: number) {
    this.target = focusedBody;
  }

  setTarget(target: Body) {
    this.target = target;
    this.startTimeMs = millis();
  }

  getCurrentPos(): Vector {
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
}

abstract class Body {

  public col: p5.Color

  // units: mass -> kg, spacial -> km
  constructor(public name: String, public mass: number, public _pos: Vector, col?: Color) {
    colorMode(HSB);
    if (col == null) this.col = color(random(0, 255), 250, 220);
    else this.col = col;
    colorMode(RGB);
  }

  abstract get pos(): Vector;

  abstract draw(): void;
}

class BodyOnRails extends Body {

  constructor(public parent: Body, public eccentricity: number, public semiMajorAxisAU: number, name: String, mass: number, col?: Color) {
    super(name, mass, createVector(0, 0), col);
    if (eccentricity >= 1 || eccentricity < 0) {
      throw Error(`Error while initiliazing "${name}": eccentricity must be >= 0 and < 1, not ${eccentricity}!`);
    }
  }

  get semiMajorAxisKm() {
    return this.semiMajorAxisAU * AU;
  }

  trueAnomaly() {
    const n = sqrt(GM(this.parent.mass + this.mass) / this.semiMajorAxisKm**3); // mean motion
    const t = timeSec(); // time since start
    const M = n * t; // mean anomaly
    let E = M; // initial guess for eccentric anomaly
    while (true) {
      const dE = (M - E + this.eccentricity * sin(E)) / (1 - this.eccentricity * cos(E)); // Newton-Raphson iteration
      E += dE;
      if (abs(dE) < 1e-4) break; // converged
    }
    const theta = 2 * atan(sqrt((1 + this.eccentricity) / (1 - this.eccentricity)) * tan(E / 2)); // true anomaly
    return theta;
  }

  move() { // TODO: how does this work...
    // calculate focus
    const omega = 45; // argument of periapsis in degrees
    const focus = createVector(this.eccentricity * cos(radians(omega)), this.eccentricity * sin(radians(omega)));

    // calculate true anomaly
    const theta = this.trueAnomaly();
    
    // calculate distance from parent
    const r = this.semiMajorAxisKm * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * cos(theta));

    this._pos = createVector(cos(theta + radians(omega)), sin(theta + radians(omega))).mult(r).add(focus);
  }

  draw() {
    this.move();
    push();
    fill(this.col);
    const screenPos = worldToScreen(this.pos);
    circle(screenPos.x, screenPos.y, 20);
    pop();
  }

  get pos(): Vector {
    return this._pos.copy().add(this.parent.pos);
  }
}

class StationaryBody extends Body {
  draw() {
    push();
    fill(this.col);
    const screenPos = worldToScreen(this.pos);
    circle(screenPos.x, screenPos.y, 20);
    pop();
  }

  get pos(): Vector {
    return this._pos.copy();
  }
}

declare global {
  interface Window {
      setup(): void
      draw(): void
      keyPressed(): void
      mousePressed(): void
      windowResized(): void
  }
}

let bodies: Body[] = [];
let cameraController: CameraController = null;

window.setup = () => {
  createCanvas(windowWidth, windowHeight)

  const sun = new StationaryBody("Sun", MASS_SUN, createVector(0, 0), color(255, 255, 0))
  const earth = new BodyOnRails(sun, 0, 1, "Earth", MASS_EARTH, color(0, 255, 0));
  const moon = new BodyOnRails(earth, 0, .002569, "Moon", MASS_MOON, color(80, 80, 80))
  bodies.push(earth, sun, moon);
  cameraController = new CameraController(sun, 100);
}

window.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight);
}

const timeSec = () => time
const timeMin = () => timeSec() / 60
const timeHour = () => timeMin() / 60
const timeDay = () => timeHour() / 24
const timeYears = () => timeDay() / 365
const secToDay = (t: number) => ((t / 60) / 60) / 24

window.draw = () => {
  background(0);

  fill(255, 255, 255);
  text(`t: ${timeDay()} days`, 20, 20);
  text(`zoom: ${zoom}`, 20, 50);
  text(`timeStep: ${secToDay(timeStep)} days`, 20, 80);

  for (const body of bodies) {
    push();
    body.draw();
  }

  time += timeStep * (deltaTime / 1000);
}

window.mouseWheel = (event: any) => {
  zoom *= (event.delta > 0) ? 1.5 : 0.5;
  zoom = max(zoom, 0);
}

window.keyPressed = () => {
  if (key == ',') {
    timeStep /= 2;
  }
  if (key == '.') {
    timeStep *= 2;
  }
}

window.mousePressed = () => {
  for (const body of bodies) {
    if (worldToScreen(body.pos).dist(createVector(mouseX, mouseY)) < 10) {
      cameraController.setTarget(body);
    }
  }
}
