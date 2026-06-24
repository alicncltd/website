/**
 * High-performance, CPU-only video frame vectorizer.
 * Plain ES Module representation for the backend.
 */
export function vectorizeFrame(
  rgbaPixels,
  width,
  height,
  options = {}
) {
  const edgeThreshold = options.edgeThreshold ?? 60; // Clean outlines, no chaotic noise
  const rdpTolerance = options.rdpTolerance ?? 2.5;   // Keep paths precise
  const minPathLength = options.minPathLength ?? 12;  // Only trace main outlines
  const rasterPatchRatio = options.rasterPatchRatio ?? 0.15;
  const meshGridSize = options.meshGridSize ?? 48;    // Detailed 48-column mesh for high quality
  const blockSize = options.blockSize ?? 16;

  const totalPixels = width * height;
  const commands = [];

  // Current drawing cursor for calculating relative Int16 deltas (dx, dy)
  let curX = 0;
  let curY = 0;

  // 1. Generate Global Background Mesh Gradient (Aspect-ratio matched grid)
  if (rasterPatchRatio > 0.0) {
    const meshGridCols = meshGridSize;
    const meshGridRows = Math.max(2, Math.floor(meshGridCols * (height / width)));
    const meshVertices = [];

    for (let r = 0; r < meshGridRows; r++) {
      const y = Math.floor((r * (height - 1)) / (meshGridRows - 1));
      for (let c = 0; c < meshGridCols; c++) {
        const x = Math.floor((c * (width - 1)) / (meshGridCols - 1));
        
        // Smooth color by sampling a 3x3 pixel neighborhood around (x, y)
        const color = getAverageColor(rgbaPixels, width, height, x, y, 1);
        
        meshVertices.push({ x, y, r: color.r, g: color.g, b: color.b });
      }
    }
    commands.push({
      type: 'meshGradient',
      rows: meshGridRows,
      cols: meshGridCols,
      vertices: meshVertices,
    });
  }

  // 2. Compute Luminance on CPU using fast integer math
  const luma = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    luma[i] = (rgbaPixels[idx] * 77 + rgbaPixels[idx + 1] * 150 + rgbaPixels[idx + 2] * 29) >> 8;
  }

  // 3. Subsampled Sobel Edge Detection (Manhattan Distance, no sqrt)
  const edges = new Uint8Array(totalPixels);
  for (let y = 1; y < height - 1; y += 1) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x += 1) {
      const idx = rowOffset + x;

      const gx =
        -luma[idx - width - 1] + luma[idx - width + 1]
        - 2 * luma[idx - 1] + 2 * luma[idx + 1]
        - luma[idx + width - 1] + luma[idx + width + 1];

      const gy =
        -luma[idx - width - 1] - 2 * luma[idx - width] - luma[idx - width + 1]
        + luma[idx + width - 1] + 2 * luma[idx + width] + luma[idx + width + 1];

      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag > edgeThreshold) {
        edges[idx] = 255;
      }
    }
  }

  // 4. Generate Raster Patches for high-detail regions
  const visited = new Uint8Array(totalPixels);

  if (rasterPatchRatio < 1.0) {
    for (let by = 0; by < height; by += blockSize) {
      const bh = Math.min(blockSize, height - by);
      for (let bx = 0; bx < width; bx += blockSize) {
        const bw = Math.min(blockSize, width - bx);

        // Count edge pixels in this block
        let edgeCount = 0;
        for (let y = by; y < by + bh; y++) {
          const rowOffset = y * width;
          for (let x = bx; x < bx + bw; x++) {
            if (edges[rowOffset + x] === 255) {
              edgeCount++;
            }
          }
        }

        const totalPixelsInBlock = bw * bh;
        const ratio = edgeCount / totalPixelsInBlock;

        if (ratio >= rasterPatchRatio) {
          // Extract original RGB values
          const rgbData = new Uint8Array(bw * bh * 3);
          let dstIdx = 0;
          for (let y = by; y < by + bh; y++) {
            const rowOffset = y * width;
            for (let x = bx; x < bx + bw; x++) {
              const srcIdx = (rowOffset + x) * 4;
              rgbData[dstIdx++] = rgbaPixels[srcIdx];     // R
              rgbData[dstIdx++] = rgbaPixels[srcIdx + 1]; // G
              rgbData[dstIdx++] = rgbaPixels[srcIdx + 2]; // B

              // Mark pixel as visited so we don't trace lines over it
              visited[y * width + x] = 1;
            }
          }

          commands.push({
            type: 'rasterPatch',
            x: bx,
            y: by,
            w: bw,
            h: bh,
            rgbData
          });
        }
      }
    }
  }

  // 5. Contour Chaining / Path Tracing + Linear/Recursive RDP Simplification
  const dx8 = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy8 = [0, 1, 1, 1, 0, -1, -1, -1];

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const startIdx = rowOffset + x;

      if (edges[startIdx] === 255 && visited[startIdx] === 0) {
        const path = [];
        let cx = x;
        let cy = y;
        let tracing = true;

        path.push({ x: cx, y: cy });
        visited[cy * width + cx] = 1;

        while (tracing) {
          let foundNeighbor = false;

          for (let d = 0; d < 8; d++) {
            const nx = cx + dx8[d];
            const ny = cy + dy8[d];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (edges[nIdx] === 255 && visited[nIdx] === 0) {
                cx = nx;
                cy = ny;
                path.push({ x: cx, y: cy });
                visited[nIdx] = 1;
                foundNeighbor = true;
                break;
              }
            }
          }

          if (!foundNeighbor) {
            tracing = false;
          }
        }

        if (path.length >= minPathLength) {
          const simplified = simplifyPath(path, rdpTolerance);

          if (simplified.length > 1) {
            let sumR = 0, sumG = 0, sumB = 0;
            const samples = Math.min(path.length, 10);
            const step = Math.max(1, Math.floor(path.length / samples));
            let sampleCount = 0;

            for (let s = 0; s < path.length; s += step) {
              const pt = path[s];
              const pIdx = (pt.y * width + pt.x) * 4;
              sumR += rgbaPixels[pIdx];
              sumG += rgbaPixels[pIdx + 1];
              sumB += rgbaPixels[pIdx + 2];
              sampleCount++;
            }

            const avgR = Math.floor(sumR / sampleCount);
            const avgG = Math.floor(sumG / sampleCount);
            const avgB = Math.floor(sumB / sampleCount);

            commands.push({
              type: 'color',
              r: avgR,
              g: avgG,
              b: avgB,
            });

            const p0 = simplified[0];
            const moveDx = p0.x - curX;
            const moveDy = p0.y - curY;
            commands.push({ type: 'moveTo', dx: moveDx, dy: moveDy });
            curX = p0.x;
            curY = p0.y;

            for (let p = 1; p < simplified.length; p++) {
              const pt = simplified[p];
              const lineDx = pt.x - curX;
              const lineDy = pt.y - curY;
              commands.push({ type: 'lineTo', dx: lineDx, dy: lineDy });
              curX = pt.x;
              curY = pt.y;
            }
          }
        }
      }
    }
  }

  return { commands };
}

