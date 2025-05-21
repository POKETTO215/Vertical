let rawText = `Soft-lit and mystic.

with snowfall sifting down.

and a mauve December sunset.

not this gauche flash.

this flesh akimbo.

caught in the glare of your stare.`;

let letters = [];
const lineSpacing     = 60;
const marginX         = 40;
const marginY         = 40;
const typeInterval    = 2;
const maxOffset       = 45;// 最大垂直偏移（px）
const floatSpeed      = 0.1;

let charIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('sans-serif');
  textSize(48);
  textLeading(lineSpacing);
  noStroke();
  fill(30);

  initLetters();
  initGyroPermission();
}

function initLetters() {
  letters = [];
  charIndex = 0;

  let lines = rawText.split('\n');
  let contentWidths = lines.map(l => textWidth(l));
  let contentWidth  = max(...contentWidths);
  let contentHeight = lines.length * lineSpacing;

  let startX = (width  - contentWidth)  / 2;
  let startY = (height - contentHeight) / 2;
  startX = constrain(startX, marginX, width  - marginX - contentWidth);
  startY = constrain(startY, marginY, height - marginY - contentHeight);

  let x = startX, y = startY;
  for (let ch of rawText) {
    if (ch === '\n') {
      y += lineSpacing;
      x = startX;
    } else {
      letters.push({
        char: ch,
        baseX: x,
        baseY: y,
        phase: random(TWO_PI)
      });
      x += textWidth(ch);
    }
  }
}

function draw() {
  background(250);

  if (frameCount % typeInterval === 0 && charIndex < letters.length) {
    charIndex++;
  }

  let floatEnabled = charIndex >= letters.length;

  let normX = constrain(abs(rotationX) / 45, 0, 1);
  let normY = constrain(abs(rotationY) / 45, 0, 1);
  let norm  = sqrt(normX * normX + normY * normY) / sqrt(2);
  let amplitude = floatEnabled ? norm * maxOffset : 0;

  for (let i = 0; i < charIndex; i++) {
    let l = letters[i];
    let yOff = floatEnabled
      ? amplitude * sin(frameCount * floatSpeed + l.phase)
      : 0;
    text(l.char, l.baseX, l.baseY + yOff);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}

function initGyroPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          // p5.js will start updating rotationX/Y
        }
      })
      .catch(console.warn);
  }
}
