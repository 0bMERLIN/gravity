import { secToDay } from "./Math.js";
import { Simulation } from "./Simulation.js";

declare global {
  interface Window {
      setup(): void
      draw(): void
      keyPressed(): void
      mousePressed(): void
      windowResized(): void
  }
}

let sim: Simulation

window.setup = () => {
  createCanvas(windowWidth, windowHeight)

  sim = new Simulation();
}

window.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight);
}

window.draw = () => {
  background(0);

  fill(255, 255, 255);
  text(`t: ${Math.round(sim.timeDay)} days`, 20, 20);
  text(`zoom: ${sim.cameraController.zoom}`, 20, 50);
  text(`timeStep: ${secToDay(sim.timeStep)} days`, 20, 80);

  sim.tick(deltaTime);
  sim.draw();
}

window.mouseWheel = (event: any) => {
  sim.cameraController.zoom *= (event.delta > 0) ? 1.5 : 0.5;
  sim.cameraController.zoom = max(sim.cameraController.zoom, 0);
}

window.keyPressed = () => {
  if (key == ',') {
    sim.timeStep /= 2;
  }
  if (key == '.') {
    sim.timeStep *= 2;
  }
}

window.mousePressed = () => {
  for (const body of sim.bodies) {
    if (sim.cameraController.worldToScreen(body.pos).dist(createVector(mouseX, mouseY)) < 10) {
      sim.cameraController.setTarget(body);
    }
  }
}
