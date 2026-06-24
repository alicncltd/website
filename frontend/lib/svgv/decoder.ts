export enum SvgvOpcode {
  FRAME_DELIMITER = 0x00,
  MOVE_TO = 0x01,
  LINE_TO = 0x02,
  SET_COLOR = 0x10,
  LINEAR_GRADIENT = 0x20,
  MESH_GRADIENT = 0x23,
  RASTER_PATCH = 0x30,
  EOF = 0xFF,
}

export interface MoveToCommand {
  type: 'moveTo';
  dx: number;
  dy: number;
}

export interface LineToCommand {
  type: 'lineTo';
  dx: number;
  dy: number;
}

export interface ColorCommand {
  type: 'color';
  r: number;
  g: number;
  b: number;
}

export interface LinearGradientCommand {
  type: 'linearGradient';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  r1: number;
  g1: number;
  b1: number;
  r2: number;
  g2: number;
  b2: number;
}

export interface MeshVertex {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

export interface MeshGradientCommand {
  type: 'meshGradient';
  rows: number;
  cols: number;
  vertices: MeshVertex[];
}

export interface RasterPatchCommand {
  type: 'rasterPatch';
  x: number;
  y: number;
  w: number;
  h: number;
  rgbData: Uint8Array;
}

export type SvgvCommand =
  | MoveToCommand
  | LineToCommand
  | ColorCommand
  | LinearGradientCommand
  | MeshGradientCommand
  | RasterPatchCommand;

export interface SvgvFrame {
  commands: SvgvCommand[];
}

export interface SvgvHeader {
  magic: string;
  width: number;
  height: number;
  fps: number;
  frameCount: number;
}

export class SvgvDecoder {
  private buffer: Uint8Array;
  private view: DataView;
  private header: SvgvHeader;
  private frameOffsets: Int32Array;
  private eofOffset: number = -1;

  constructor(binaryData: Uint8Array) {
    this.buffer = binaryData;
    this.view = new DataView(binaryData.buffer, binaryData.byteOffset, binaryData.byteLength);

    this.header = this.readHeader();
    this.frameOffsets = this.buildFrameIndex();
  }

  public getHeader(): SvgvHeader {
    return this.header;
  }

  public getFrameCount(): number {
    return this.header.frameCount;
  }

  public getAudioData(): Uint8Array | null {
    if (this.eofOffset === -1) return null;
    const audioLenOffset = this.eofOffset + 1;
    if (audioLenOffset + 4 <= this.buffer.length) {
      const audioLen = this.view.getInt32(audioLenOffset, true);
      if (audioLen > 0 && audioLenOffset + 4 + audioLen <= this.buffer.length) {
        return this.buffer.subarray(audioLenOffset + 4, audioLenOffset + 4 + audioLen);
      }
    }
    return null;
  }

  private readHeader(): SvgvHeader {
    if (this.buffer.length < 13) {
      throw new Error('Invalid SVGV file: File size too small.');
    }

    const m0 = String.fromCharCode(this.buffer[0]);
    const m1 = String.fromCharCode(this.buffer[1]);
    const m2 = String.fromCharCode(this.buffer[2]);
    const m3 = String.fromCharCode(this.buffer[3]);
    const magic = m0 + m1 + m2 + m3;

    if (magic !== 'SVGV') {
      throw new Error(`Invalid SVGV file: Expected magic 'SVGV' but got '${magic}'.`);
    }

    const width = this.view.getInt16(4, true);
    const height = this.view.getInt16(6, true);
    const fps = this.buffer[8];
    const frameCount = this.view.getInt32(9, true);

    return { magic, width, height, fps, frameCount };
  }

