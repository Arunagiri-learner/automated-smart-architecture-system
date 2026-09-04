const fs = require('fs');
const path = require('path');
const { LibreDwgService } = require('./dist/services/libreDwgService.js');
const DxfParser = require('dxf-parser');

const filePath = "C:\\Users\\a8007\\Downloads\\modern-2-story-house-cad-file-9-4-17-5m-free-autocad-dwg\\806. Modern 2-Story House CAD File 9.4x17.5m Full Detailed Architecture.dwg";

async function inspectArchitecturalSheets() {
  console.log("==================================================");
  console.log("ARCHITECTURAL SHEETS DIAGNOSTICS");
  console.log("==================================================");

  const convertResult = await LibreDwgService.convertDwgToDxf(filePath);
  const parser = new DxfParser();
  const dxfData = parser.parseSync(convertResult.dxfContent);
  const entities = dxfData.entities || [];

  // Filter text labels in Architectural Ground Floor & 2nd Floor regions
  const archText = [];
  entities.forEach(ent => {
    if ((ent.type === 'TEXT' || ent.type === 'MTEXT') && ent.text) {
      const pos = ent.position || ent.startPoint || { x: 0, y: 0 };
      // Check if inside Architectural floor plan regions
      // Ground Floor: X ~ [230000, 245000], Y ~ [-1680000, -1650000]
      // Floor 2:      X ~ [265000, 282000], Y ~ [-1680000, -1650000]
      if (pos.y >= -1685000 && pos.y <= -1650000) {
        let cleanText = ent.text
          .replace(/\\P/gi, ' ')
          .replace(/\{[^{}]*\}/g, (m) => {
            const parts = m.split(';');
            return parts.length > 1 ? parts[parts.length - 1].replace(/}/g, '') : '';
          })
          .replace(/\\[a-zA-Z0-9.]+(;|\s)?/gi, '')
          .replace(/[{}]/g, '')
          .trim();

        if (pos.x >= 230000 && pos.x <= 245000) {
          archText.push({ floor: 'Ground Floor (Tầng trệt)', text: cleanText, raw: ent.text, x: pos.x, y: pos.y, layer: ent.layer });
        } else if (pos.x >= 265000 && pos.x <= 282000) {
          archText.push({ floor: 'Second Floor (Tầng 2)', text: cleanText, raw: ent.text, x: pos.x, y: pos.y, layer: ent.layer });
        }
      }
    }
  });

  console.log("\n--- ARCHITECTURAL FLOOR PLAN TEXT LABELS FOUND ---");
  archText.forEach(t => {
    console.log(`[${t.floor}] (${t.x.toFixed(1)}, ${t.y.toFixed(1)}) | Clean: "${t.text}" | Layer: ${t.layer}`);
  });

  // Now inspect closed polylines in Ground Floor & Second Floor regions
  const archPolygons = [];
  entities.forEach((ent, idx) => {
    if ((ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') && ent.vertices && ent.vertices.length >= 3) {
      const vertices = ent.vertices.map(v => ({ x: v.x, y: v.y }));
      const isClosed = ent.shape === true || ent.closed === true ||
        (Math.abs(vertices[0].x - vertices[vertices.length - 1].x) < 0.01 &&
          Math.abs(vertices[0].y - vertices[vertices.length - 1].y) < 0.01);

      if (isClosed) {
        const minX = Math.min(...vertices.map(v => v.x));
        const maxX = Math.max(...vertices.map(v => v.x));
        const minY = Math.min(...vertices.map(v => v.y));
        const maxY = Math.max(...vertices.map(v => v.y));

        if (minY >= -1685000 && maxY <= -1650000) {
          let floorName = null;
          if (minX >= 230000 && maxX <= 245000) floorName = 'Ground Floor';
          else if (minX >= 265000 && maxX <= 282000) floorName = 'Second Floor';

          if (floorName) {
            let area = 0;
            const n = vertices.length;
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n;
              area += vertices[i].x * vertices[j].y;
              area -= vertices[j].x * vertices[i].y;
            }
            const rawArea = Math.abs(area) / 2;
            const width = maxX - minX;
            const height = maxY - minY;
            const widthFt = width * 0.00328084;
            const heightFt = height * 0.00328084;
            const areaSqFt = rawArea / 92903.04;
            const aspectRatio = Math.max(width, height) / Math.min(width, height);

            archPolygons.push({
              floor: floorName,
              entityIndex: idx,
              layer: ent.layer,
              widthFt, heightFt,
              areaSqFt,
              aspectRatio,
              minX, maxX, minY, maxY
            });
          }
        }
      }
    }
  });

  console.log(`\n--- ARCHITECTURAL CLOSED POLYGONS FOUND (${archPolygons.length}) ---`);
  archPolygons.sort((a, b) => b.areaSqFt - a.areaSqFt);
  archPolygons.forEach((p, i) => {
    console.log(`\nPolygon #${i+1} [${p.floor}] Layer: ${p.layer}:`);
    console.log(`  Dimensions: ${p.widthFt.toFixed(2)} ft x ${p.heightFt.toFixed(2)} ft | Area: ${p.areaSqFt.toFixed(2)} sq.ft.`);
    console.log(`  Aspect Ratio: ${p.aspectRatio.toFixed(2)} | Bounds: x=[${p.minX.toFixed(0)}, ${p.maxX.toFixed(0)}], y=[${p.minY.toFixed(0)}, ${p.maxY.toFixed(0)}]`);
    
    // Nearest Architectural Label
    let closest = null, minDist = Infinity;
    const cx = (p.minX + p.maxX)/2, cy = (p.minY + p.maxY)/2;
    archText.forEach(t => {
      const d = Math.hypot(t.x - cx, t.y - cy);
      if (d < minDist) { minDist = d; closest = t; }
    });
    if (closest) {
      console.log(`  Nearest Label: "${closest.text}" (Dist: ${(minDist * 0.00328084).toFixed(2)} ft)`);
    }
  });
}

inspectArchitecturalSheets();
