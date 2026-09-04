import { IProject, IRoom } from '../types';

/**
 * Architectural Building Bounds:
 * ViewBox: 0 0 960 660
 * Outer Wall Box: x = 40, y = 40, width = 880, height = 580
 * Usable Internal Bounds: minX = 55, minY = 55, maxX = 905, maxY = 605
 */
export const DEMO_ROOMS_PROJECT_1: IRoom[] = [
  // =========================================================================
  // GROUND FLOOR (floorIndex 0) — Total 12 Rooms
  // =========================================================================
  // Top Row (y = 55, height = 150)
  { id: 'rm-101', slNo: 1, floor: 'Ground', floorIndex: 0, location: 'Main Entrance & Reception', areaSqFt: 520, heightFt: 12, occupancy: 8, status: 'Analyzed', coordinates: { x: 55, y: 55, width: 220, height: 150 }, features: ['Double height ceiling', 'Marble flooring', 'Visitor desk'] },
  { id: 'rm-102', slNo: 2, floor: 'Ground', floorIndex: 0, location: 'Visitor Lounge & Waiting', areaSqFt: 380, heightFt: 12, occupancy: 12, status: 'Analyzed', coordinates: { x: 290, y: 55, width: 180, height: 150 }, features: ['Acoustic paneling', 'Natural light'] },
  { id: 'rm-103', slNo: 3, floor: 'Ground', floorIndex: 0, location: 'Executive Boardroom', areaSqFt: 650, heightFt: 12, occupancy: 20, status: 'Analyzed', coordinates: { x: 485, y: 55, width: 240, height: 150 }, features: ['AV Conferencing', 'Smart glass screen'] },
  { id: 'rm-111', slNo: 4, floor: 'Ground', floorIndex: 0, location: 'Security & Access Control Hub', areaSqFt: 240, heightFt: 10, occupancy: 4, status: 'Analyzed', coordinates: { x: 740, y: 55, width: 165, height: 150 }, features: ['CCTV Monitoring', 'Keycard management'] },

  // Middle Row (y = 275, height = 160)
  { id: 'rm-104', slNo: 5, floor: 'Ground', floorIndex: 0, location: 'Human Resources Suite', areaSqFt: 440, heightFt: 10, occupancy: 8, status: 'Analyzed', coordinates: { x: 55, y: 275, width: 190, height: 160 }, features: ['Private interview room', 'Filing storage'] },
  { id: 'rm-105', slNo: 6, floor: 'Ground', floorIndex: 0, location: 'Finance & Accounts', areaSqFt: 480, heightFt: 10, occupancy: 10, status: 'Analyzed', coordinates: { x: 260, y: 275, width: 210, height: 160 }, features: ['Fireproof safe storage', 'Secure access control'] },
  { id: 'rm-106', slNo: 7, floor: 'Ground', floorIndex: 0, location: 'Central Server & IT Control', areaSqFt: 320, heightFt: 10, occupancy: 3, status: 'Analyzed', coordinates: { x: 485, y: 275, width: 170, height: 160 }, features: ['Precision cooling', 'Raised access floor', 'UPS backup'] },
  { id: 'rm-110', slNo: 8, floor: 'Ground', floorIndex: 0, location: 'Main Elevator Lobby & Core', areaSqFt: 410, heightFt: 12, occupancy: 15, status: 'Analyzed', coordinates: { x: 670, y: 275, width: 235, height: 160 }, features: ['3 High-speed passenger lifts', 'Fire exit stairwell'] },

  // Bottom Row (y = 475, height = 130)
  { id: 'rm-107', slNo: 9, floor: 'Ground', floorIndex: 0, location: 'Cafeteria & Breakroom', areaSqFt: 850, heightFt: 12, occupancy: 40, status: 'Analyzed', coordinates: { x: 55, y: 475, width: 300, height: 130 }, features: ['Kitchenette', 'Vending bay', 'Outdoor patio access'] },
  { id: 'rm-108', slNo: 10, floor: 'Ground', floorIndex: 0, location: 'Facility Operations Office', areaSqFt: 360, heightFt: 10, occupancy: 5, status: 'Analyzed', coordinates: { x: 370, y: 475, width: 170, height: 130 }, features: ['BMS Monitoring console'] },
  { id: 'rm-109', slNo: 11, floor: 'Ground', floorIndex: 0, location: 'Restroom Block - North', areaSqFt: 280, heightFt: 10, occupancy: 6, status: 'Analyzed', coordinates: { x: 555, y: 475, width: 160, height: 130 }, features: ['ADA compliant', 'Touchless fixtures'] },
  { id: 'rm-112', slNo: 12, floor: 'Ground', floorIndex: 0, location: 'Mail & Logistics Bay', areaSqFt: 310, heightFt: 10, occupancy: 4, status: 'Analyzed', coordinates: { x: 730, y: 475, width: 175, height: 130 }, features: ['Rear loading dock door'] },

  // =========================================================================
  // FIRST FLOOR (floorIndex 1) — Total 12 Rooms
  // =========================================================================
  // Top Row (y = 55, height = 150)
  { id: 'rm-201', slNo: 13, floor: 'First', floorIndex: 1, location: 'Managing Director Suite', areaSqFt: 580, heightFt: 10, occupancy: 4, status: 'Analyzed', coordinates: { x: 55, y: 55, width: 240, height: 150 }, features: ['Private washroom', 'Balcony extension'] },
  { id: 'rm-202', slNo: 14, floor: 'First', floorIndex: 1, location: 'VP Operations Office', areaSqFt: 410, heightFt: 10, occupancy: 3, status: 'Analyzed', coordinates: { x: 310, y: 55, width: 190, height: 150 }, features: ['Acoustic glass door'] },
  { id: 'rm-203', slNo: 15, floor: 'First', floorIndex: 1, location: 'Software Engineering Bay A', areaSqFt: 1420, heightFt: 10, occupancy: 32, status: 'Analyzed', coordinates: { x: 515, y: 55, width: 390, height: 150 }, features: ['Ergonomic workstations', 'Dual monitor arms', 'Power poles'] },

  // Middle Row (y = 275, height = 160)
  { id: 'rm-204', slNo: 16, floor: 'First', floorIndex: 1, location: 'Sprint Meeting Room 1', areaSqFt: 290, heightFt: 10, occupancy: 8, status: 'Analyzed', coordinates: { x: 55, y: 275, width: 190, height: 160 }, features: ['Whiteboard wall', 'TV Display'] },
  { id: 'rm-205', slNo: 17, floor: 'First', floorIndex: 1, location: 'Sprint Meeting Room 2', areaSqFt: 310, heightFt: 10, occupancy: 8, status: 'Analyzed', coordinates: { x: 260, y: 275, width: 180, height: 160 }, features: ['Video conferencing system'] },
  { id: 'rm-211', slNo: 18, floor: 'First', floorIndex: 1, location: 'Focus Phone Booth 1', areaSqFt: 60, heightFt: 10, occupancy: 1, status: 'Analyzed', coordinates: { x: 455, y: 275, width: 85, height: 72 }, features: ['Acoustic insulation'] },
  { id: 'rm-212', slNo: 19, floor: 'First', floorIndex: 1, location: 'Focus Phone Booth 2', areaSqFt: 60, heightFt: 10, occupancy: 1, status: 'Analyzed', coordinates: { x: 455, y: 363, width: 85, height: 72 }, features: ['Acoustic insulation'] },
  { id: 'rm-208', slNo: 20, floor: 'First', floorIndex: 1, location: 'Pantry & Coffee Nook', areaSqFt: 260, heightFt: 10, occupancy: 8, status: 'Analyzed', coordinates: { x: 555, y: 275, width: 160, height: 160 }, features: ['Espresso machine', 'Filtered water'] },
  { id: 'rm-209', slNo: 21, floor: 'First', floorIndex: 1, location: 'Restroom Block - First Floor', areaSqFt: 290, heightFt: 10, occupancy: 6, status: 'Analyzed', coordinates: { x: 730, y: 275, width: 175, height: 160 } },

  // Bottom Row (y = 475, height = 130)
  { id: 'rm-206', slNo: 22, floor: 'First', floorIndex: 1, location: 'Design & UX Studio', areaSqFt: 780, heightFt: 10, occupancy: 16, status: 'Analyzed', coordinates: { x: 55, y: 475, width: 290, height: 130 }, features: ['Color-accurate lighting', 'Plotter printer', 'Sample material library'] },
  { id: 'rm-207', slNo: 23, floor: 'First', floorIndex: 1, location: 'QA & Testing Lab', areaSqFt: 540, heightFt: 10, occupancy: 10, status: 'Analyzed', coordinates: { x: 360, y: 475, width: 240, height: 130 }, features: ['Isolated network rack', 'Device test bench'] },
  { id: 'rm-210', slNo: 24, floor: 'First', floorIndex: 1, location: 'Elevator Lobby - First Floor', areaSqFt: 390, heightFt: 10, occupancy: 12, status: 'Analyzed', coordinates: { x: 615, y: 475, width: 290, height: 130 } },

  // =========================================================================
  // SECOND FLOOR (floorIndex 2) — Total 12 Rooms
  // =========================================================================
  // Top Row (y = 55, height = 160)
  { id: 'rm-301', slNo: 25, floor: 'Second', floorIndex: 2, location: 'Product Management Open Floor', areaSqFt: 1150, heightFt: 10, occupancy: 24, status: 'Analyzed', coordinates: { x: 55, y: 55, width: 380, height: 160 } },
  { id: 'rm-302', slNo: 26, floor: 'Second', floorIndex: 2, location: 'DevOps & Infrastructure Bay', areaSqFt: 820, heightFt: 10, occupancy: 16, status: 'Analyzed', coordinates: { x: 450, y: 55, width: 280, height: 160 } },
  { id: 'rm-308', slNo: 27, floor: 'Second', floorIndex: 2, location: 'Restroom Block - Second Floor', areaSqFt: 290, heightFt: 10, occupancy: 6, status: 'Analyzed', coordinates: { x: 745, y: 55, width: 160, height: 160 } },

  // Middle Row (y = 275, height = 170)
  { id: 'rm-303', slNo: 28, floor: 'Second', floorIndex: 2, location: 'Training & Workshop Hall', areaSqFt: 1200, heightFt: 12, occupancy: 50, status: 'Analyzed', coordinates: { x: 55, y: 275, width: 380, height: 170 }, features: ['Modular tables', 'Dual projectors', 'Acoustic folding partition'] },
  { id: 'rm-304', slNo: 29, floor: 'Second', floorIndex: 2, location: 'Client Demo Room', areaSqFt: 460, heightFt: 10, occupancy: 10, status: 'Analyzed', coordinates: { x: 450, y: 275, width: 220, height: 170 } },
  { id: 'rm-305', slNo: 30, floor: 'Second', floorIndex: 2, location: 'Product Strategy War Room', areaSqFt: 380, heightFt: 10, occupancy: 8, status: 'Analyzed', coordinates: { x: 685, y: 275, width: 220, height: 170 } },

  // Bottom Row (y = 475, height = 130)
  { id: 'rm-306', slNo: 31, floor: 'Second', floorIndex: 2, location: 'Quiet Reading & Research Zone', areaSqFt: 510, heightFt: 10, occupancy: 10, status: 'Analyzed', coordinates: { x: 55, y: 475, width: 220, height: 130 } },
  { id: 'rm-307', slNo: 32, floor: 'Second', floorIndex: 2, location: 'Second Floor Pantry', areaSqFt: 250, heightFt: 10, occupancy: 6, status: 'Analyzed', coordinates: { x: 290, y: 475, width: 170, height: 130 } },
  { id: 'rm-309', slNo: 33, floor: 'Second', floorIndex: 2, location: 'Electrical & Utility Closet', areaSqFt: 160, heightFt: 10, occupancy: 1, status: 'Analyzed', coordinates: { x: 475, y: 475, width: 130, height: 130 } },
  { id: 'rm-310', slNo: 34, floor: 'Second', floorIndex: 2, location: 'Elevator Lobby - Second Floor', areaSqFt: 380, heightFt: 10, occupancy: 10, status: 'Analyzed', coordinates: { x: 620, y: 475, width: 150, height: 130 } },
  { id: 'rm-311', slNo: 35, floor: 'Second', floorIndex: 2, location: 'Storage & Archival Room', areaSqFt: 320, heightFt: 10, occupancy: 2, status: 'Analyzed', coordinates: { x: 785, y: 475, width: 120, height: 60 } },
  { id: 'rm-312', slNo: 36, floor: 'Second', floorIndex: 2, location: 'Janitor & Cleaning Supply', areaSqFt: 130, heightFt: 10, occupancy: 1, status: 'Analyzed', coordinates: { x: 785, y: 545, width: 120, height: 60 } },

  // =========================================================================
  // THIRD FLOOR (floorIndex 3) — Total 12 Rooms
  // =========================================================================
  // Top Row (y = 55, height = 160)
  { id: 'rm-401', slNo: 37, floor: 'Third', floorIndex: 3, location: 'Executive Lounge & Terrace', areaSqFt: 980, heightFt: 12, occupancy: 20, status: 'Analyzed', coordinates: { x: 55, y: 55, width: 330, height: 160 } },
  { id: 'rm-402', slNo: 38, floor: 'Third', floorIndex: 3, location: 'Boardroom B (18 Seats)', areaSqFt: 620, heightFt: 12, occupancy: 18, status: 'Analyzed', coordinates: { x: 400, y: 55, width: 250, height: 160 } },
  { id: 'rm-403', slNo: 39, floor: 'Third', floorIndex: 3, location: 'Legal & Compliance Bureau', areaSqFt: 450, heightFt: 10, occupancy: 6, status: 'Analyzed', coordinates: { x: 665, y: 55, width: 240, height: 160 } },

  // Middle Row (y = 275, height = 170)
  { id: 'rm-404', slNo: 40, floor: 'Third', floorIndex: 3, location: 'Innovation & AI Lab', areaSqFt: 1100, heightFt: 12, occupancy: 22, status: 'Analyzed', coordinates: { x: 55, y: 275, width: 380, height: 170 } },
  { id: 'rm-405', slNo: 41, floor: 'Third', floorIndex: 3, location: 'Research Fellow Suites', areaSqFt: 580, heightFt: 10, occupancy: 8, status: 'Analyzed', coordinates: { x: 450, y: 275, width: 230, height: 170 } },
  { id: 'rm-406', slNo: 42, floor: 'Third', floorIndex: 3, location: 'Patents & Records Vault', areaSqFt: 340, heightFt: 10, occupancy: 2, status: 'Analyzed', coordinates: { x: 695, y: 275, width: 210, height: 170 } },

  // Bottom Row (y = 475, height = 130)
  { id: 'rm-407', slNo: 43, floor: 'Third', floorIndex: 3, location: 'Sky Terrace Lounge', areaSqFt: 750, heightFt: 12, occupancy: 25, status: 'Analyzed', coordinates: { x: 55, y: 475, width: 250, height: 130 } },
  { id: 'rm-408', slNo: 44, floor: 'Third', floorIndex: 3, location: 'Wellness & Prayer Room', areaSqFt: 280, heightFt: 10, occupancy: 5, status: 'Analyzed', coordinates: { x: 320, y: 475, width: 150, height: 130 } },
  { id: 'rm-409', slNo: 45, floor: 'Third', floorIndex: 3, location: 'Third Floor Restroom', areaSqFt: 290, heightFt: 10, occupancy: 6, status: 'Analyzed', coordinates: { x: 485, y: 475, width: 140, height: 130 } },
  { id: 'rm-410', slNo: 46, floor: 'Third', floorIndex: 3, location: 'HVAC Mechanical Core', areaSqFt: 420, heightFt: 14, occupancy: 2, status: 'Analyzed', coordinates: { x: 640, y: 475, width: 140, height: 130 } },
  { id: 'rm-411', slNo: 47, floor: 'Third', floorIndex: 3, location: 'Elevator Lobby - Third Floor', areaSqFt: 370, heightFt: 10, occupancy: 10, status: 'Analyzed', coordinates: { x: 795, y: 475, width: 110, height: 60 } },
  { id: 'rm-412', slNo: 48, floor: 'Third', floorIndex: 3, location: 'Roof Access & Maintenance', areaSqFt: 170, heightFt: 10, occupancy: 1, status: 'Analyzed', coordinates: { x: 795, y: 545, width: 110, height: 60 } },
];

