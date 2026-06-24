import { SvgvDecoder, SvgvFrame } from './decoder';

export class SvgvPlayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private decoder: SvgvDecoder;

  // Playback state
  private isPlaying: boolean = false;
  private currentFrame: number = 0;
  private fps: number = 15;
  private playbackSpeed: number = 1.0;
  private loop: boolean = true;
  private lastTick: number = 0;
  private animationFrameId: number | null = null;

  // Zoom and Pan
  private zoom: number = 1.0;
  private panX: number = 0;
  private panY: number = 0;
  private isDragging: boolean = false;
  private startDragX: number = 0;
  private startDragY: number = 0;

  // Offscreen canvas for fast upscaled background mesh gradients
  private meshCanvas: HTMLCanvasElement | null = null;

  // Canvas pool for reusing raster patch offscreen buffers (prevents allocations & memory leaks)
  private canvasPool: HTMLCanvasElement[] = [];
  private currentPoolIndex: number = 0;

  // Audio state
  private audio: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;

  // Callbacks
  private onFrameChanged?: (frame: number, total: number) => void;
  private onPlayStateChanged?: (isPlaying: boolean) => void;

  constructor(canvas: HTMLCanvasElement, decoder: SvgvDecoder) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.decoder = decoder;
    this.fps = decoder.getHeader().fps || 15;

    this.setupEvents();
    this.setupAudio();
    this.resetView();
  }

  public setOnFrameChanged(cb: (frame: number, total: number) => void) {
    this.onFrameChanged = cb;
    // Initial call
    cb(this.currentFrame, this.decoder.getFrameCount());
  }

  public setOnPlayStateChanged(cb: (isPlaying: boolean) => void) {
    this.onPlayStateChanged = cb;
    cb(this.isPlaying);
  }

  private setupEvents() {
    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate canvas space coordinates before zoom
      const canvasX = (mouseX - this.panX) / this.zoom;
      const canvasY = (mouseY - this.panY) / this.zoom;

      const zoomFactor = 1.1;
      if (e.deltaY < 0) {
        this.zoom *= zoomFactor;
      } else {
        this.zoom /= zoomFactor;
      }

      this.zoom = Math.max(0.1, Math.min(this.zoom, 20));

      // Adjust pan to keep cursor position fixed
      this.panX = mouseX - canvasX * this.zoom;
      this.panY = mouseY - canvasY * this.zoom;

      this.renderCurrentFrame();
    });

    // Pan on drag
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.isDragging = true;
        this.startDragX = e.clientX - this.panX;
        this.startDragY = e.clientY - this.panY;
        this.canvas.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.panX = e.clientX - this.startDragX;
        this.panY = e.clientY - this.startDragY;
        this.renderCurrentFrame();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
      }
    });

    // Double click to reset zoom/pan
    this.canvas.addEventListener('dblclick', () => {
      this.resetView();
    });

    // Cursor style grab
    this.canvas.style.cursor = 'grab';
  }

  public resetView() {
    const videoWidth = this.decoder.getHeader().width;
    const videoHeight = this.decoder.getHeader().height;

    // Scale to fit canvas
    const scaleX = this.canvas.width / videoWidth;
    const scaleY = this.canvas.height / videoHeight;
    this.zoom = Math.min(scaleX, scaleY) * 0.95; // 5% padding

    // Center video in canvas
    this.panX = (this.canvas.width - videoWidth * this.zoom) / 2;
    this.panY = (this.canvas.height - videoHeight * this.zoom) / 2;

    this.renderCurrentFrame();
  }

  private setupAudio() {
    this.cleanupAudio();

    const audioData = this.decoder.getAudioData();
    if (audioData && audioData.length > 0) {
      try {
        const audioSlice = audioData.buffer.slice(audioData.byteOffset, audioData.byteOffset + audioData.byteLength) as ArrayBuffer;
        const blob = new Blob([audioSlice], { type: 'audio/mpeg' });
        this.audioUrl = URL.createObjectURL(blob);
        this.audio = new Audio(this.audioUrl);
        this.audio.playbackRate = this.playbackSpeed;
        this.audio.loop = this.loop;
      } catch (err) {
        console.error('Failed to initialize audio playback:', err);
      }
    }
  }

  private cleanupAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }

  public play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTick = performance.now();
    this.onPlayStateChanged?.(true);

    if (this.audio) {
      const targetTime = this.currentFrame / this.fps;
      this.audio.currentTime = targetTime;
      this.audio.play().catch(err => console.warn('Audio play failed:', err));
    }

    this.tick();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audio) {
      this.audio.pause();
    }
    this.onPlayStateChanged?.(false);
  }

  public seek(frameIndex: number) {
    const totalFrames = this.decoder.getFrameCount();
    this.currentFrame = Math.max(0, Math.min(frameIndex, totalFrames - 1));
    if (this.audio) {
      this.audio.currentTime = this.currentFrame / this.fps;
    }
    this.renderCurrentFrame();
    this.onFrameChanged?.(this.currentFrame, totalFrames);
  }

  public setSpeed(speed: number) {
    this.playbackSpeed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  public setLoop(loop: boolean) {
    this.loop = loop;
    if (this.audio) {
      this.audio.loop = loop;
    }
  }

  public destroy() {
    this.pause();
    this.cleanupAudio();
    this.canvasPool = [];
    this.meshCanvas = null;
  }

  private tick() {
    if (!this.isPlaying) return;

    if (this.audio) {
      const totalFrames = this.decoder.getFrameCount();
      const audioTime = this.audio.currentTime;
      const expectedFrame = Math.floor(audioTime * this.fps);

      if (expectedFrame !== this.currentFrame) {
        this.currentFrame = Math.max(0, Math.min(expectedFrame, totalFrames - 1));
        this.renderCurrentFrame();
        this.onFrameChanged?.(this.currentFrame, totalFrames);
      }

      if (this.audio.ended && !this.loop) {
        this.isPlaying = false;
        this.onPlayStateChanged?.(false);
        return;
      }
    } else {
      const now = performance.now();
      const msPerFrame = 1000 / (this.fps * this.playbackSpeed);
      const elapsed = now - this.lastTick;

      if (elapsed >= msPerFrame) {
        const framesToAdvance = Math.floor(elapsed / msPerFrame);
        const totalFrames = this.decoder.getFrameCount();

        this.currentFrame += framesToAdvance;
        this.lastTick = now - (elapsed % msPerFrame);

        if (this.currentFrame >= totalFrames) {
          if (this.loop) {
            this.currentFrame = 0;
          } else {
            this.currentFrame = totalFrames - 1;
            this.isPlaying = false;
            this.onPlayStateChanged?.(false);
            this.renderCurrentFrame();
            this.onFrameChanged?.(this.currentFrame, totalFrames);
            return;
          }
        }

        this.renderCurrentFrame();
        this.onFrameChanged?.(this.currentFrame, totalFrames);
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  private renderCurrentFrame() {
    this.currentPoolIndex = 0;

    // Clear canvas
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply Zoom & Pan
    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw bounds border (subtle)
    const videoWidth = this.decoder.getHeader().width;
    const videoHeight = this.decoder.getHeader().height;
    this.ctx.strokeStyle = '#1e1e24';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, videoWidth, videoHeight);

    // Decode frame commands
    try {
      const frame = this.decoder.decodeFrame(this.currentFrame);
      this.renderFrameCommands(frame);
    } catch (err) {
      console.error(`Error decoding frame ${this.currentFrame}:`, err);
    }

    this.ctx.restore();
  }

  private renderFrameCommands(frame: SvgvFrame) {
    let curX = 0;
    let curY = 0;
    let pathOpen = false;

    const len = frame.commands.length;
    for (let i = 0; i < len; i++) {
      const cmd = frame.commands[i];

      switch (cmd.type) {
        case 'moveTo':
          curX += cmd.dx;
          curY += cmd.dy;
          if (pathOpen) {
            this.ctx.moveTo(curX, curY);
          }
          break;

        case 'lineTo':
          curX += cmd.dx;
          curY += cmd.dy;
          if (pathOpen) {
            this.ctx.lineTo(curX, curY);
          }
          break;

        case 'color':
          if (pathOpen) {
            this.ctx.stroke();
          }
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgb(${cmd.r}, ${cmd.g}, ${cmd.b})`;
          this.ctx.lineWidth = 1.5;
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          pathOpen = true;
          this.ctx.moveTo(curX, curY);
          break;

        case 'meshGradient':
          if (pathOpen) {
            this.ctx.stroke();
            pathOpen = false;
          }
          this.drawMeshGradient(cmd.rows, cmd.cols, cmd.vertices);
          break;

        case 'rasterPatch':
          if (pathOpen) {
            this.ctx.stroke();
            pathOpen = false;
          }
          this.drawRasterPatch(cmd.x, cmd.y, cmd.w, cmd.h, cmd.rgbData);
          break;
      }
    }

    if (pathOpen) {
      this.ctx.stroke();
    }
  }

  /**
   * Draws a background mesh grid using hardware-accelerated bilinear upscaling.
   * Packs the grid colors as a low-res offscreen image and relies on the browser's
   * GPU to draw it stretched with smooth interpolation.
   */
  private drawMeshGradient(rows: number, cols: number, vertices: any[]) {
    let offscreen = this.meshCanvas;
    if (!offscreen) {
      offscreen = document.createElement('canvas');
      this.meshCanvas = offscreen;
    }
    
    if (offscreen.width !== cols || offscreen.height !== rows) {
      offscreen.width = cols;
      offscreen.height = rows;
    }

    const tempCtx = offscreen.getContext('2d');
    if (!tempCtx) return;

    const imgData = tempCtx.createImageData(cols, rows);
    let dstIdx = 0;
    const len = vertices.length;

    for (let i = 0; i < len; i++) {
      const v = vertices[i];
      imgData.data[dstIdx++] = v.r;
      imgData.data[dstIdx++] = v.g;
      imgData.data[dstIdx++] = v.b;
      imgData.data[dstIdx++] = 255; // Opaque alpha
    }

    tempCtx.putImageData(imgData, 0, 0);

    const videoWidth = this.decoder.getHeader().width;
    const videoHeight = this.decoder.getHeader().height;

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(offscreen, 0, 0, videoWidth, videoHeight);
    this.ctx.restore();
  }

  /**
   * Draws a raster patch by converting RGB raw bytes into Canvas ImageData.
   * Reuses offscreen canvas buffers from a pre-allocated pool to prevent allocation/GC stutter.
   */
  private drawRasterPatch(
    x: number,
    y: number,
    w: number,
    h: number,
    rgbData: Uint8Array
  ) {
    let canvas = this.canvasPool[this.currentPoolIndex];
    if (!canvas) {
      canvas = document.createElement('canvas');
      this.canvasPool.push(canvas);
    }
    this.currentPoolIndex++;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const tempCtx = canvas.getContext('2d');
    if (tempCtx) {
      const imgData = tempCtx.createImageData(w, h);
      let srcIdx = 0;
      let dstIdx = 0;
      const total = w * h;

      for (let i = 0; i < total; i++) {
        imgData.data[dstIdx++] = rgbData[srcIdx++];     // R
        imgData.data[dstIdx++] = rgbData[srcIdx++];     // G
        imgData.data[dstIdx++] = rgbData[srcIdx++];     // B
        imgData.data[dstIdx++] = 255;                   // A (opaque)
      }

      tempCtx.putImageData(imgData, 0, 0);
      this.ctx.drawImage(canvas, x, y, w, h);
    }
  }
}
