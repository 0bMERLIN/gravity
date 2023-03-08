var G = 6.67408 * (Math.pow(10, (-11)));
var AU = 149597870.691;
var SOLAR_MASS = 1.989 * Math.pow(10, 30);
var MASS_EARTH = 3.00273 * Math.pow(10, (-6)) * SOLAR_MASS;
var MASS_SUN = SOLAR_MASS;
var MASS_MOON = 3.69432 * Math.pow(10, (-8)) * SOLAR_MASS;
var zoom = Math.pow(10, 3);
var timeStep = 1000000;
var time = 0;
var GM = function (combinedMass) { return G * combinedMass * Math.pow(10, (-9)); };
var createMover = function (move) { return new ((function () {
    function class_1() {
    }
    class_1.prototype.move = function (p) {
        return move(p);
    };
    return class_1;
}())); };
function worldToScreen(v) {
    console.log("p: ".concat(v.x, " ").concat(v.y));
    return v.copy().sub(lerper.getCurrentPos()).div(zoom).add(createVector(width / 2, height / 2));
}
function screenToWorld(v) {
    return v.copy().sub(createVector(width / 2, height / 2)).mult(zoom).add(lerper.getCurrentPos());
}
var Body = (function () {
    function Body(name, mass, _pos, mover, col) {
        this.name = name;
        this.mass = mass;
        this._pos = _pos;
        this.mover = mover;
        colorMode(HSB);
        if (col == null)
            this.col = color(random(0, 255), 250, 220);
        else
            this.col = col;
        colorMode(RGB);
    }
    Object.defineProperty(Body.prototype, "pos", {
        get: function () { return this._pos.copy(); },
        enumerable: false,
        configurable: true
    });
    Body.prototype.draw = function () {
        this._pos = this.mover.move(this._pos);
        push();
        fill(this.col);
        var screenPos = worldToScreen(this.pos);
        circle(screenPos.x, screenPos.y, 20);
        pop();
    };
    return Body;
}());
var CameraController = (function () {
    function CameraController(focusedBody, lerpSpeedMs) {
        this.focusedBody = focusedBody;
        this.lerpSpeedMs = lerpSpeedMs;
        this.target = focusedBody;
    }
    CameraController.prototype.setTarget = function (target) {
        this.target = target;
        this.startTimeMs = millis();
    };
    CameraController.prototype.getCurrentPos = function () {
        var timeSinceAnimStart = millis() - this.startTimeMs;
        if (this.target == this.focusedBody) {
            return this.focusedBody.pos;
        }
        if (timeSinceAnimStart > this.lerpSpeedMs) {
            this.focusedBody = this.target;
            return this.focusedBody.pos;
        }
        return this.focusedBody.pos.lerp(this.target.pos, timeSinceAnimStart / this.lerpSpeedMs);
    };
    return CameraController;
}());
var stationaryBody = function (name, m, p, col) { return new Body(name, m, p, createMover(function () { return p.copy().mult(AU); }), col); };
var bodyOnRails = function (name, m, parent, r, s, col) {
    return new Body(name, m, parent.pos, createMover(function () {
        var semiMajorAxisAU = (max(r * AU, s * AU) / 2);
        var orbitalPeriodSec = 2 * PI * sqrt(Math.pow(semiMajorAxisAU, 3) / GM(parent.mass + m));
        var t = timeSec() / orbitalPeriodSec;
        var pos = parent.pos.copy().add(createVector(cos(t * 2 * PI) * r, sin(t * 2 * PI) * s));
        return pos;
    }), col);
};
var bodies = [];
var lerper = null;
function setup() {
    createCanvas(windowWidth, windowHeight);
    var sun = stationaryBody("Sun", MASS_SUN, createVector(0, 0), color(255, 255, 0));
    var earth = bodyOnRails("Earth", MASS_EARTH, sun, 2, 2, color(0, 255, 0));
    var moon = bodyOnRails("Moon", MASS_MOON, earth, .002569 * 2, .002569 * 2, color(80, 80, 80));
    bodies.push(earth, sun, moon);
    lerper = new CameraController(moon, 100);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
var timeSec = function () { return time; };
var timeMin = function () { return timeSec() / 60; };
var timeHour = function () { return timeMin() / 60; };
var timeDay = function () { return timeHour() / 24; };
var timeYears = function () { return timeDay() / 365; };
var secToDay = function (t) { return ((t / 60) / 60) / 24; };
function draw() {
    background(0);
    fill(255, 255, 255);
    text("t: ".concat(timeDay(), " days"), 20, 20);
    text("zoom: ".concat(zoom), 20, 50);
    text("timeStep: ".concat(secToDay(timeStep), " days"), 20, 80);
    for (var _i = 0, bodies_1 = bodies; _i < bodies_1.length; _i++) {
        var body = bodies_1[_i];
        push();
        body.draw();
    }
    time += timeStep * (deltaTime / 1000);
}
function mouseWheel(event) {
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
    for (var _i = 0, bodies_2 = bodies; _i < bodies_2.length; _i++) {
        var body = bodies_2[_i];
        if (worldToScreen(body.pos).dist(createVector(mouseX, mouseY)) < 10) {
            lerper.setTarget(body);
        }
    }
}
//# sourceMappingURL=build.js.map