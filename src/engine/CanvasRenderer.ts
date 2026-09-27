/**
 * CanvasRenderer: 640x360 Retro Pixel Buffer & Crisp Scaler
 * Manages crisp pixel rendering, letterboxing, and pointer coordinate mapping.
 */

export class CanvasRenderer {
  public static readonly VIRTUAL_WIDTH = 640;
  public static readonly VIRTUAL_HEIGHT = 360;

  private screenCanvas: HTMLCanvasElement;
  private screenCtx: CanvasRenderingContext2D;

  private offscreenCanvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D; // Public offscreen drawing context

  private displayRect = { x: 0, y: 0, width: 640, height: 360 };

  constructor(container: HTMLElement) {
    // Screen canvas (fills container with responsive letterbox)
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.id = 'game-canvas';
    this.screenCanvas.style.display = 'block';
    this.screenCanvas.style.imageRendering = 'pixelated';
    this.screenCanvas.style.imageRendering = 'crisp-edges';
    this.screenCanvas.style.touchAction = 'none'; // prevent mobile pinch-zoom
    container.appendChild(this.screenCanvas);

    const sCtx = this.screenCanvas.getContext('2d', { alpha: false });
    if (!sCtx) throw new Error('Could not get screen 2D context');
    this.screenCtx = sCtx;
    this.screenCtx.imageSmoothingEnabled = false;

    // Offscreen 640x360 buffer
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = CanvasRenderer.VIRTUAL_WIDTH;
    this.offscreenCanvas.height = CanvasRenderer.VIRTUAL_HEIGHT;

    const oCtx = this.offscreenCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
    if (!oCtx) throw new Error('Could not get offscreen 2D context');
    this.ctx = oCtx;
    this.ctx.imageSmoothingEnabled = false;

    window.addEventListener('resize', () => this.resizeScreen());
    this.resizeScreen();
  }

  public getScreenCanvas(): HTMLCanvasElement {
    return this.screenCanvas;
  }

  public resizeScreen(): void {
    const parent = this.screenCanvas.parentElement || document.body;
    const availWidth = parent.clientWidth || window.innerWidth;
    const availHeight = parent.clientHeight || window.innerHeight;

    // Device pixel ratio for crisp high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    this.screenCanvas.width = Math.floor(availWidth * dpr);
    this.screenCanvas.height = Math.floor(availHeight * dpr);
    this.screenCanvas.style.width = `${availWidth}px`;
    this.screenCanvas.style.height = `${availHeight}px`;

    // Compute letterboxed 16:9 viewport
    const scale = Math.min(
      this.screenCanvas.width / CanvasRenderer.VIRTUAL_WIDTH,
      this.screenCanvas.height / CanvasRenderer.VIRTUAL_HEIGHT
    );

    const fitWidth = Math.floor(CanvasRenderer.VIRTUAL_WIDTH * scale);
    const fitHeight = Math.floor(CanvasRenderer.VIRTUAL_HEIGHT * scale);
    const offsetX = Math.floor((this.screenCanvas.width - fitWidth) / 2);
    const offsetY = Math.floor((this.screenCanvas.height - fitHeight) / 2);

    this.displayRect = {
      x: offsetX,
      y: offsetY,
      width: fitWidth,
      height: fitHeight
    };

    this.screenCtx.imageSmoothingEnabled = false;
  }

  /**
   * Translates client (mouse/touch) coordinates to 640x360 virtual coordinates
   */
  public screenToVirtual(clientX: number, clientY: number): { x: number; y: number; inside: boolean } {
    const rect = this.screenCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Position relative to canvas in canvas pixel coordinates
    const canvasX = (clientX - rect.left) * dpr;
    const canvasY = (clientY - rect.top) * dpr;

    // Relative to letterboxed game rect
    const relX = canvasX - this.displayRect.x;
    const relY = canvasY - this.displayRect.y;

    const scaleX = this.displayRect.width / CanvasRenderer.VIRTUAL_WIDTH;
    const scaleY = this.displayRect.height / CanvasRenderer.VIRTUAL_HEIGHT;

    const virtX = Math.floor(relX / scaleX);
    const virtY = Math.floor(relY / scaleY);

    const inside =
      virtX >= 0 &&
      virtX < CanvasRenderer.VIRTUAL_WIDTH &&
      virtY >= 0 &&
      virtY < CanvasRenderer.VIRTUAL_HEIGHT;

    return {
      x: Math.max(0, Math.min(CanvasRenderer.VIRTUAL_WIDTH - 1, virtX)),
      y: Math.max(0, Math.min(CanvasRenderer.VIRTUAL_HEIGHT - 1, virtY)),
      inside
    };
  }

  /**
   * Blits offscreen 640x360 buffer to screen with letterbox bars
   */
  public renderToScreen(): void {
    this.screenCtx.imageSmoothingEnabled = false;

    // Clear outer bars with deep wood / warm railway dark slate
    this.screenCtx.fillStyle = '#100c08'; // Vintage dark railway wood
    this.screenCtx.fillRect(0, 0, this.screenCanvas.width, this.screenCanvas.height);

    // Blit game buffer
    this.screenCtx.drawImage(
      this.offscreenCanvas,
      0,
      0,
      CanvasRenderer.VIRTUAL_WIDTH,
      CanvasRenderer.VIRTUAL_HEIGHT,
      this.displayRect.x,
      this.displayRect.y,
      this.displayRect.width,
      this.displayRect.height
    );

    // Optional border rim
    this.screenCtx.strokeStyle = '#3a2512';
    this.screenCtx.lineWidth = 2;
    this.screenCtx.strokeRect(
      this.displayRect.x - 1,
      this.displayRect.y - 1,
      this.displayRect.width + 2,
      this.displayRect.height + 2
    );
  }

  // --- Fast pixel art primitives on offscreen buffer ---

  public clear(color: string = '#000000'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, CanvasRenderer.VIRTUAL_WIDTH, CanvasRenderer.VIRTUAL_HEIGHT);
  }

  public fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  public strokeRect(x: number, y: number, w: number, h: number, color: string, lineWidth: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w), Math.floor(h));
  }

  public drawCircle(cx: number, cy: number, r: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
    this.ctx.fill();
  }
}
