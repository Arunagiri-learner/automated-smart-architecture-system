const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const filePath = "C:\\Users\\a8007\\Downloads\\modern-2-story-house-cad-file-9-4-17-5m-free-autocad-dwg\\806. Modern 2-Story House CAD File 9.4x17.5m Full Detailed Architecture.dwg";

async function runEndToEndTest() {
  console.log("==================================================");
  console.log("ACTUAL END-TO-END TEST WITH EXACT DWG UPLOAD");
  console.log("==================================================");

  if (!fs.existsSync(filePath)) {
    console.error("Test DWG file not found:", filePath);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = fileBuffer.length;
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log("Uploaded File Details:");
  console.log("  Filename:", fileName);
  console.log("  Size:", fileSize, "bytes");
  console.log("  SHA-256:", fileHash);

  const BASE_URL = "http://127.0.0.1:5000";

  try {
    // 1. Register a test user
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'CAD Verification User',
        email: `caduser_${Date.now()}@example.com`,
        password: 'Password123!',
        organization: 'Architecture Studio',
      })
    });

    const registerData = await registerRes.json();
    console.log("\n1. Authentication Result:", registerData.success ? "SUCCESS" : "FAILED");
    const token = registerData.token;
    const user = registerData.user;
    console.log("   User ID:", user.id);
    console.log("   Email:", user.email);

    // 2. Create a new real project
    const createProjRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Modern 2-Story House CAD Project',
        location: '9.4x17.5m Detailed Architecture Site',
        buildingType: 'Residential'
      })
    });

    const createProjData = await createProjRes.json();
    console.log("\n2. Project Creation Result:", createProjData.success ? "SUCCESS" : "FAILED");
    const newProject = createProjData.data;
    console.log("   Project ID:", newProject.id);
    console.log("   Initial Status:", newProject.status);
    console.log("   Initial Rooms:", newProject.rooms ? newProject.rooms.length : 0);

    // 3. Upload the exact DWG file via FormData
    const Blob = globalThis.Blob || require('buffer').Blob;
    const formData = new FormData();
    const fileBlob = new Blob([fileBuffer], { type: 'application/autocad' });
    formData.append('floorPlan', fileBlob, fileName);

    console.log("\n3. Uploading exact DWG file to /api/analysis/" + newProject.id + "/upload...");
    const uploadRes = await fetch(`${BASE_URL}/api/analysis/${newProject.id}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const uploadData = await uploadRes.json();
    console.log("   Upload API Response Status:", uploadRes.status);
    console.log("   Upload Success:", uploadData.success);
    console.log("   Message:", uploadData.message);

    // 4. Retrieve updated project via GET /api/projects/<newProjectId>
    const getProjRes = await fetch(`${BASE_URL}/api/projects/${newProject.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getProjData = await getProjRes.json();
    console.log("\n4. GET /api/projects/" + newProject.id + " Result:");
    console.log("   Status:", getProjData.data.status);
    console.log("   Uploaded File Name:", getProjData.data.dwgFileName);
    console.log("   Uploaded File Size:", getProjData.data.dwgFileSize);
    console.log("   Extracted Rooms Count:", getProjData.data.roomsCount);
    console.log("   Extracted Total Area (sq.ft):", getProjData.data.totalAreaSqFt);
    console.log("   Extracted Floors Count:", getProjData.data.floorsCount);
    console.log("   Extracted Occupancy:", getProjData.data.totalOccupancy);
    console.log("   Is Demo:", getProjData.data.isDemo);

    console.log("\n   Sample Extracted Rooms from GET API Response (First 3):");
    console.log(JSON.stringify(getProjData.data.rooms.slice(0, 3), null, 2));

    // 5. GET /api/analysis/<newProjectId> Result
    const getAnalysisRes = await fetch(`${BASE_URL}/api/analysis/${newProject.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getAnalysisData = await getAnalysisRes.json();
    console.log("\n5. GET /api/analysis/" + newProject.id + " Result:");
    console.log("   Status:", getAnalysisData.data.status);
    console.log("   Rooms Count:", getAnalysisData.data.roomsCount);
    console.log("   Total Area SqFt:", getAnalysisData.data.totalAreaSqFt);

    // 6. Test invalid/corrupt DWG upload to ensure project remains Draft with 0 rooms
    const createProj2Res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Invalid DWG Test Project',
        location: 'Test Location',
        buildingType: 'Office'
      })
    });
    const proj2Data = await createProj2Res.json();
    const proj2 = proj2Data.data;

    const fakeCorruptDwg = Buffer.from("NOT_A_REAL_DWG_BINARY_HEADER_DATA_12345");
    const fakeFormData = new FormData();
    const fakeBlob = new Blob([fakeCorruptDwg], { type: 'application/autocad' });
    fakeFormData.append('floorPlan', fakeBlob, 'invalid_corrupt.dwg');

    console.log("\n6. Testing Corrupt DWG Upload to /api/analysis/" + proj2.id + "/upload...");
    const corruptUploadRes = await fetch(`${BASE_URL}/api/analysis/${proj2.id}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fakeFormData
    });
    const corruptUploadData = await corruptUploadRes.json();
    console.log("   Corrupt Upload API Response Status:", corruptUploadRes.status);
    console.log("   Corrupt Upload Success:", corruptUploadData.success);
    console.log("   Returned Error:", corruptUploadData.error);

    const getProj2Res = await fetch(`${BASE_URL}/api/projects/${proj2.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getProj2Data = await getProj2Res.json();
    console.log("   Project Status after Failed DWG:", getProj2Data.data.status);
    console.log("   Project Rooms Count after Failed DWG:", getProj2Data.data.rooms.length);

    // 7. Verification checks
    const hasDemoRooms = getProjData.data.rooms.some(r =>
      r.location.includes("Executive Boardroom") ||
      r.location.includes("Visitor Lounge") ||
      r.location.includes("Main Entrance & Reception")
    );
    console.log("\n==================================================");
    console.log("VERIFICATION CHECK SUMMARY:");
    console.log("  Exact DWG Uploaded & Analyzed:", getProjData.data.dwgFileName === fileName);
    console.log("  No Demo Room Contamination:", !hasDemoRooms);
    console.log("  Actual Room Count:", getProjData.data.rooms.length);
    console.log("  Actual Calculated Total Area:", getProjData.data.totalAreaSqFt);
    console.log("  Failed DWG Rejection Status:", corruptUploadRes.status === 400);
    console.log("  Failed DWG Project Status Remained Draft:", getProj2Data.data.status === 'Draft');
    console.log("  Failed DWG Project Rooms Count Remained 0:", getProj2Data.data.rooms.length === 0);
    console.log("==================================================");

  } catch (err) {
    console.error("End to End Test Failed:", err);
  }
}

runEndToEndTest();
