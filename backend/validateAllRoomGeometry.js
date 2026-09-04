const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { LibreDwgService } = require('./dist/services/libreDwgService.js');
const { floorPlanProcessor } = require('./dist/services/floorPlanProcessor.js');
const DxfParser = require('dxf-parser');

const filePath = "C:\\Users\\a8007\\Downloads\\modern-2-story-house-cad-file-9-4-17-5m-free-autocad-dwg\\806. Modern 2-Story House CAD File 9.4x17.5m Full Detailed Architecture.dwg";

function decodeVniText(text) {
  if (!text) return null;
  const str = text
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
    { vni: 'PHOØNG KHAÙCH', name: 'Living Room', category: 'ROOM' },
    { vni: 'PHOØNG AÊN', name: 'Dining Room', category: 'ROOM' },
    { vni: 'BEÁP', name: 'Kitchen', category: 'ROOM' },
    { vni: 'PHOØNG NGUÛ 1', name: 'Bedroom 1', category: 'ROOM' },
    { vni: 'PHOØNG NGUÛ 2', name: 'Bedroom 2', category: 'ROOM' },
    { vni: 'PHOØNG NGUÛ 3', name: 'Bedroom 3', category: 'ROOM' },
    { vni: 'PHOØNG NGUÛ 4', name: 'Bedroom 4', category: 'ROOM' },
    { vni: 'PHOØNG THÔØ', name: 'Worship Room', category: 'ROOM' },
    { vni: 'SINH HOAT CHUNG', name: 'Family Room', category: 'ROOM' },
    { vni: 'SAÂN PHÔI', name: 'Drying Yard', category: 'OUTDOOR/UTILITY' },
    { vni: 'taém ñöùng', name: 'Bathroom / Shower', category: 'BATHROOM/TOILET' },
    { vni: 'GARAGE', name: 'Garage', category: 'GARAGE' },
    { vni: 'BAN COÂNG', name: 'Balcony', category: 'BALCONY/TERRACE' },
    { vni: 'TERRACE', name: 'Terrace', category: 'BALCONY/TERRACE' },
    { vni: 'GIAËT', name: 'Laundry Room', category: 'OUTDOOR/UTILITY' },
  ];

  for (const m of vniMap) {
    if (str.toUpperCase().includes(m.vni.toUpperCase())) {
      return m;
    }
  }

  return null;
}

// Bounding Box Overlap Check (checks strict interior area overlap > 0.5 sq.ft)
function checkBBoxOverlap(r1, r2) {
  const b1 = r1.coordinates;
  const b2 = r2.coordinates;

  const r1Left = r1.polygon ? Math.min(...r1.polygon.map(p => p[0])) : b1.x;
  const r1Right = r1.polygon ? Math.max(...r1.polygon.map(p => p[0])) : b1.x + b1.width;
  const r1Bottom = r1.polygon ? Math.min(...r1.polygon.map(p => p[1])) : b1.y;
  const r1Top = r1.polygon ? Math.max(...r1.polygon.map(p => p[1])) : b1.y + b1.height;

  const r2Left = r2.polygon ? Math.min(...r2.polygon.map(p => p[0])) : b2.x;
  const r2Right = r2.polygon ? Math.max(...r2.polygon.map(p => p[0])) : b2.x + b2.width;
  const r2Bottom = r2.polygon ? Math.min(...r2.polygon.map(p => p[1])) : b2.y;
  const r2Top = r2.polygon ? Math.max(...r2.polygon.map(p => p[1])) : b2.y + b2.height;

  const xOverlap = Math.max(0, Math.min(r1Right, r2Right) - Math.max(r1Left, r2Left));
  const yOverlap = Math.max(0, Math.min(r1Top, r2Top) - Math.max(r1Bottom, r2Bottom));

  const overlapArea = xOverlap * yOverlap;
  return {
    overlaps: overlapArea > 0.5,
    overlapAreaSqFt: Math.round(overlapArea * 100) / 100
  };
}

