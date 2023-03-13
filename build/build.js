var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var G = 6.67408 * (Math.pow(10, (-11)));
var AU = 1.49597870691 * Math.pow(10, 8);
var SOLAR_MASS = 1.989 * Math.pow(10, 30);
var MASS_EARTH = 3.00273 * Math.pow(10, (-6)) * SOLAR_MASS;
var MASS_SUN = SOLAR_MASS;
var MASS_MOON = 3.69432 * Math.pow(10, (-8)) * SOLAR_MASS;
var zoom = Math.pow(10, 6);
var timeStep = 1000000;
var time = 0;
var GM = function (combinedMass) { return G * combinedMass * Math.pow(10, (-9)); };
function worldToScreen(v) {
    return v.copy().sub(cameraController.getCurrentPos()).div(zoom).add(createVector(width / 2, height / 2));
}
function screenToWorld(v) {
    return v.copy().sub(createVector(width / 2, height / 2)).mult(zoom).add(cameraController.getCurrentPos());
}
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
var Body = (function () {
    function Body(name, mass, _pos, col) {
        this.name = name;
        this.mass = mass;
        this._pos = _pos;
        colorMode(HSB);
        if (col == null)
            this.col = color(random(0, 255), 250, 220);
        else
            this.col = col;
        colorMode(RGB);
    }
    return Body;
}());
var BodyOnRails = (function (_super) {
    __extends(BodyOnRails, _super);
    function BodyOnRails(parent, eccentricity, semiMajorAxisAU, name, mass, col) {
        var _this = _super.call(this, name, mass, createVector(0, 0), col) || this;
        _this.parent = parent;
        _this.eccentricity = eccentricity;
        _this.semiMajorAxisAU = semiMajorAxisAU;
        if (eccentricity >= 1 || eccentricity < 0) {
            throw Error("Error while initiliazing \"".concat(name, "\": eccentricity must be >= 0 and < 1, not ").concat(eccentricity, "!"));
        }
        return _this;
    }
    Object.defineProperty(BodyOnRails.prototype, "semiMajorAxisKm", {
        get: function () {
            return this.semiMajorAxisAU * AU;
        },
        enumerable: false,
        configurable: true
    });
    BodyOnRails.prototype.trueAnomaly = function () {
        var n = sqrt(GM(this.parent.mass + this.mass) / Math.pow(this.semiMajorAxisKm, 3));
        var t = timeSec();
        var M = n * t;
        var E = M;
        while (true) {
            var dE = (M - E + this.eccentricity * sin(E)) / (1 - this.eccentricity * cos(E));
            E += dE;
            if (abs(dE) < 1e-4)
                break;
        }
        var theta = 2 * atan(sqrt((1 + this.eccentricity) / (1 - this.eccentricity)) * tan(E / 2));
        return theta;
    };
    BodyOnRails.prototype.move = function () {
        var omega = 45;
        var focus = createVector(this.eccentricity * cos(radians(omega)), this.eccentricity * sin(radians(omega)));
        var theta = this.trueAnomaly();
        var r = this.semiMajorAxisKm * (1 - this.eccentricity * this.eccentricity) / (1 + this.eccentricity * cos(theta));
        this._pos = createVector(cos(theta + radians(omega)), sin(theta + radians(omega))).mult(r).add(focus);
    };
    BodyOnRails.prototype.draw = function () {
        this.move();
        push();
        fill(this.col);
        var screenPos = worldToScreen(this.pos);
        circle(screenPos.x, screenPos.y, 20);
        pop();
    };
    Object.defineProperty(BodyOnRails.prototype, "pos", {
        get: function () {
            return this._pos.copy().add(this.parent.pos);
        },
        enumerable: false,
        configurable: true
    });
    return BodyOnRails;
}(Body));
var StationaryBody = (function (_super) {
    __extends(StationaryBody, _super);
    function StationaryBody() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StationaryBody.prototype.draw = function () {
        push();
        fill(this.col);
        var screenPos = worldToScreen(this.pos);
        circle(screenPos.x, screenPos.y, 20);
        pop();
    };
    Object.defineProperty(StationaryBody.prototype, "pos", {
        get: function () {
            return this._pos.copy();
        },
        enumerable: false,
        configurable: true
    });
    return StationaryBody;
}(Body));
var bodies = [];
var cameraController = null;
function setup() {
    createCanvas(windowWidth, windowHeight);
    var sun = new StationaryBody("Sun", MASS_SUN, createVector(0, 0), color(255, 255, 0));
    var earth = new BodyOnRails(sun, 0, 1, "Earth", MASS_EARTH, color(0, 255, 0));
    var moon = new BodyOnRails(earth, 0, .002569, "Moon", MASS_MOON, color(80, 80, 80));
    bodies.push(earth, sun, moon);
    cameraController = new CameraController(sun, 100);
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
            cameraController.setTarget(body);
        }
    }
}
//# sourceMappingURL=build.js.map