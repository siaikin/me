// 创建大型变换背景图像的函数
export async function createImageFromPattern(patternUrl: string): Promise<Blob> {
  const pattern = await new Promise<HTMLImageElement>(async (resolve, reject) => {
    try {
      const pattern = new Image();
      pattern.src = patternUrl;

      await pattern.decode();

      resolve(pattern);
    } catch(e) {
      reject(e);
    }
  })

  // 用 offscreen canvas 存储原始图像
  const sourceCanvas = new OffscreenCanvas(512, 512);
  const sourceCtx = sourceCanvas.getContext('2d');

  if (!sourceCtx) {
    throw new Error('无法获取source canvas context');
  }

  sourceCtx.drawImage(pattern, 0, 0, pattern.width, pattern.height, 0, 0, sourceCanvas.width, sourceCanvas.height);

  // 根据屏幕尺寸动态计算canvas大小
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // 使用较大的尺寸作为基准，并添加一些余量以确保完全覆盖
  const canvasWidth = Math.ceil(screenWidth * 1.2);
  const canvasHeight = Math.ceil(screenHeight * 1.2);

  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法获取canvas context')
  }

  // 清除canvas背景
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  console.time('第一层绘制');
  // 第一层：大尺寸背景填充层，确保没有空隙
  const bgCount = 40;
  for (let i = 0; i < bgCount; i++) {
    ctx.save();

    // 扩展范围，允许图像部分超出画布边界
    const x = (Math.random() - 0.2) * canvasWidth * 1.4;
    const y = (Math.random() - 0.2) * canvasHeight * 1.4;

    // 大尺寸缩放确保覆盖
    const scale = 2.0 + Math.random() * 3.0;
    const rotation = Math.random() * 2 * Math.PI;
    const alpha = 0.15 + Math.random() * 0.35;

    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
    ctx.restore();
  }
  console.timeEnd('第一层绘制');

  console.time('第二层绘制');
  // 第二层：网格式分布，确保均匀覆盖
  const gridSize = Math.ceil(Math.sqrt((canvas.width / sourceCanvas.width) * (canvas.height / sourceCanvas.height)));

  const cellSizeX = canvas.width / gridSize;
  const cellSizeY = canvas.height / gridSize;

  for (let gridX = 0; gridX < gridSize; gridX++) {
    for (let gridY = 0; gridY < gridSize; gridY++) {
      // 在每个网格单元内随机放置1-3个图像
      const imagesInCell = 1 + Math.floor(Math.random() * 3);

      for (let j = 0; j < imagesInCell; j++) {
        ctx.save();

        // 在网格单元内随机位置，带一些重叠
        const x = (gridX - 0.3 + Math.random() * 1.6) * cellSizeX;
        const y = (gridY - 0.3 + Math.random() * 1.6) * cellSizeY;

        const scale = 1 + Math.random() * 1.5;
        const rotation = Math.random() * 2 * Math.PI;
        const alpha = 0.2 + Math.random() * 0.6;

        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.rotate(rotation);
        ctx.globalAlpha = alpha;

        ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
        ctx.restore();
      }
    }
  }
  console.timeEnd('第二层绘制');

  // 第三层：完全随机分布的装饰层
  const decorCount = 100;
  for (let i = 0; i < decorCount; i++) {
    ctx.save();

    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const scale = 0.3 + Math.random() * 1.0;
    const rotation = Math.random() * 2 * Math.PI;
    const alpha = 0.1 + Math.random() * 0.4;

    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
    ctx.restore();
  }

  return await canvas.convertToBlob();
}

export async function createMaskImage(source: Blob): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法获取canvas context');
  }

  ctx.drawImage(imageBitmap, 0, 0);

    // 将图像转换为遮罩图片（黑白）
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // 将彩色图像转换为灰度遮罩
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    // 计算灰度值（使用标准权重）
    const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    // const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    // 如果像素是透明的，保持透明；否则设置为黑色遮罩
    if (alpha > 0) {
      // 根据原始亮度创建遮罩强度
      const maskOpacity = Math.round(255 - (gray * 0.8)); // 反转亮度并调整强度
      data[i] = 0;     // R - 黑色
      data[i + 1] = 0; // G - 黑色  
      data[i + 2] = 0; // B - 黑色
      // data[i + 3] = Math.min(255, maskOpacity); // Alpha - 遮罩透明度
      data[i + 3] = maskOpacity > 65 ? 255 : 0; // 二值化处理
    }
  }
    
  // 将处理后的图像数据放回canvas
  ctx.putImageData(imageData, 0, 0);

  return await canvas.convertToBlob();
}

export async function createMaskImageByFilter(source: Blob): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法获取canvas context');
  }

  // 先用滤镜快速转为灰度
  ctx.filter = 'grayscale(100%)';
  ctx.drawImage(imageBitmap, 0, 0);
  
  // 然后进行精细的遮罩处理
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i]; // 滤镜已转为灰度，RGB相同
    const alpha = data[i + 3];
    
    if (alpha > 0) {
      // 创建二值化黑色遮罩
      const maskOpacity = Math.round(255 - (gray * 0.8));
      data[i] = 0;     // R - 黑色
      data[i + 1] = 0; // G - 黑色  
      data[i + 2] = 0; // B - 黑色
      data[i + 3] = maskOpacity > 66 ? 255 : 0; // 二值化处理
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return await canvas.convertToBlob();
}

export async function createMaskImageByFilter2(source: Blob): Promise<Blob> {
  const imageBitmap = await createImageBitmap(source);
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('无法获取canvas context');
  }

  // 先用滤镜快速转为灰度
  ctx.filter = 'grayscale(100%) contrast(200%)';
  ctx.drawImage(imageBitmap, 0, 0);
  
  return await canvas.convertToBlob();
}