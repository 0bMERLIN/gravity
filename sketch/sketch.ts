let mainShader: p5.Shader;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  const vert = loadStrings("shader.js").join("\n");
  const frag = loadStrings("shader.frag").join("\n");
  console.log(vert, frag)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  rect(0, 0, width, height);
}