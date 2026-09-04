const fs = require('fs');
const path = require('path');
const { LibreDwgService } = require('./dist/services/libreDwgService.js');
const DxfParser = require('dxf-parser');

const filePath = "C:\\Users\\a8007\\Downloads\\modern-2-story-house-cad-file-9-4-17-5m-free-autocad-dwg\\806. Modern 2-Story House CAD File 9.4x17.5m Full Detailed Architecture.dwg";

function decodeVniText(text) {
  if (!text) return '';
  let str = text
    .replace(/\\P/gi, ' ')
    .replace(/\{[^{}]*\}/g, (m) => {
      const parts = m.split(';');
      return parts.length > 1 ? parts[parts.length - 1].replace(/}/g, '') : '';
    })
    .replace(/\\[a-zA-Z0-9.]+(;|\s)?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/%%u/gi, '')
    .trim();

  const vniMap = [
    { vni: 'PHOØNG KHAÙCH', name: 'Living Room', type: 'Architectural Room' },
    { vni: 'PHOØNG AÊN', name: 'Dining Room', type: 'Architectural Room' },
    { vni: 'BEÁP', name: 'Kitchen', type: 'Architectural Room' },
    { vni: 'PHOØNG NGUÛ 1', name: 'Bedroom 1', type: 'Architectural Room' },
    { vni: 'PHOØNG NGUÛ 2', name: 'Bedroom 2', type: 'Architectural Room' },
    { vni: 'PHOØNG NGUÛ 3', name: 'Bedroom 3', type: 'Architectural Room' },
    { vni: 'PHOØNG NGUÛ 4', name: 'Bedroom 4', type: 'Architectural Room' },
    { vni: 'PHOØNG THÔØ', name: 'Worship Room', type: 'Architectural Room' },
    { vni: 'SINH HOAT CHUNG', name: 'Family Room', type: 'Architectural Room' },
    { vni: 'SAÂN PHÔI', name: 'Drying Yard', type: 'Outdoor/Utility' },
    { vni: 'taém ñöùng', name: 'Bathroom / Shower', type: 'Bathroom/Toilet' },
    { vni: 'GARAGE', name: 'Garage', type: 'Architectural Room' },
    { vni: 'BAN COÂNG', name: 'Balcony', type: 'Outdoor/Balcony' },
    { vni: 'TERRACE', name: 'Terrace', type: 'Outdoor/Terrace' },
    { vni: 'GIAËT', name: 'Laundry Room', type: 'Utility Room' },
  ];

  for (const m of vniMap) {
    if (str.toUpperCase().includes(m.vni.toUpperCase())) {
      return m;
    }
  }

  return null;
}

