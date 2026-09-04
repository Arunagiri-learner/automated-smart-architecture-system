const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { LibreDwgService } = require('./dist/services/libreDwgService.js');
const DxfParser = require('dxf-parser');

const filePath = "C:\\Users\\a8007\\Downloads\\modern-2-story-house-cad-file-9-4-17-5m-free-autocad-dwg\\806. Modern 2-Story House CAD File 9.4x17.5m Full Detailed Architecture.dwg";

async function diagnose() {
  console.log("==================================================");
  console.log("TASK 1 & 2 DIAGNOSTICS — INSPECTING ALL CAD ENTITIES");
  console.log("==================================================");

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = fileBuffer.length;
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log("File Name:", fileName);
  console.log("File Size:", fileSize, "bytes");
  console.log("SHA-256:", sha256);

  const convertResult = await LibreDwgService.convertDwgToDxf(filePath);
  if (!convertResult.success) {
    console.error("Conversion failed:", convertResult.error);
    process.exit(1);
  }

  const parser = new DxfParser();
  const dxfData = parser.parseSync(convertResult.dxfContent);
  const entities = dxfData.entities || [];

  // Group entities by layer
  const layerSummary = {};
  entities.forEach(ent => {
    const l = ent.layer || '0';
    if (!layerSummary[l]) {
      layerSummary[l] = { count: 0, types: {} };
    }
    layerSummary[l].count++;
    layerSummary[l].types[ent.type] = (layerSummary[l].types[ent.type] || 0) + 1;
  });

  console.log("\n--- LAYER SUMMARY ---");
  console.log(JSON.stringify(layerSummary, null, 2));

  // Collect ALL Text Labels
  const textLabels = [];
  entities.forEach((ent, idx) => {
    if ((ent.type === 'TEXT' || ent.type === 'MTEXT') && ent.text) {
      const pos = ent.position || ent.startPoint || { x: 0, y: 0 };
      let cleanText = ent.text
        .replace(/\\P/gi, ' ')
        .replace(/\{[^{}]*\}/g, (m) => {
          const parts = m.split(';');
          return parts.length > 1 ? parts[parts.length - 1].replace(/}/g, '') : '';
        })
        .replace(/\\[a-zA-Z0-9.]+(;|\s)?/gi, '')
        .replace(/[{}]/g, '')
        .trim();

      textLabels.push({
        index: idx,
        layer: ent.layer,
        type: ent.type,
        rawText: ent.text,
        cleanText,
        x: pos.x,
        y: pos.y
      });
    }
  });

  console.log(`\n--- ALL TEXT/MTEXT LABELS FOUND (${textLabels.length}) ---`);
  textLabels.forEach(t => {
    console.log(`[Layer: ${t.layer}] Pos: (${t.x.toFixed(1)}, ${t.y.toFixed(1)}) | Raw: "${t.rawText}" | Clean: "${t.cleanText}"`);
  });

  // Collect ALL Closed Polylines
  const closedPolylines = [];
  entities.forEach((ent, idx) => {
    if ((ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') && ent.vertices && ent.vertices.length >= 3) {
      const vertices = ent.vertices.map(v => ({ x: v.x, y: v.y }));
      const isClosed = ent.shape === true || ent.closed === true ||
        (Math.abs(vertices[0].x - vertices[vertices.length - 1].x) < 0.01 &&
          Math.abs(vertices[0].y - vertices[vertices.length - 1].y) < 0.01);

      if (isClosed) {
        // Shoelace area
        let area = 0;
        const n = vertices.length;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += vertices[i].x * vertices[j].y;
          area -= vertices[j].x * vertices[i].y;
        }
        const rawArea = Math.abs(area) / 2;
        const minX = Math.min(...vertices.map(v => v.x));
        const maxX = Math.max(...vertices.map(v => v.x));
        const minY = Math.min(...vertices.map(v => v.y));
        const maxY = Math.max(...vertices.map(v => v.y));
        const width = maxX - minX;
        const height = maxY - minY;

        closedPolylines.push({
          entityIndex: idx,
          layer: ent.layer,
          type: ent.type,
          verticesCount: vertices.length,
          verticesSample: vertices.slice(0, 4),
          rawArea,
          minX, maxX, minY, maxY,
          width, height,
          aspectRatio: width > 0 && height > 0 ? (Math.max(width, height) / Math.min(width, height)) : 0
        });
      }
    }
  });

  console.log(`\n--- ALL CLOSED POLYLINES (${closedPolylines.length}) ---`);
  closedPolylines.sort((a, b) => b.rawArea - a.rawArea);
  closedPolylines.forEach((cp, i) => {
    console.log(`\nPolyline #${i + 1} (Entity Index: ${cp.entityIndex}, Layer: ${cp.layer}):`);
    console.log(`  Raw Area (mm²): ${cp.rawArea.toFixed(1)} | Converted sq.ft (mm²/92903): ${(cp.rawArea / 92903.04).toFixed(2)} sq.ft.`);
    console.log(`  Width (mm): ${cp.width.toFixed(1)} mm | Height (mm): ${cp.height.toFixed(1)} mm | Aspect Ratio: ${cp.aspectRatio.toFixed(2)}`);
    console.log(`  Width (ft): ${(cp.width * 0.00328084).toFixed(2)} ft | Height (ft): ${(cp.height * 0.00328084).toFixed(2)} ft`);
    console.log(`  Bounds: x=[${cp.minX.toFixed(1)}, ${cp.maxX.toFixed(1)}], y=[${cp.minY.toFixed(1)}, ${cp.maxY.toFixed(1)}]`);
    
    // Find nearest text label
    const centerX = (cp.minX + cp.maxX) / 2;
    const centerY = (cp.minY + cp.maxY) / 2;
    let minDistance = Infinity;
    let closestLabel = null;
    textLabels.forEach(tl => {
      const dist = Math.hypot(tl.x - centerX, tl.y - centerY);
      if (dist < minDistance) {
        minDistance = dist;
        closestLabel = tl;
      }
    });

    if (closestLabel) {
      console.log(`  Nearest Text Label: "${closestLabel.cleanText}" (Dist: ${minDistance.toFixed(1)} mm, Layer: ${closestLabel.layer})`);
    }
  });
}

diagnose();
