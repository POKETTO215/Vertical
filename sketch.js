// 原始文本，多行字符串
let rawText = `Soft-lit and mystic.

with snowfall sifting down.

and a mauve December sunset.

not this gauche flash.

this flesh akimbo.

caught in the glare of your stare.`;

// 用来存放每个字符的数组
let letters = [];

// ========== 可调参数区 ==========
// 行间距（px）
const lineSpacing     = 60;
// 与画布左右边缘最小距离（px）
const marginX         = 40;
// 与画布上下边缘最小距离（px）
const marginY         = 40;
// “打字机”每隔多少帧出现一个新字符
const typeInterval    = 2;
// 最大垂直偏移量（px），由陀螺仪倾斜度决定
const maxOffset       = 45;
// 浮动振荡速度（帧频率单位）
const floatSpeed      = 0.1;

// 当前已显示的字符数量
let charIndex = 0;

function setup() {
  // 创建全屏画布
  createCanvas(windowWidth, windowHeight);
  // 设置字体
  textFont('sans-serif');
  textSize(28);
  textLeading(lineSpacing);
  noStroke();
  fill(30);

  // 初始化字符对象及布局
  initLetters();
  // 请求并初始化陀螺仪权限（iOS 13+）
  initGyroPermission();
}

function initLetters() {
  letters = [];
  charIndex = 0;

  // 将文本按行拆分
  let lines = rawText.split('\n');
  // 计算每行宽度，用于居中
  let contentWidths = lines.map(l => textWidth(l));
  let contentWidth  = max(...contentWidths);
  // 总高度 = 行数 × 行高
  let contentHeight = lines.length * lineSpacing;

  // 计算内容块起始坐标，实现水平垂直居中
  let startX = (width  - contentWidth)  / 2;
  let startY = (height - contentHeight) / 2;
  // 同时应用边距约束，防止内容贴边
  startX = constrain(startX, marginX, width  - marginX - contentWidth);
  startY = constrain(startY, marginY, height - marginY - contentHeight);

  // 按字符遍历 rawText，记录每个字符的基准位置和随机相位
  let x = startX, y = startY;
  for (let ch of rawText) {
    if (ch === '\n') {
      // 遇到换行时换行，重置 x
      y += lineSpacing;
      x = startX;
    } else {
      // 将字符对象推入数组
      letters.push({
        char: ch,          // 字符内容
        baseX: x,          // 绘制时的基础 X 坐标
        baseY: y,          // 绘制时的基础 Y 坐标
        phase: random(TWO_PI) // 随机相位，用于各字符不同步振荡
      });
      // x 前进一个字符宽度
      x += textWidth(ch);
    }
  }
}

function draw() {
  background(250);

  // —— 打字机效果 —— 
  // 每隔 typeInterval 帧，将 charIndex+1，直到所有字符出现完
  if (frameCount % typeInterval === 0 && charIndex < letters.length) {
    charIndex++;
  }
  // 只有当所有字符出现后，才允许浮动效果
  let floatEnabled = charIndex >= letters.length;

  // —— 读取倾斜度并归一化 —— 
  // rotationX/Y 是 p5.js 全局变量，反映设备前后/左右倾斜，范围大致 ±90°
  let normX = constrain(abs(rotationX) / 45, 0, 1);
  let normY = constrain(abs(rotationY) / 45, 0, 1);
  // 综合两个轴的倾斜强度（向量长度归一化）
  let norm  = sqrt(normX * normX + normY * normY) / sqrt(2);
  // 最终振幅：归一化倾斜强度 × 最大偏移
  let amplitude = floatEnabled ? norm * maxOffset : 0;

  // —— 渲染已出现的字符 —— 
  for (let i = 0; i < charIndex; i++) {
    let l = letters[i];
    // 计算垂直偏移：振幅 × 正弦振荡
    let yOff = floatEnabled
      ? amplitude * sin(frameCount * floatSpeed + l.phase)
      : 0;
    // 将字符绘制到 (baseX, baseY + yOff)
    text(l.char, l.baseX, l.baseY + yOff);
  }
}

function windowResized() {
  // 窗口大小变化时重置画布并重新布局
  resizeCanvas(windowWidth, windowHeight);
  initLetters();
}

// iOS 13+ 需要主动请求陀螺仪使用权限
function initGyroPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          // 授权后 p5.js 会自动更新 rotationX/Y
        }
      })
      .catch(console.warn);
  }
}
