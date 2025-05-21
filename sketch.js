// sketch.js

let rawText = `Soft-lit and mystic.
with snowfall sifting down.
and a mauve December sunset.
not this gauche flash.
this flesh akimbo.
caught in the glare of your stare.`;

let letters = [];
// —— 参数 —— 
const baseFontSize    = 20;   // 设计时默认字号（暂作最小字号用）
const marginRatio     = 0.10; // 左右各留 10% 画布宽度
const marginY         = 40;   // 上下边距固定 px
const typeInterval    = 2;    
const maxOffset       = 35;   
const floatSpeed      = 0.1;
const gyroSensitivity = 1;

let charIndex = 0;
let prevRotX  = 0, prevRotY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke(); fill(20);
  textFont('sans-serif');
  initLetters();
  initGyroPermission();
}

function initLetters() {
  letters = [];
  charIndex = 0;

  // —— 步骤1：测量并拆分行 —— 
  textSize(baseFontSize);
  let lines = rawText.split('\n');
  let lineCount = lines.length;

  // —— 步骤2：计算页边距与可用宽度 —— 
  let marginX      = width * marginRatio;
  let maxLineWidth = width - marginX * 2;
  let minLetterGap = baseFontSize * 0.25;
  let maxLetterGap = baseFontSize * 0.7;

  // 行高直接用字号的 1.2 倍
  let lineSpacing = baseFontSize * 1.2;

  // —— 步骤3：垂直居中起点 —— 
  let contentHeight = (lineCount - 1) * lineSpacing;
  let startY = (height - contentHeight) / 2;
  startY = constrain(startY, marginY, height - marginY - contentHeight);

  // —— 步骤4：逐行动态字距并水平居中 —— 
  for (let row = 0; row < lineCount; row++) {
    let txt = lines[row];
    // 动态字距：均分到 maxLineWidth 上
    let gap = txt.length>1
      ? constrain(maxLineWidth / (txt.length - 1), minLetterGap, maxLetterGap)
      : 0;
    let lineWidth = gap * (txt.length - 1);

    // 这行的起始 X（在左右 margin 里再居中）
    let startX = marginX + (maxLineWidth - lineWidth) / 2;

    // 为每个字符记录位置和相位
    for (let i = 0; i < txt.length; i++) {
      let x = startX + i * gap;
      let y = startY + row * lineSpacing;
      letters.push({
        char:  txt[i],
        baseX: x,
        baseY: y,
        phase: random(TWO_PI)
      });
    }
  }
}

function draw() {
  background(250);

  // 打字机
  if (frameCount % typeInterval === 0 && charIndex < letters.length) {
    charIndex++;
  }
  let floatEnabled = charIndex >= letters.length;

  // 计算陀螺仪增量
  let dX = rotationX - prevRotX;
  let dY = rotationY - prevRotY;
  prevRotX = rotationX;
  prevRotY = rotationY;
  let delta = sqrt(dX*dX + dY*dY);
  let norm  = constrain(delta / gyroSensitivity, 0, 1);
  let amp   = floatEnabled && norm>0 ? norm * maxOffset : 0;

  // 绘制字符
  for (let i = 0; i < charIndex; i++) {
    let l = letters[i];
    let yOff = amp * sin(frameCount * floatSpeed + l.phase);
    textSize(baseFontSize); // 保持字号一致
    textAlign(CENTER, CENTER);
    text(l.char, l.baseX, l.baseY + yOff);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}

function initGyroPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .catch(console.warn);
  }
}
