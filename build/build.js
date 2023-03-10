var mainShader;
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    var vert = loadStrings("shader.js").join("\n");
    var frag = loadStrings("shader.frag").join("\n");
    console.log(vert, frag);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function draw() {
    background(0);
    rect(0, 0, width, height);
}
//# sourceMappingURL=build.js.map