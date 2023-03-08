const G = 6.67408 * (10 ** (-11));
const AU = 149597870.691;
const SOLAR_MASS = 1.989 * 10 ** 30;

const MASS_EARTH = 3.00273 * 10 ** (-6) * SOLAR_MASS;
const MASS_SUN = SOLAR_MASS;
const MASS_MOON = 3.69432 * 10 ** (-8) * SOLAR_MASS;

var zoom = 10 ** 3;
var timeStep = 1000000; // seconds
var time = 0; // seconds

type Vector = p5.Vector
type Color = p5.Color

const GM = (combinedMass: number) => G * combinedMass * 10 ** (-9);

interface Mover {
  move: (current: Vector) => Vector
}

const createMover = (move: (current: Vector) => Vector) => new (class implements Mover {
  move(p: Vector) {
    return move(p);
  }
});

function worldToScreen(v: Vector): Vector {
  console.log(`p: ${v.x} ${v.y}`)
  return v.copy().sub(lerper.getCurrentPos()).div(zoom).add(createVector(width / 2, height / 2));
}

function screenToWorld(v: Vector): Vector {
  return v.copy().sub(createVector(width / 2, height / 2)).mult(zoom).add(lerper.getCurrentPos());
}

class Body {

  public col: p5.Color

  // units: mass -> kg, spacial -> km
  constructor(public name: String, public mass: number, private _pos: Vector, private mover: Mover, col?: p5.Color) {
    colorMode(HSB);
    if (col == null) this.col = color(random(0, 255), 250, 220);
    else this.col = col;
    colorMode(RGB);
  }

  public get pos() { return this._pos.copy(); }

  draw() {
    this._pos = this.mover.move(this._pos);
    push();
    fill(this.col);
    const screenPos = worldToScreen(this.pos);
    circle(screenPos.x, screenPos.y, 20);
    pop();
  }
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

const stationaryBody = (name: String, m: number, p: Vector, col?: p5.Color) => new Body(name, m, p, createMover(() => p.copy().mult(AU)), col);
const bodyOnRails = (name: String, m: number, parent: Body, r: number, s: number, col?: p5.Color) =>
  new Body(name, m, parent.pos, createMover(() => {
    const semiMajorAxisAU = (max(r * AU, s * AU) / 2);
    // Keplers 3. Law!
    const orbitalPeriodSec = 2 * PI * sqrt(semiMajorAxisAU ** 3 / GM(parent.mass + m));
    const t = timeSec() / orbitalPeriodSec;
    const pos = parent.pos.copy().add(createVector(cos(t * 2 * PI) * r, sin(t * 2 * PI) * s))
    return pos;
  }), col);

let bodies: Body[] = [];
let lerper: CameraController = null;

function setup() {
  createCanvas(windowWidth, windowHeight)

  const sun = stationaryBody("Sun", MASS_SUN, createVector(0, 0), color(255, 255, 0))
  const earth = bodyOnRails("Earth", MASS_EARTH, sun, 2, 2, color(0, 255, 0));
  const moon = bodyOnRails("Moon", MASS_MOON, earth, .002569 * 2, .002569 * 2, color(80, 80, 80))
  bodies.push(earth, sun, moon);
  lerper = new CameraController(moon, 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

const timeSec = () => time
const timeMin = () => timeSec() / 60
const timeHour = () => timeMin() / 60
const timeDay = () => timeHour() / 24
const timeYears = () => timeDay() / 365
const secToDay = (t: number) => ((t / 60) / 60) / 24

function draw() {
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

function mouseWheel(event: any) {
  zoom *= (event.delta > 0) ? 1.5 : 0.5;
  zoom = max(zoom, 0);
}

function keyPressed() {
  if (key == ',') {
    timeStep /= 2;
  }
  if (key == '.') {
    timeStep *= 2;
  }
}

function mousePressed() {
  for (const body of bodies) {
    if (worldToScreen(body.pos).dist(createVector(mouseX, mouseY)) < 10) {
      lerper.setTarget(body);
    }
  }
}
