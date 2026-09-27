/**
 * PixelPrimitives: Low-level procedural pixel art drawing utilities
 */

export class PixelPrimitives {
  /**
   * Draws a pixelated line using Bresenham's algorithm
   */
  public static drawLine(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    pixelSize: number = 1
  ): void {
    ctx.fillStyle = color;
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      ctx.fillRect(x, y, pixelSize, pixelSize);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Draws a pixelated circle
   */
  public static drawPixelCircle(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    color: string,
    filled: boolean = true
  ): void {
    ctx.fillStyle = color;
    cx = Math.floor(cx);
    cy = Math.floor(cy);
    radius = Math.floor(radius);

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const distSq = x * x + y * y;
        if (filled) {
          if (distSq <= radius * radius) {
            ctx.fillRect(cx + x, cy + y, 1, 1);
          }
        } else {
          if (distSq <= radius * radius && distSq > (radius - 1) * (radius - 1)) {
            ctx.fillRect(cx + x, cy + y, 1, 1);
          }
        }
      }
    }
  }

  /**
   * Renders a pixel matrix pattern from string array
   * e.g. ["..##..", ".####.", "######"]
   */
  public static drawPattern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pattern: string[],
    colorMap: Record<string, string>,
    scale: number = 1
  ): void {
    const px = Math.floor(x);
    const py = Math.floor(y);

    for (let r = 0; r < pattern.length; r++) {
      const row = pattern[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch !== ' ' && ch !== '.' && colorMap[ch]) {
          ctx.fillStyle = colorMap[ch];
          ctx.fillRect(px + c * scale, py + r * scale, scale, scale);
        }
      }
    }
  }

  /**
   * Draws a shaded retro pixel rectangle with 3D bevel / shadow
   */
  public static drawBeveledRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    bgColor: string,
    highlightColor: string,
    shadowColor: string,
    borderWidth: number = 2
  ): void {
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);

    // Background fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    // Top & Left highlights
    ctx.fillStyle = highlightColor;
    ctx.fillRect(x, y, w, borderWidth);
    ctx.fillRect(x, y, borderWidth, h);

    // Bottom & Right shadows
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x, y + h - borderWidth, w, borderWidth);
    ctx.fillRect(x + w - borderWidth, y, borderWidth, h);
  }

  /**
   * Generates a textured stone or wood brick row
   */
  public static drawTexturedPlanks(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    plankH: number,
    color1: string,
    color2: string,
    seamColor: string
  ): void {
    x = Math.floor(x);
    y = Math.floor(y);
    w = Math.floor(w);
    h = Math.floor(h);

    const rows = Math.ceil(h / plankH);
    for (let r = 0; r < rows; r++) {
      const curY = y + r * plankH;
      const curH = Math.min(plankH, y + h - curY);
      ctx.fillStyle = r % 2 === 0 ? color1 : color2;
      ctx.fillRect(x, curY, w, curH);

      // Plank seam line
      ctx.fillStyle = seamColor;
      ctx.fillRect(x, curY, w, 1);
    }
  }
}