export const DEMO_PROJECT_1: IProject = {
  id: 'proj-demo-01',
  name: 'Modern Office Building',
  location: 'Chennai, TN, India',
  buildingType: 'Office',
  description: 'High-density commercial office complex with 4 floors, intelligent zone detection, and executive workspaces.',
  floorsCount: 4,
  roomsCount: DEMO_ROOMS_PROJECT_1.length,
  totalAreaSqFt: DEMO_ROOMS_PROJECT_1.reduce((sum, r) => sum + r.areaSqFt, 0),
  totalOccupancy: DEMO_ROOMS_PROJECT_1.reduce((sum, r) => sum + r.occupancy, 0),
  status: 'Analysis Complete',
  dwgFileName: 'modern_office_level1-4_v3.dwg',
  dwgFileSize: 4859200,
  isDemo: true,
  createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  rooms: DEMO_ROOMS_PROJECT_1,
};

export const INITIAL_PROJECTS: IProject[] = [
  DEMO_PROJECT_1,
  {
    id: 'proj-demo-02',
    name: 'Apollo Specialty Healthcare Wing',
    location: 'Bengaluru, KA, India',
    buildingType: 'Hospital',
    description: '3-story specialized clinical hospital wing featuring ICU blocks, diagnostic rooms, and surgical suites.',
    floorsCount: 3,
    roomsCount: 32,
    totalAreaSqFt: 34200,
    totalOccupancy: 210,
    status: 'Analysis Complete',
    dwgFileName: 'apollo_wing_arch_v2.dwg',
    dwgFileSize: 6120400,
    isDemo: true,
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    rooms: DEMO_ROOMS_PROJECT_1.slice(0, 32).map((r, i) => ({ ...r, id: `hosp-${i+1}`, slNo: i+1 })),
  },
  {
    id: 'proj-demo-03',
    name: 'Greenfield International School',
    location: 'Hyderabad, TS, India',
    buildingType: 'School',
    description: 'Modern educational campus floor plan with STEM laboratories, auditorium, and classroom pods.',
    floorsCount: 2,
    roomsCount: 28,
    totalAreaSqFt: 29800,
    totalOccupancy: 450,
    status: 'Analysis Complete',
    dwgFileName: 'greenfield_school_master.dwg',
    dwgFileSize: 3890100,
    isDemo: true,
    createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    rooms: DEMO_ROOMS_PROJECT_1.slice(0, 28).map((r, i) => ({ ...r, id: `sch-${i+1}`, slNo: i+1 })),
  }
];