  private buildFrameIndex(): Int32Array {
    const offsets: number[] = [];
    let offset = 13;
    const totalLength = this.buffer.length;

    offsets.push(offset);

    while (offset < totalLength) {
      const opcode = this.buffer[offset];

      if (opcode === SvgvOpcode.FRAME_DELIMITER) {
        offset++;
        if (offset < totalLength && this.buffer[offset] !== SvgvOpcode.EOF) {
          offsets.push(offset);
        }
      } else if (opcode === SvgvOpcode.EOF) {
        this.eofOffset = offset;
        break;
      } else if (opcode === SvgvOpcode.MOVE_TO) {
        offset += 5;
      } else if (opcode === SvgvOpcode.LINE_TO) {
        offset += 5;
      } else if (opcode === SvgvOpcode.SET_COLOR) {
        offset += 4;
      } else if (opcode === SvgvOpcode.LINEAR_GRADIENT) {
        offset += 15;
      } else if (opcode === SvgvOpcode.MESH_GRADIENT) {
        const rows = this.buffer[offset + 1];
        const cols = this.buffer[offset + 2];
        offset += 3 + (rows * cols * 7);
      } else if (opcode === SvgvOpcode.RASTER_PATCH) {
        const w = this.buffer[offset + 5];
        const h = this.buffer[offset + 6];
        offset += 7 + (w * h * 3);
      } else {
        offset++;
      }
    }

    const indexArray = new Int32Array(offsets.length);
    for (let i = 0; i < offsets.length; i++) {
      indexArray[i] = offsets[i];
    }
    return indexArray;
  }

  public decodeFrame(frameIndex: number): SvgvFrame {
    if (frameIndex < 0 || frameIndex >= this.frameOffsets.length) {
      throw new Error(`Frame index ${frameIndex} out of bounds (total frames: ${this.frameOffsets.length})`);
    }

    let offset = this.frameOffsets[frameIndex];
    const commands: SvgvCommand[] = [];
    const totalLength = this.buffer.length;

    while (offset < totalLength) {
      const opcode = this.buffer[offset];

      if (opcode === SvgvOpcode.FRAME_DELIMITER || opcode === SvgvOpcode.EOF) {
        break;
      }

      switch (opcode) {
        case SvgvOpcode.MOVE_TO: {
          const dx = this.view.getInt16(offset + 1, true);
          const dy = this.view.getInt16(offset + 3, true);
          commands.push({ type: 'moveTo', dx, dy });
          offset += 5;
          break;
        }

        case SvgvOpcode.LINE_TO: {
          const dx = this.view.getInt16(offset + 1, true);
          const dy = this.view.getInt16(offset + 3, true);
          commands.push({ type: 'lineTo', dx, dy });
          offset += 5;
          break;
        }

        case SvgvOpcode.SET_COLOR: {
          const r = this.buffer[offset + 1];
          const g = this.buffer[offset + 2];
          const b = this.buffer[offset + 3];
          commands.push({ type: 'color', r, g, b });
          offset += 4;
          break;
        }

        case SvgvOpcode.LINEAR_GRADIENT: {
          const x1 = this.view.getInt16(offset + 1, true);
          const y1 = this.view.getInt16(offset + 3, true);
          const x2 = this.view.getInt16(offset + 5, true);
          const y2 = this.view.getInt16(offset + 7, true);
          const r1 = this.buffer[offset + 9];
          const g1 = this.buffer[offset + 10];
          const b1 = this.buffer[offset + 11];
          const r2 = this.buffer[offset + 12];
          const g2 = this.buffer[offset + 13];
          const b2 = this.buffer[offset + 14];
          commands.push({
            type: 'linearGradient',
            x1, y1, x2, y2,
            r1, g1, b1,
            r2, g2, b2,
          });
          offset += 15;
          break;
        }

        case SvgvOpcode.MESH_GRADIENT: {
          const rows = this.buffer[offset + 1];
          const cols = this.buffer[offset + 2];
          const vertices: MeshVertex[] = [];
          let vOffset = offset + 3;

          for (let v = 0; v < rows * cols; v++) {
            const x = this.view.getInt16(vOffset, true);
            const y = this.view.getInt16(vOffset + 2, true);
            const r = this.buffer[vOffset + 4];
            const g = this.buffer[vOffset + 5];
            const b = this.buffer[vOffset + 6];
            vertices.push({ x, y, r, g, b });
            vOffset += 7;
          }

          commands.push({ type: 'meshGradient', rows, cols, vertices });
          offset = vOffset;
          break;
        }

        case SvgvOpcode.RASTER_PATCH: {
          const x = this.view.getInt16(offset + 1, true);
          const y = this.view.getInt16(offset + 3, true);
          const w = this.buffer[offset + 5];
          const h = this.buffer[offset + 6];
          const byteLen = w * h * 3;

          const rgbData = this.buffer.subarray(offset + 7, offset + 7 + byteLen);

          commands.push({
            type: 'rasterPatch',
            x, y, w, h,
            rgbData,
          });
          offset += 7 + byteLen;
          break;
        }

        default:
          offset++;
          break;
      }
    }

    return { commands };
  }
}