async function reconstructRooms() {
  console.log("==================================================");
  console.log("EXACT ARCHITECTURAL ROOM BOUNDARY RECONSTRUCTION");
  console.log("==================================================");

  const convertResult = await LibreDwgService.convertDwgToDxf(filePath);
  const parser = new DxfParser();
  const dxfData = parser.parseSync(convertResult.dxfContent);
  const entities = dxfData.entities || [];

  // Collect wall lines on wall layers
  const wallLines = [];
  entities.forEach(ent => {
    const layer = (ent.layer || '').toLowerCase();
    const isWallLayer = layer.includes('wall') || layer === '0' || layer.includes('nethien') || layer.includes('0.5') || layer.includes('cot');
    
    if (isWallLayer) {
      if (ent.type === 'LINE' && ent.startPoint && ent.endPoint) {
        wallLines.push({ x1: ent.startPoint.x, y1: ent.startPoint.y, x2: ent.endPoint.x, y2: ent.endPoint.y, layer: ent.layer });
      } else if (ent.type === 'LWPOLYLINE' && ent.vertices) {
        for (let i = 0; i < ent.vertices.length - 1; i++) {
          wallLines.push({ x1: ent.vertices[i].x, y1: ent.vertices[i].y, x2: ent.vertices[i+1].x, y2: ent.vertices[i+1].y, layer: ent.layer });
        }
      }
    }
  });

  // Filter text labels
  const roomLabels = [];
  entities.forEach((ent, idx) => {
    if ((ent.type === 'TEXT' || ent.type === 'MTEXT') && ent.text) {
      const pos = ent.position || ent.startPoint || { x: 0, y: 0 };
      const meta = decodeVniText(ent.text);

      if (meta && pos.y >= -1685000 && pos.y <= -1650000) {
        let floor = 'Ground Floor';
        if (pos.x >= 265000 && pos.x <= 282000) floor = 'Second Floor';
        else if (pos.x < 230000 || pos.x > 245000) return; // Ignore non-architectural side sheets

        roomLabels.push({
          floor,
          name: meta.name,
          category: meta.type,
          rawText: ent.text,
          x: pos.x,
          y: pos.y,
          layer: ent.layer
        });
      }
    }
  });

  console.log(`Genuine Architectural Room Labels Found: ${roomLabels.length}\n`);

  // Bounding box detection around each label center
  const roomsExtracted = [];

  roomLabels.forEach((rl, idx) => {
    let minX = rl.x - 3000, maxX = rl.x + 3000;
    let minY = rl.y - 3000, maxY = rl.y + 3000;

    // Find closest wall lines in 4 directions
    let closestLeft = -Infinity, closestRight = Infinity;
    let closestBottom = -Infinity, closestTop = Infinity;

    wallLines.forEach(wl => {
      // Vertical walls
      const wlMinY = Math.min(wl.y1, wl.y2);
      const wlMaxY = Math.max(wl.y1, wl.y2);
      if (rl.y >= wlMinY - 1000 && rl.y <= wlMaxY + 1000) {
        const wallX = (wl.x1 + wl.x2) / 2;
        if (wallX <= rl.x && wallX > closestLeft && (rl.x - wallX) <= 6000) {
          closestLeft = wallX;
        }
        if (wallX >= rl.x && wallX < closestRight && (wallX - rl.x) <= 6000) {
          closestRight = wallX;
        }
      }

      // Horizontal walls
      const wlMinX = Math.min(wl.x1, wl.x2);
      const wlMaxX = Math.max(wl.x1, wl.x2);
      if (rl.x >= wlMinX - 1000 && rl.x <= wlMaxX + 1000) {
        const wallY = (wl.y1 + wl.y2) / 2;
        if (wallY <= rl.y && wallY > closestBottom && (rl.y - wallY) <= 6000) {
          closestBottom = wallY;
        }
        if (wallY >= rl.y && wallY < closestTop && (wallY - rl.y) <= 6000) {
          closestTop = wallY;
        }
      }
    });

    if (closestLeft !== -Infinity) minX = closestLeft;
    if (closestRight !== Infinity) maxX = closestRight;
    if (closestBottom !== -Infinity) minY = closestBottom;
    if (closestTop !== Infinity) maxY = closestTop;

    const widthMm = maxX - minX;
    const heightMm = maxY - minY;
    const widthFt = Math.round(widthMm * 0.00328084 * 10) / 10;
    const heightFt = Math.round(heightMm * 0.00328084 * 10) / 10;
    const areaSqFt = Math.round(widthFt * heightFt);

    roomsExtracted.push({
      id: `rm-${idx + 1}`,
      floor: rl.floor,
      name: rl.name,
      category: rl.category,
      rawLabel: rl.rawText,
      labelPos: { x: Math.round(rl.x), y: Math.round(rl.y) },
      boundsMm: { minX: Math.round(minX), maxX: Math.round(maxX), minY: Math.round(minY), maxY: Math.round(maxY) },
      widthFt,
      heightFt,
      areaSqFt
    });
  });

  roomsExtracted.forEach((r, i) => {
    console.log(`Room #${i+1} [${r.floor}] - ${r.name} (${r.category}):`);
    console.log(`  Dimensions: ${r.widthFt} ft x ${r.heightFt} ft | Area: ${r.areaSqFt} sq.ft.`);
    console.log(`  Label Pos (mm): (${r.labelPos.x}, ${r.labelPos.y})`);
    console.log(`  Wall Bounds (mm): x=[${r.boundsMm.minX}, ${r.boundsMm.maxX}], y=[${r.boundsMm.minY}, ${r.boundsMm.maxY}]\n`);
  });

  const totalArea = roomsExtracted.reduce((sum, r) => sum + r.areaSqFt, 0);
  console.log("Total Verified Architectural Room Area:", totalArea, "sq.ft.");
}

reconstructRooms();
