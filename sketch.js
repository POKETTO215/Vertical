// sketch.js

let rawText = `Soft-lit and mystic.
with snowfall sifting down.
and a mauve December sunset.
not this gauche flash.
this flesh akimbo.
caught in the glare of your stare.`;

let letters = [];
// —— 参数 —— 
const baseFontSize    = 25;   // 设计时默认字号（暂作最小字号用）
const marginRatio     = 0.10; // 左右各留 10% 画布宽度
const marginY         = 40;   // 上下边距固定 px
const typeInterval    = 2;    
const maxOffset       = 35;   
const floatSpeed      = 0.1;
const gyroSensitivity = 1;

let charIndex = 0;
let prevRotX  = 0, prevRotY = 0;

// 用于保存陀螺仪数据（iOS/安卓/PC通用）
let globalRotationX = 0, globalRotationY = 0;

function initLetters() {
  letters = [];
  charIndex = 0;

  textSize(baseFontSize);
  let lines = rawText.split('\n');
  let lineCount = lines.length;

  let marginX      = width * marginRatio;
  let maxLineWidth = width - marginX * 2;

  let lineSpacing = baseFontSize * 1.2;

  let contentHeight = (lineCount - 1) * lineSpacing;
  let startY = (height - contentHeight) / 2;
  startY = constrain(startY, marginY, height - marginY - contentHeight);

  for (let row = 0; row < lineCount; row++) {
    let txt = lines[row];
    // —— 步骤1：测量每个字符宽度，计算总宽度 —— 
    let charWidths = [];
    let totalWidth = 0;
    for (let i = 0; i < txt.length; i++) {
      let w = textWidth(txt[i]);
      charWidths.push(w);
      totalWidth += w;
    }

    // —— 步骤2：字间隙按实际可用宽度均分 —— 
    let gaps = [];
    let gapCount = Math.max(txt.length - 1, 1);
    let remain = maxLineWidth - totalWidth;
    let gap = constrain(remain / gapCount, baseFontSize * 0.20, baseFontSize * 0.7);
    for (let i = 0; i < gapCount; i++) gaps.push(gap);

    // —— 步骤3：从起点精准排布每个字符 —— 
    let startX = marginX + (maxLineWidth - (totalWidth + gap * gapCount)) / 2;
    let x = startX;
    for (let i = 0; i < txt.length; i++) {
      letters.push({
        char:  txt[i],
        baseX: x + charWidths[i] / 2, // 以字符中心为基准
        baseY: startY + row * lineSpacing,
        phase: random(TWO_PI)
      });
      x += charWidths[i];
      if (i < gaps.length) x += gaps[i];
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

  // 使用陀螺仪数据
  let dX = globalRotationX - prevRotX;
  let dY = globalRotationY - prevRotY;
  prevRotX = globalRotationX;
  prevRotY = globalRotationY;
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

// 陀螺仪权限申请与数据监听
function initGyroPermission() {
  // iOS 13+ 必须用户交互触发权限请求
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    let btn = createButton('启用陀螺仪体验动态效果');
    btn.position(width / 2 - 90, height / 2);
    btn.style('font-size', '18px');
    btn.style('padding', '12px 28px');
    btn.style('background', '#222');
    btn.style('color', '#fff');
    btn.style('border-radius', '8px');
    btn.mousePressed(() => {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
            btn.remove();
          } else {
            alert('需要陀螺仪权限以体验完整效果');
          }
        })
        .catch(console.warn);
    });
  } else {
    // 安卓/PC直接监听
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
}

// 陀螺仪事件处理
function handleOrientation(e) {
  globalRotationX = e.beta  || 0; // X轴旋转
  globalRotationY = e.gamma || 0; // Y轴旋转
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}
