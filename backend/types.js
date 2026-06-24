/**
 * Proprietary .svgv Binary Vector Video Specification Opcodes.
 * Plain ES Module representation for the backend.
 */
export const SvgvOpcode = {
  FRAME_DELIMITER: 0x00,
  MOVE_TO: 0x01,
  LINE_TO: 0x02,
  SET_COLOR: 0x10,
  LINEAR_GRADIENT: 0x20,
  MESH_GRADIENT: 0x23,
  RASTER_PATCH: 0x30,
  EOF: 0xFF,
};