function rdp(
  points,
  start,
  end,
  epsilonSq,
  resultFlags
) {
  let maxDistSq = 0;
  let index = start;
  const pStart = points[start];
  const pEnd = points[end];

  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const lenSq = dx * dx + dy * dy;

  for (let i = start + 1; i < end; i++) {
    const p = points[i];
    let distSq = 0;

    if (lenSq > 0) {
      const cross = (p.x - pStart.x) * dy - (p.y - pStart.y) * dx;
      distSq = (cross * cross) / lenSq;
    } else {
      const tx = p.x - pStart.x;
      const ty = p.y - pStart.y;
      distSq = tx * tx + ty * ty;
    }

    if (distSq > maxDistSq) {
      maxDistSq = distSq;
      index = i;
    }
  }

  if (maxDistSq > epsilonSq) {
    rdp(points, start, index, epsilonSq, resultFlags);
    rdp(points, index, end, epsilonSq, resultFlags);
  } else {
    resultFlags[start] = true;
    resultFlags[end] = true;
  }
}

function simplifyPath(points, epsilon) {
  if (points.length <= 2) return points;
  const resultFlags = new Array(points.length).fill(false);
  rdp(points, 0, points.length - 1, epsilon * epsilon, resultFlags);

  const simplified = [];
  for (let i = 0; i < points.length; i++) {
    if (resultFlags[i]) {
      simplified.push(points[i]);
    }
  }
  return simplified;
}

