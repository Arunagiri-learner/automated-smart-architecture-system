const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { LibreDwgService } = require('./dist/services/libreDwgService.js');
const { ArchitecturalFloorPlanProcessor } = require('./dist/services/floorPlanProcessor.js');
const DxfParser = require('dxf-parser');

const filePath = "C:\\Users\\a8007\\Downloads\\modern-2-story-house-cad-file-9-4-17-5m-free-autocad-dwg\\806. Modern 2-Story House CAD File 9.4x17.5m Full Detailed Architecture.dwg";

async function runTest() {
  console.log("==================================================");
  console.log("REQUIRED VERIFICATION — EXACT USER DWG");
  console.log("==================================================");
  
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;
  const fileName = path.basename(filePath);
  
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const headerBytes = fileBuffer.subarray(0, 10);
  const headerAscii = headerBytes.toString('ascii');
  const headerHex = headerBytes.subarray(0, 10).toString('hex');

  console.log("1. Exact Filename:", fileName);
  console.log("2. Exact File Size (bytes):", fileSize);
  console.log("3. SHA-256 Hash:", hash);
  console.log("4. First 10 Bytes (ASCII):", JSON.stringify(headerAscii));
  console.log("5. First 10 Bytes (HEX):", headerHex);

  let dwgVersion = "Unknown";
  if (headerAscii.startsWith("AC1032")) dwgVersion = "AutoCAD 2018 (AC1032)";
  else if (headerAscii.startsWith("AC1027")) dwgVersion = "AutoCAD 2013 (AC1027)";
  else if (headerAscii.startsWith("AC1024")) dwgVersion = "AutoCAD 2010 (AC1024)";
  else if (headerAscii.startsWith("AC1021")) dwgVersion = "AutoCAD 2007 (AC1021)";
  else if (headerAscii.startsWith("AC1018")) dwgVersion = "AutoCAD 2004 (AC1018)";
  else if (headerAscii.startsWith("AC1015")) dwgVersion = "AutoCAD 2000 (AC1015)";
  console.log("6. Detected DWG Version:", dwgVersion);

  console.log("\n==================================================");
  console.log("DIRECT PARSER TEST");
  console.log("==================================================");
  const startTime = Date.now();
  console.log("1. LibreDWG Initialization: Starting...");
  const convertResult = await LibreDwgService.convertDwgToDxf(filePath);
  const duration = Date.now() - startTime;

  if (!convertResult.success) {
    console.error("2. DWG Read Result: FAILED");
    console.error("Error details:", convertResult.error);
    process.exit(1);
  }

  const dxfString = convertResult.dxfContent;
  console.log("2. DWG Read Result: SUCCESS");
  console.log("3. Extracted DXF byte size:", dxfString.length, "bytes");
  console.log(`4. Conversion completed in ${duration}ms`);

  // Parse DXF structure using dxf-parser to report detailed entity counts
  const parser = new DxfParser();
  let dxfData = null;
  try {
    dxfData = parser.parseSync(dxfString);
  } catch (e) {
    console.error("DXF Parsing Error:", e.message);
  }

  const entities = (dxfData && dxfData.entities) || [];
  console.log("5. Total Entity Count:", entities.length);

  // Group entity counts
  const entityTypeCounts = {};
  let lineCount = 0;
  let lwpolylineCount = 0;
  let polylineCount = 0;
  let arcCount = 0;
  let circleCount = 0;
  let textCount = 0;
  let mtextCount = 0;
  const layersSet = new Set();

  entities.forEach(ent => {
    const type = ent.type;
    entityTypeCounts[type] = (entityTypeCounts[type] || 0) + 1;
    if (ent.layer) layersSet.add(ent.layer);

    if (type === 'LINE') lineCount++;
    else if (type === 'LWPOLYLINE') lwpolylineCount++;
    else if (type === 'POLYLINE') polylineCount++;
    else if (type === 'ARC') arcCount++;
    else if (type === 'CIRCLE') circleCount++;
    else if (type === 'TEXT') textCount++;
    else if (type === 'MTEXT') mtextCount++;
  });

  console.log("6. Entity Type Counts:", JSON.stringify(entityTypeCounts, null, 2));
  console.log("7. LINE Count:", lineCount);
  console.log("8. LWPOLYLINE Count:", lwpolylineCount);
  console.log("9. POLYLINE Count:", polylineCount);
  console.log("10. ARC Count:", arcCount);
  console.log("11. CIRCLE Count:", circleCount);
  console.log("12. TEXT Count:", textCount);
  console.log("13. MTEXT Count:", mtextCount);
  console.log("14. Unique Layer Count:", layersSet.size);
  console.log("    Sample Layers:", Array.from(layersSet).slice(0, 10));

  // Closed polylines count
  let closedPolyCount = 0;
  entities.forEach(ent => {
    if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
      const vertices = ent.vertices || [];
      const isClosedFlag = (ent.shape === true || (ent.flags & 1) === 1);
      const isClosedCoords = vertices.length > 2 &&
        Math.abs(vertices[0].x - vertices[vertices.length - 1].x) < 0.01 &&
        Math.abs(vertices[0].y - vertices[vertices.length - 1].y) < 0.01;
      if (isClosedFlag || isClosedCoords) {
        closedPolyCount++;
      }
    }
  });
  console.log("15. Closed Polyline Count:", closedPolyCount);

  // Model-space extents calculation
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  entities.forEach(ent => {
    const checkPoint = (pt) => {
      if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
    };
    if (ent.vertices) ent.vertices.forEach(checkPoint);
    if (ent.position) checkPoint(ent.position);
    if (ent.startPoint) checkPoint(ent.startPoint);
    if (ent.endPoint) checkPoint(ent.endPoint);
  });

  console.log("16. Model-space Extents:", { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY });

  console.log("\n==================================================");
  console.log("CRITICAL — PROVE GEOMETRY IS REAL (ORIGINAL CAD COORDINATES)");
  console.log("==================================================");
  const sampleEntities = entities.filter(e => e.type === 'LWPOLYLINE' || e.type === 'LINE' || e.type === 'TEXT' || e.type === 'MTEXT').slice(0, 5);
  sampleEntities.forEach((ent, idx) => {
    console.log(`\nEntity #${idx + 1}: Type=${ent.type}, Layer=${ent.layer}`);
    if (ent.vertices) {
      console.log(`  Vertices (${ent.vertices.length}):`, JSON.stringify(ent.vertices.slice(0, 4).map(v => [v.x, v.y])));
    } else if (ent.startPoint && ent.endPoint) {
      console.log(`  Start: [${ent.startPoint.x}, ${ent.startPoint.y}], End: [${ent.endPoint.x}, ${ent.endPoint.y}]`);
    } else if (ent.text || ent.string) {
      console.log(`  Text Value: "${ent.text || ent.string}", Position: [${ent.position ? ent.position.x : 'N/A'}, ${ent.position ? ent.position.y : 'N/A'}]`);
    }
  });

  console.log("\n==================================================");
  console.log("ROOM EXTRACTION & AREA VALIDATION VIA FLOORPLANPROCESSOR");
  console.log("==================================================");
  const processor = new ArchitecturalFloorPlanProcessor();
  const processResult = await processor.processFloorPlan(filePath, fileName);
  console.log("Processor Output Message:", processResult.message);
  console.log("Total Area SqFt:", processResult.extractedTotalArea);
  console.log("Extracted Room Count:", processResult.extractedRoomsCount);
  console.log("Floors Count:", processResult.extractedFloorsCount);

  console.log("\nExtracted Rooms Details (First 10):");
  processResult.rooms.slice(0, 10).forEach((r, idx) => {
    console.log(`\nRoom #${idx + 1}:`);
    console.log(`  ID: ${r.id}`);
    console.log(`  Location/Label: ${r.location}`);
    console.log(`  Calculated Area: ${r.areaSqFt} sq.ft.`);
    console.log(`  Coordinates:`, JSON.stringify(r.coordinates));
  });
}

runTest();
