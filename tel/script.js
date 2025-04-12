const canvas = document.getElementById('drawcanvas');
  const ctx = canvas.getContext('2d');
  const colorEls = document.querySelectorAll('.color');

  let drawing = false;
  let currentColor = 'rgb(43, 43, 43)';
  let brushSize = 15;
  let points = [];
  let lerpPos = { x: 0, y: 0 };

  function resizeCanvas() {
    const size = canvas.clientWidth;
    canvas.width = size;
    canvas.height = size;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = currentColor;

  colorEls.forEach(el => {
    el.addEventListener('click', () => {
      colorEls.forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      currentColor = getComputedStyle(el).backgroundColor;
      ctx.strokeStyle = currentColor;
    });
  });

  colorEls.forEach(el => {
    if (getComputedStyle(el).backgroundColor === currentColor) {
      el.classList.add('active');
    }
  });

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function startDrawing(e) {
    drawing = true;
    points = [];
    const pos = getCanvasPos(e);
    lerpPos = { ...pos };
    points.push(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const target = getCanvasPos(e);
    lerpPos.x = lerp(lerpPos.x, target.x, 0.3);
    lerpPos.y = lerp(lerpPos.y, target.y, 0.3);
    points.push({ x: lerpPos.x, y: lerpPos.y });
    if (points.length < 3) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;

    const prev = points[points.length - 3];
    const curr = points[points.length - 2];
    const mid = {
      x: (prev.x + curr.x) / 2,
      y: (prev.y + curr.y) / 2
    };

    ctx.beginPath();
    ctx.moveTo(mid.x, mid.y);
    ctx.quadraticCurveTo(curr.x, curr.y, lerpPos.x, lerpPos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    drawing = false;
    points = [];
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);