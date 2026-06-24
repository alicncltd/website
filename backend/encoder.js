import { SvgvOpcode } from './types.js';

/**
 * Fast CPU-optimized Binary Writer.
 * Uses a pre-allocated Uint8Array and DataView to avoid allocations.
 */
export class BinaryWriter {
  constructor(initialCapacity = 1024 * 1024) { // 1MB default pre-allocation
    this.buffer = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buffer.buffer);
    this.offset = 0;
  }

  ensureCapacity(extraBytes) {
    if (this.offset + extraBytes > this.buffer.length) {
      const newCapacity = Math.max(this.buffer.length * 2, this.offset + extraBytes + 256 * 1024);
      const newBuffer = new Uint8Array(newCapacity);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer.buffer);
    }
  }

  writeByte(val) {
    this.ensureCapacity(1);
    this.buffer[this.offset++] = val & 0xFF;
  }

  writeInt16(val) {
    this.ensureCapacity(2);
    this.view.setInt16(this.offset, val, true); // Little endian
    this.offset += 2;
  }

  writeInt32(val) {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, val, true); // Little endian
    this.offset += 4;
  }

  writeBytes(bytes) {
    this.ensureCapacity(bytes.length);
    this.buffer.set(bytes, this.offset);
    this.offset += bytes.length;
  }

  getOutput() {
    return this.buffer.subarray(0, this.offset);
  }

  getBytesWritten() {
    return this.offset;
  }

  reset() {
    this.offset = 0;
  }
}

/**
 * Encodes the SVGV Header into a Buffer.
 */
export function encodeSvgvHeader(width, height, fps, frameCount) {
  const writer = new BinaryWriter(16);
  // 1. Magic Header: 'SVGV' (4 bytes)
  writer.writeByte('S'.charCodeAt(0));
  writer.writeByte('V'.charCodeAt(0));
  writer.writeByte('G'.charCodeAt(0));
  writer.writeByte('V'.charCodeAt(0));

  // 2. Metadata Header
  writer.writeInt16(width);
  writer.writeInt16(height);
  writer.writeByte(fps);
  writer.writeInt32(frameCount);

  return Buffer.from(writer.getOutput());
}

/**
 * Encodes a single SvgvFrame's vector commands into a Buffer.
 */
export function encodeSvgvFrameToBuffer(frame) {
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
        const vLen = cmd.vertices.length;
        for (let j = 0; j < vLen; j++) {
          const v = cmd.vertices[j];
          writer.writeInt16(v.x);
          writer.writeInt16(v.y);
          writer.writeByte(v.r);
          writer.writeByte(v.g);
          writer.writeByte(v.b);
        }
        break;
      }

      case 'rasterPatch':
        writer.writeByte(SvgvOpcode.RASTER_PATCH);
        writer.writeInt16(cmd.x);
        writer.writeInt16(cmd.y);
        writer.writeByte(cmd.w);
        writer.writeByte(cmd.h);
        writer.writeBytes(cmd.rgbData);
        break;
    }
  }

  // Terminate frame
  writer.writeByte(SvgvOpcode.FRAME_DELIMITER);
  return Buffer.from(writer.getOutput());
}

/**
 * Encodes the EOF marker.
 */
export function encodeSvgvEOF() {
  const buf = Buffer.alloc(1);
  buf[0] = SvgvOpcode.EOF;
  return buf;
}
