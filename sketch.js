// sketch.js

let rawText = `Soft-lit and mystic.

with snowfall sifting down.

and a mauve December sunset.

not this gauche flash.

this flesh akimbo.

caught in the glare of your stare.`;

let letters = [];
const lineSpacing     = 60;   // 行间距
const marginX         = 40;   // 左右最小边距
const marginY         = 40;   // 上下最小边距
const typeInterval    = 2;    // 打字机每隔多少帧出现一个新字符
const maxOffset       = 35;   // 最大垂直偏移（px）
const floatSpeed      = 0.1;  // 浮动振荡速度（帧单位）
const gyroSensitivity = 1;    // Δrotation 达到多少度时视为最大振幅

let charIndex = 0;
let prevRotX  = 0;  // 上一帧的 rotationX
let prevRotY  = 0;  // 上一帧的 rotationY

function setup() {
  // —— 画布全屏且自适应设备尺寸 —— 
  createCanvas(windowWidth, windowHeight);

  textFont('sans-serif');
  textSize(36);
  textLeading(lineSpacing);
  noStroke();
  fill(30);

  initLetters();          // 根据当前 canvas 尺寸 计算字符基准位置
  initGyroPermission();   // 请求陀螺仪权限（iOS13+）
}

function initLetters() {
  letters = [];
  charIndex = 0;

  // 1. 拆分文本为多行并测量内容块尺寸
  let lines = rawText.split('\n');
  let contentWidths  = lines.map(l => textWidth(l));
  let contentWidth   = max(...contentWidths);
  let contentHeight  = lines.length * lineSpacing;

  // 2. 计算居中起点，并约束在边距范围内
  let startX = (width  - contentWidth)  / 2;
  let startY = (height - contentHeight) / 2;
  startX = constrain(startX, marginX, width  - marginX  - contentWidth);
  startY = constrain(startY, marginY, height - marginY  - contentHeight);

  // 3. 为每个字符记录基准坐标和随机相位
  let x = startX, y = startY;
  for (let ch of rawText) {
    if (ch === '\n') {
      y += lineSpacing;
      x = startX;
    } else {
      letters.push({
        char:  ch, 
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

  // —— 打字机效果 —— 
  if (frameCount % typeInterval === 0 && charIndex < letters.length) {
    charIndex++;
  }
  let floatEnabled = (charIndex >= letters.length);

  // —— 只在陀螺仪实际晃动时触发偏移 —— 
  let dX = rotationX - prevRotX;
  let dY = rotationY - prevRotY;
  prevRotX = rotationX;
  prevRotY = rotationY;

  let delta = sqrt(dX * dX + dY * dY);
  let norm  = constrain(delta / gyroSensitivity, 0, 1);
  let amplitude = floatEnabled && norm > 0
    ? norm * maxOffset
    : 0;

  // —— 绘制出现的字符，并做“弹性浮动” —— 
  for (let i = 0; i < charIndex; i++) {
    let l = letters[i];
    let yOff = amplitude * sin(frameCount * floatSpeed + l.phase);
    text(l.char, l.baseX, l.baseY + yOff);
  }
}

function windowResized() {
  // 画布随屏幕大小变化而变化，并重新布局
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}

function initGyroPermission() {
  // iOS 13+ 需要主动请求陀螺仪权限
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then(res => { /* granted => rotationX/Y 开始更新 */ })
      .catch(console.warn);
  }
}
