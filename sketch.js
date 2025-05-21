// sketch.js

let rawText = `Soft-lit and mystic.

with snowfall sifting down.

and a mauve December sunset.

not this gauche flash.

this flesh akimbo.

caught in the glare of your stare.`;

let letters = [];
const lineSpacing     = 60;   // 行间距
const marginX         = 40;   // 左右边距
const marginY         = 40;   // 上下边距
const typeInterval    = 2;    // 打字机每隔多少帧出现一个新字符
const maxOffset       = 35;   // 最大垂直偏移（px）
const floatSpeed      = 0.1;  // 浮动振荡速度（帧单位）
const gyroSensitivity = 1;    // Δrotation 达到多少度时视为最大振幅

let charIndex = 0;
let prevRotX  = 0;  // 上一帧的 rotationX
let prevRotY  = 0;  // 上一帧的 rotationY

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('sans-serif');
  textSize(36);
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
  let contentWidths  = lines.map(l => textWidth(l));
  let contentWidth   = max(...contentWidths);
  let contentHeight  = lines.length * lineSpacing;

  // 计算居中并约束边距
  let startX = constrain((width - contentWidth) / 2,
                         marginX, width - marginX - contentWidth);
  let startY = constrain((height - contentHeight) / 2,
                         marginY, height - marginY - contentHeight);

  let x = startX, y = startY;
  for (let ch of rawText) {
    if (ch === '\n') {
      y += lineSpacing;
      x = startX;
    } else {
      letters.push({ char: ch, baseX: x, baseY: y, phase: random(TWO_PI) });
      x += textWidth(ch);
    }
  }
}

function draw() {
  background(250);

  // —— 打字机效果 —— 
  if (frameCount % typeInterval === 0 && charIndex < letters.length) {
    charIndex++;
  }
  let floatEnabled = (charIndex >= letters.length);

  // —— 计算陀螺仪变化量 —— 
  // p5.js 全局 rotationX/Y
  let dX = rotationX - prevRotX;
  let dY = rotationY - prevRotY;
  prevRotX = rotationX;
  prevRotY = rotationY;

  // 只有当陀螺仪有实际晃动 (abs(dX)+abs(dY) > 0) 时才计算偏移
  let delta = sqrt(dX * dX + dY * dY);
  let norm = constrain(delta / gyroSensitivity, 0, 1);
  let amplitude = floatEnabled && norm > 0
    ? norm * maxOffset
    : 0;  // 如果没晃动或文字未完全出现，则不偏移

  // —— 绘制字符，并在有输入时加弹性振荡 —— 
  for (let i = 0; i < charIndex; i++) {
    let l = letters[i];
    let yOff = amplitude * sin(frameCount * floatSpeed + l.phase);
    text(l.char, l.baseX, l.baseY + yOff);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}

function initGyroPermission() {
  // iOS 13+ 需要请求权限
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then(res => { /* granted => rotationX/Y start updating */ })
      .catch(console.warn);
  }
}