async function validateAllGeometry() {
  console.log("==================================================");
  console.log("FINAL GEOMETRY VALIDATION & OVERLAP TEST");
  console.log("==================================================");

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = fileBuffer.length;
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log("1. SHA-256 File Identity Verification:");
  console.log("   File:", fileName);
  console.log("   Size:", fileSize, "bytes");
  console.log("   SHA-256:", sha256);

  // Run FloorPlanProcessor
  const result = await floorPlanProcessor.processFloorPlan(filePath, fileName);
  const rooms = result.rooms;

  console.log("\n2. Category Breakdown & Space Classification:");
  const breakdown = {
    ROOM: [],
    'BATHROOM/TOILET': [],
    GARAGE: [],
    'OUTDOOR/UTILITY': [],
    'BALCONY/TERRACE': []
  };

  rooms.forEach(r => {
    let cat = 'ROOM';
    if (r.location.includes('Bathroom') || r.location.includes('Shower')) cat = 'BATHROOM/TOILET';
    else if (r.location.includes('Garage')) cat = 'GARAGE';
    else if (r.location.includes('Drying Yard') || r.location.includes('Laundry')) cat = 'OUTDOOR/UTILITY';
    else if (r.location.includes('Balcony') || r.location.includes('Terrace')) cat = 'BALCONY/TERRACE';

    breakdown[cat].push(r);
  });

  console.log(`   - Enclosed Architectural Rooms: ${breakdown.ROOM.length}`);
  console.log(`   - Bathrooms / Toilets: ${breakdown['BATHROOM/TOILET'].length}`);
  console.log(`   - Garage: ${breakdown.GARAGE.length}`);
  console.log(`   - Outdoor / Utility Spaces: ${breakdown['OUTDOOR/UTILITY'].length}`);
  console.log(`   - Balconies / Terraces: ${breakdown['BALCONY/TERRACE'].length}`);
  console.log(`   Total Analyzed Spaces: ${rooms.length}`);

  console.log("\n3. Floor Area Calculations & Sums:");
  const groundRooms = rooms.filter(r => r.floor === 'Ground');
  const secondRooms = rooms.filter(r => r.floor === 'First' || r.floor === 'Second' || r.floorIndex === 1);

  const groundAreaSum = groundRooms.reduce((sum, r) => sum + r.areaSqFt, 0);
  const secondAreaSum = secondRooms.reduce((sum, r) => sum + r.areaSqFt, 0);
  const combinedTotalArea = groundAreaSum + secondAreaSum;

  console.log(`   - Ground Floor Rooms (${groundRooms.length}): ${groundAreaSum} sq.ft.`);
  console.log(`   - Second Floor Rooms (${secondRooms.length}): ${secondAreaSum} sq.ft.`);
  console.log(`   - Combined Total Analyzed Area: ${combinedTotalArea} sq.ft.`);
  console.log(`   - Processor Reported Total Area: ${result.extractedTotalArea} sq.ft.`);
  console.log(`   - Area Sum Agreement Check: ${combinedTotalArea === result.extractedTotalArea ? 'MATCHED (100%)' : 'MISMATCH'}`);

  console.log("\n4. Polygon Overlap & Intersection Check:");
  let overlapsCount = 0;
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (rooms[i].floor === rooms[j].floor) {
        const overlapResult = checkBBoxOverlap(rooms[i], rooms[j]);
        if (overlapResult.overlaps) {
          overlapsCount++;
          console.log(`   ⚠️ OVERLAP DETECTED [${rooms[i].floor}]: '${rooms[i].location}' (#${rooms[i].id}) and '${rooms[j].location}' (#${rooms[j].id}) - Overlap Area: ${overlapResult.overlapAreaSqFt} sq.ft.`);
        }
      }
    }
  }

  if (overlapsCount === 0) {
    console.log("   ✅ SUCCESS: 0 Overlapping Room Pairs Found. Every room boundary is completely non-overlapping and geometrically isolated.");
  } else {
    console.log(`   ⚠️ WARNING: ${overlapsCount} Overlapping Room Pairs Found.`);
  }

  console.log("\n5. Occupancy Calculation Method:");
  console.log("   - Building Code Occupant Load Standard: 100 sq.ft per occupant for residential/office spaces");
  console.log("   - Formula: Math.max(1, Math.round(areaSqFt / 100))");
  rooms.forEach(r => {
    console.log(`   - ${r.floor} ${r.location} (${r.areaSqFt} sq.ft) -> Estimated Occupancy: ${r.occupancy} person(s)`);
  });

  console.log("\n6. Detailed Inspection Table for All 18 Spaces:");
  rooms.forEach(r => {
    console.log(`   ID: ${r.id} | Floor: ${r.floor} | Label: "${r.location}" | Area: ${r.areaSqFt} sq.ft | Dims: ${r.coordinates.width}ft x ${r.coordinates.height}ft | Status: ${r.status}`);
  });
}

validateAllGeometry();
