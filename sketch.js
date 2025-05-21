// sketch.js

let rawText = `Soft-lit and mystic.
with snowfall sifting down.
and a mauve December sunset.
not this gauche flash.
this flesh akimbo.
caught in the glare of your stare.`;

let letters = [];
// —— 基准参数 —— 
const baseFontSize   = 36;  // 设计时的默认字号
const baseLineSpacing= 60;  // 设计时的默认行高
const marginX        = 40;
const marginY        = 40;
const typeInterval   = 2;
const maxOffset      = 35;
const floatSpeed     = 0.1;
const gyroSensitivity= 1;

let charIndex = 0;
let prevRotX  = 0, prevRotY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  fill(30);

  initLetters();      
  initGyroPermission();
}

function initLetters() {
  letters = [];
  charIndex = 0;

  // 1. 先设置基准字号测量
  textSize(baseFontSize);
  textLeading(baseLineSpacing);

  // 2. 测量原始内容块尺寸
  let lines = rawText.split('\n');
  let widths = lines.map(l => textWidth(l));
  let contentWidth  = max(...widths);
  let contentHeight = lines.length * baseLineSpacing;

  // 3. 计算缩放比例，不超过 1
  let scaleW = (width  - 2 * marginX) / contentWidth;
  let scaleH = (height - 2 * marginY) / contentHeight;
  let scale  = min(scaleW, scaleH, 1);

  // 4. 应用缩放后的字号与行距
  let fs = baseFontSize * scale;
  let ls = baseLineSpacing * scale;
  textSize(fs);
  textLeading(ls);

  // 5. 重新测量以布局字符
  contentWidth  = max(...lines.map(l => textWidth(l)));
  contentHeight = lines.length * ls;

  // 6. 计算居中起点并约束边距
  let startX = (width  - contentWidth)  / 2;
  let startY = (height - contentHeight) / 2;
  startX = constrain(startX, marginX, width  - marginX  - contentWidth);
  startY = constrain(startY, marginY, height - marginY  - contentHeight);

  // 7. 保存每个字符的基准位置 & 相位
  let x = startX, y = startY;
  for (let ch of rawText) {
    if (ch === '\n') {
      y += ls;
      x  = startX;
    } else {
      letters.push({ char: ch, baseX: x, baseY: y, phase: random(TWO_PI) });
      x += textWidth(ch);
    }
  }
}

function draw() {
  background(250);
  // …（与之前相同的打字机 + 陀螺仪触发偏移逻辑）…
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}

// … initGyroPermission() 如前 … 
