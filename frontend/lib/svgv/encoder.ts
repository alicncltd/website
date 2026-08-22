import { SvgvOpcode, SvgvFrame } from './decoder';

export class BinaryWriter {
  private buffer: Uint8Array;
  private view: DataView;
  private offset: number;

  constructor(initialCapacity = 1024 * 1024) {
    this.buffer = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buffer.buffer);
    this.offset = 0;
  }

  ensureCapacity(extraBytes: number) {
    if (this.offset + extraBytes > this.buffer.length) {
      const newCapacity = Math.max(this.buffer.length * 2, this.offset + extraBytes + 256 * 1024);
      const newBuffer = new Uint8Array(newCapacity);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer.buffer);
    }
  }

  writeByte(val: number) {
    this.ensureCapacity(1);
    this.buffer[this.offset++] = val & 0xFF;
  }

  writeInt16(val: number) {
    this.ensureCapacity(2);
    this.view.setInt16(this.offset, val, true); // Little endian
    this.offset += 2;
  }

  writeInt32(val: number) {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, val, true); // Little endian
    this.offset += 4;
  }

  writeBytes(bytes: Uint8Array) {
    this.ensureCapacity(bytes.length);
    this.buffer.set(bytes, this.offset);
    this.offset += bytes.length;
  }

  getOutput(): Uint8Array {
    return this.buffer.subarray(0, this.offset);
  }

  getBytesWritten(): number {
    return this.offset;
  }
}

export function encodeSvgvHeader(width: number, height: number, fps: number, frameCount: number): Uint8Array {
  const writer = new BinaryWriter(16);
  writer.writeByte('S'.charCodeAt(0));
  writer.writeByte('V'.charCodeAt(0));
  writer.writeByte('G'.charCodeAt(0));
  writer.writeByte('V'.charCodeAt(0));
  writer.writeInt16(width);
  writer.writeInt16(height);
  writer.writeByte(fps);
  writer.writeInt32(frameCount);
  return writer.getOutput();
}

export function encodeSvgvFrameToBuffer(frame: SvgvFrame): Uint8Array {
  const writer = new BinaryWriter(64 * 1024);
  const commands = frame.commands;
  const len = commands.length;

  for (let i = 0; i < len; i++) {
    const cmd = commands[i];

    switch (cmd.type) {
      case 'moveTo':
        writer.writeByte(SvgvOpcode.MOVE_TO);
        writer.writeInt16(cmd.dx);
        writer.writeInt16(cmd.dy);
        break;

      case 'lineTo':
        writer.writeByte(SvgvOpcode.LINE_TO);
        writer.writeInt16(cmd.dx);
        writer.writeInt16(cmd.dy);
        break;

      case 'color':
        writer.writeByte(SvgvOpcode.SET_COLOR);
        writer.writeByte(cmd.r);
        writer.writeByte(cmd.g);
        writer.writeByte(cmd.b);
        break;

      case 'linearGradient':
        writer.writeByte(SvgvOpcode.LINEAR_GRADIENT);
        writer.writeInt16(cmd.x1);
        writer.writeInt16(cmd.y1);
        writer.writeInt16(cmd.x2);
        writer.writeInt16(cmd.y2);
        writer.writeByte(cmd.r1);
        writer.writeByte(cmd.g1);
        writer.writeByte(cmd.b1);
        writer.writeByte(cmd.r2);
        writer.writeByte(cmd.g2);
        writer.writeByte(cmd.b2);
        break;

      case 'meshGradient': {
        writer.writeByte(SvgvOpcode.MESH_GRADIENT);
        writer.writeByte(cmd.rows);
        writer.writeByte(cmd.cols);
        const vertices = cmd.vertices;
        const vLen = vertices.length;
        for (let j = 0; j < vLen; j++) {
          const v = vertices[j];
          writer.writeInt16(v.x);
          writer.writeInt16(v.y);
          writer.writeByte(v.r);
          writer.writeByte(v.g);
          writer.writeByte(v.b);
        }
        break;
      }

      case 'rasterPatch': {
        writer.writeByte(SvgvOpcode.RASTER_PATCH);
        writer.writeInt16(cmd.x);
        writer.writeInt16(cmd.y);
        writer.writeByte(cmd.w);
        writer.writeByte(cmd.h);
        writer.writeBytes(cmd.rgbData);
        break;
      }
    }
  }

  // Prepend FRAME_DELIMITER
  const out = writer.getOutput();
  const res = new Uint8Array(out.length + 1);
  res[0] = SvgvOpcode.FRAME_DELIMITER;
  res.set(out, 1);
  return res;
}

export function encodeSvgvEOF(): Uint8Array {
  const buf = new Uint8Array(1);
  buf[0] = SvgvOpcode.EOF;
  return buf;
}