/**
 * Developer Experience Tool: Generates beautiful simulated video frames.
 */
export function generateSimulatedFrame(
  frameIdx,
  totalFrames,
  width,
  height
) {
  const buffer = new Uint8Array(width * height * 4); // RGBA

  const t = frameIdx / totalFrames;
  const centerX = Math.floor(width / 2 + Math.cos(t * Math.PI * 4) * (width / 4));
  const centerY = Math.floor(height / 2 + Math.sin(t * Math.PI * 4) * (height / 4));
  const radius = Math.floor(25 + Math.sin(t * Math.PI * 6) * 10);

  const boxSize = 40;
  const boxX = Math.floor(width / 2 - boxSize / 2 + Math.sin(t * Math.PI * 2) * (width / 3));
  const boxY = Math.floor(height / 2 - boxSize / 2);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = (rowOffset + x) * 4;

      const rBg = Math.floor(40 + (x / width) * 80 + Math.sin(t * Math.PI * 2) * 20);
      const gBg = Math.floor(20 + (y / height) * 60);
      const bBg = Math.floor(100 - (x / width) * 40 + Math.cos(t * Math.PI * 2) * 20);

      const dx = x - centerX;
      const dy = y - centerY;
      const distSq = dx * dx + dy * dy;

      const inBox = x >= boxX && x < boxX + boxSize && y >= boxY && y < boxY + boxSize;

      if (distSq < radius * radius) {
        buffer[idx] = 255;
        buffer[idx + 1] = 120;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 255;
      } else if (inBox) {
        buffer[idx] = 0;
        buffer[idx + 1] = 200;
        buffer[idx + 2] = 100;
        buffer[idx + 3] = 255;
      } else {
        buffer[idx] = Math.max(0, Math.min(255, rBg));
        buffer[idx + 1] = Math.max(0, Math.min(255, gBg));
        buffer[idx + 2] = Math.max(0, Math.min(255, bBg));
        buffer[idx + 3] = 255;
      }
    }
  }

  return buffer;
}

/**
 * Computes average color in a square neighborhood around (cx, cy).
 * Smooths out camera noise for low-poly vector color generation.
 */
function getAverageColor(rgba, width, height, cx, cy, radius = 1) {
  let sumR = 0, sumG = 0, sumB = 0, count = 0;
  const xStart = Math.max(0, cx - radius);
  const xEnd = Math.min(width - 1, cx + radius);
  const yStart = Math.max(0, cy - radius);
  const yEnd = Math.min(height - 1, cy + radius);

  for (let y = yStart; y <= yEnd; y++) {
    const rowOffset = y * width;
    for (let x = xStart; x <= xEnd; x++) {
      const idx = (rowOffset + x) * 4;
      sumR += rgba[idx];
      sumG += rgba[idx + 1];
      sumB += rgba[idx + 2];
      count++;
    }
  }

  return {
    r: Math.floor(sumR / count),
    g: Math.floor(sumG / count),
    b: Math.floor(sumB / count)
  };
}
