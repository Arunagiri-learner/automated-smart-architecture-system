import ExcelJS from 'exceljs';
import { IProject } from '../types';
import { BudgetService } from './budgetService';

export class ExcelService {
  public static async generateProjectReport(project: IProject): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ASAS - Automated Smart Architecture System';
    workbook.created = new Date();

    const headerFillColor = '1F2937'; // Dark charcoal slate
    const headerTextColor = 'FFFFFF';
    const accentHighlightColor = '1E40AF'; // Blueprint Navy
    const zebraRowColor = 'F9FAFB';
    const totalRowColor = 'F3F4F6';
    const accentBorderColor = 'D1D5DB';

    const budget = project.budget || BudgetService.calculateBudget(project.totalAreaSqFt);
    const ratePerSqFt = budget.assumptions.ratePerSqFt;

    // -------------------------------------------------------------
    // SHEET 1: BUILDING SUMMARY
    // -------------------------------------------------------------
    const summarySheet = workbook.addWorksheet('Building Summary', {
      views: [{ showGridLines: true }],
    });

    summarySheet.columns = [
      { header: 'Specification Parameter', key: 'property', width: 32 },
      { header: 'Calculated Value', key: 'value', width: 48 },
    ];

    // Title Block
    summarySheet.mergeCells('A1:B1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'AUTOMATED SMART ARCHITECTURE SYSTEM (ASAS)';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFillColor } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 36;

    summarySheet.mergeCells('A2:B2');
    const subTitleCell = summarySheet.getCell('A2');
    subTitleCell.value = `COMPLETE BUILDING & CONSTRUCTION BUDGET REPORT — ${project.name.toUpperCase()}`;
    subTitleCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '4B5563' } };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(2).height = 24;

    // Metadata Rows
    const metaRows = [
      ['Project Name', project.name],
      ['Location', project.location],
      ['Building Type', project.buildingType],
      ['Status', project.status],
      ['Source DWG File', project.dwgFileName || 'N/A (Demo Architectural Drawing)'],
      ['Report Generated Date', new Date().toLocaleDateString('en-US', { dateStyle: 'full' })],
      ['Total Room & Space Area', `${project.totalAreaSqFt.toLocaleString()} sq.ft`],
      ['Total Floors', `${project.floorsCount} Levels`],
      ['Total Extracted Rooms', `${project.roomsCount} Spaces`],
      ['Total Building Occupancy', `${project.totalOccupancy} Persons`],
      ['Construction Quality Level', budget.assumptions.quality],
      ['Base Construction Rate', `₹ ${ratePerSqFt.toLocaleString('en-IN')} / sq.ft`],
      ['Base Construction Cost', `₹ ${Math.round(project.totalAreaSqFt * ratePerSqFt).toLocaleString('en-IN')}`],
      ['Contingency Allowance (5%)', `₹ ${budget.breakdown.contingencyCostINR.toLocaleString('en-IN')}`],
    ];

    let currRow = 4;
    metaRows.forEach(([prop, val]) => {
      const row = summarySheet.getRow(currRow);
      row.getCell(1).value = prop;
      row.getCell(2).value = val;
      row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: '374151' } };
      row.getCell(2).font = { name: 'Arial', size: 10, color: { argb: '1F2937' } };

      row.getCell(1).border = { bottom: { style: 'thin', color: { argb: accentBorderColor } } };
      row.getCell(2).border = { bottom: { style: 'thin', color: { argb: accentBorderColor } } };
      currRow++;
    });

    // PROMINENT TOTAL BUDGET BOX
    currRow += 1;
    summarySheet.mergeCells(`A${currRow}:B${currRow}`);
    const budgetBanner = summarySheet.getCell(`A${currRow}`);
    budgetBanner.value = `TOTAL ESTIMATED CONSTRUCTION BUDGET: ₹ ${budget.breakdown.totalEstimatedCostINR.toLocaleString('en-IN')}`;
    budgetBanner.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFF' } };
    budgetBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentHighlightColor } };
    budgetBanner.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(currRow).height = 36;

    // -------------------------------------------------------------
    // SHEET 2: ROOM DETAILS (Preserved Room Attributes + Cost)
    // -------------------------------------------------------------
    const roomSheet = workbook.addWorksheet('Room Details', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    roomSheet.columns = [
      { header: 'SL NO', key: 'slNo', width: 10 },
      { header: 'Floor', key: 'floor', width: 14 },
      { header: 'Location / Room Name', key: 'location', width: 36 },
      { header: 'Area in Sq.ft', key: 'areaSqFt', width: 16 },
      { header: 'Room Height - Ft', key: 'heightFt', width: 16 },
      { header: 'Occupancy', key: 'occupancy', width: 14 },
      { header: 'Rate / Sq.ft', key: 'ratePerSqFt', width: 16 },
      { header: 'Estimated Room Cost (₹)', key: 'roomCost', width: 24 },
    ];

    const roomHeaderRow = roomSheet.getRow(1);
    roomHeaderRow.height = 28;
    roomHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: headerTextColor } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFillColor } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    project.rooms.forEach((room, idx) => {
      const roomCost = Math.round(room.areaSqFt * ratePerSqFt * 1.05);

      const row = roomSheet.addRow({
        slNo: room.slNo || idx + 1,
        floor: room.floor,
        location: room.location,
        areaSqFt: room.areaSqFt,
        heightFt: room.heightFt,
        occupancy: room.occupancy,
        ratePerSqFt: ratePerSqFt,
        roomCost: roomCost,
      });

      row.height = 22;
      row.getCell('slNo').alignment = { horizontal: 'center' };
      row.getCell('floor').alignment = { horizontal: 'center' };
      row.getCell('areaSqFt').alignment = { horizontal: 'right' };
      row.getCell('areaSqFt').numFmt = '#,##0';
      row.getCell('heightFt').alignment = { horizontal: 'right' };
      row.getCell('heightFt').numFmt = '#,##0';
      row.getCell('occupancy').alignment = { horizontal: 'right' };
      row.getCell('occupancy').numFmt = '#,##0';
      row.getCell('ratePerSqFt').alignment = { horizontal: 'right' };
      row.getCell('ratePerSqFt').numFmt = '₹ #,##0';
      row.getCell('roomCost').alignment = { horizontal: 'right' };
      row.getCell('roomCost').numFmt = '₹ #,##0';

      if (idx % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraRowColor } };
        });
      }

      row.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: accentBorderColor } } };
      });
    });

    // Sheet 2 Summary Row
    const roomSummaryRow = roomSheet.addRow({
      slNo: 'TOTAL',
      floor: `${project.floorsCount} Floors`,
      location: `${project.roomsCount} Total Rooms`,
      areaSqFt: project.totalAreaSqFt,
      heightFt: '-',
      occupancy: project.totalOccupancy,
      ratePerSqFt: ratePerSqFt,
      roomCost: budget.breakdown.totalEstimatedCostINR,
    });

    roomSummaryRow.height = 26;
    roomSummaryRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalRowColor } };
      cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
    });
    roomSummaryRow.getCell('areaSqFt').numFmt = '#,##0';
    roomSummaryRow.getCell('roomCost').numFmt = '₹ #,##0';

    // -------------------------------------------------------------
    // SHEET 3: FLOOR SUMMARY
    // -------------------------------------------------------------
    const floorSheet = workbook.addWorksheet('Floor Summary', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    floorSheet.columns = [
      { header: 'Floor Name', key: 'floor', width: 16 },
      { header: 'Total Rooms', key: 'rooms', width: 14 },
      { header: 'Total Area in Sq.ft', key: 'area', width: 20 },
      { header: 'Rate / Sq.ft', key: 'rate', width: 16 },
      { header: 'Estimated Base Cost (₹)', key: 'baseCost', width: 24 },
      { header: 'Estimated Total Cost (₹)', key: 'totalCost', width: 26 },
    ];

    const floorHeaderRow = floorSheet.getRow(1);
    floorHeaderRow.height = 28;
    floorHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: headerTextColor } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFillColor } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const floorMap = new Map<string, { rooms: number; area: number }>();
    project.rooms.forEach((r) => {
      const existing = floorMap.get(r.floor) || { rooms: 0, area: 0 };
      existing.rooms += 1;
      existing.area += r.areaSqFt;
      floorMap.set(r.floor, existing);
    });

    floorMap.forEach((val, floorName) => {
      const baseCost = Math.round(val.area * ratePerSqFt);
      const totalCost = Math.round(baseCost * 1.05);

      const row = floorSheet.addRow({
        floor: `${floorName} Floor`,
        rooms: val.rooms,
        area: val.area,
        rate: ratePerSqFt,
        baseCost,
        totalCost,
      });

      row.height = 22;
      row.getCell('floor').alignment = { horizontal: 'center' };
      row.getCell('rooms').alignment = { horizontal: 'right' };
      row.getCell('area').alignment = { horizontal: 'right' };
      row.getCell('area').numFmt = '#,##0';
      row.getCell('rate').alignment = { horizontal: 'right' };
      row.getCell('rate').numFmt = '₹ #,##0';
      row.getCell('baseCost').alignment = { horizontal: 'right' };
      row.getCell('baseCost').numFmt = '₹ #,##0';
      row.getCell('totalCost').alignment = { horizontal: 'right' };
      row.getCell('totalCost').numFmt = '₹ #,##0';

      row.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: accentBorderColor } } };
      });
    });

    const floorTotalRow = floorSheet.addRow({
      floor: 'TOTAL BUILDING',
      rooms: project.roomsCount,
      area: project.totalAreaSqFt,
      rate: ratePerSqFt,
      baseCost: Math.round(project.totalAreaSqFt * ratePerSqFt),
      totalCost: budget.breakdown.totalEstimatedCostINR,
    });
    floorTotalRow.height = 26;
    floorTotalRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalRowColor } };
    });
    floorTotalRow.getCell('area').numFmt = '#,##0';
    floorTotalRow.getCell('totalCost').numFmt = '₹ #,##0';

    // -------------------------------------------------------------
    // SHEET 4: COST BREAKDOWN
    // -------------------------------------------------------------
    const breakdownSheet = workbook.addWorksheet('Cost Breakdown', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    breakdownSheet.columns = [
      { header: 'Cost Category / Work Element', key: 'category', width: 36 },
      { header: 'Percentage (%)', key: 'percentage', width: 18 },
      { header: 'Estimated Cost (₹)', key: 'cost', width: 24 },
    ];

    const bdHeaderRow = breakdownSheet.getRow(1);
    bdHeaderRow.height = 28;
    bdHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: headerTextColor } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFillColor } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    budget.breakdown.items.forEach((item) => {
      const row = breakdownSheet.addRow({
        category: item.category,
        percentage: `${item.percentage} %`,
        cost: item.costINR,
      });

      row.height = 22;
      row.getCell('percentage').alignment = { horizontal: 'right' };
      row.getCell('cost').alignment = { horizontal: 'right' };
      row.getCell('cost').numFmt = '₹ #,##0';

      row.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: accentBorderColor } } };
      });
    });

    const bdTotalRow = breakdownSheet.addRow({
      category: 'TOTAL ESTIMATED PROJECT COST',
      percentage: '100 % + Contingency',
      cost: budget.breakdown.totalEstimatedCostINR,
    });
    bdTotalRow.height = 26;
    bdTotalRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentHighlightColor } };
    });
    bdTotalRow.getCell('cost').numFmt = '₹ #,##0';

    // -------------------------------------------------------------
    // SHEET 5: ESTIMATION ASSUMPTIONS & LEGAL DISCLAIMER
    // -------------------------------------------------------------
    const assumptionsSheet = workbook.addWorksheet('Assumptions', {
      views: [{ showGridLines: true }],
    });

    assumptionsSheet.columns = [
      { header: 'Assumption Parameter', key: 'param', width: 32 },
      { header: 'Configured Value', key: 'val', width: 45 },
    ];

    const assHeaderRow = assumptionsSheet.getRow(1);
    assHeaderRow.height = 28;
    assHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: headerTextColor } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerFillColor } };
    });

    const assumptionData = [
      ['Project Name', project.name],
      ['Building Type', project.buildingType],
      ['Location', project.location],
      ['Total Room & Space Area', `${project.totalAreaSqFt.toLocaleString()} sq.ft`],
      ['Construction Quality Level', budget.assumptions.quality],
      ['Construction Rate / Sq.ft', `₹ ${ratePerSqFt.toLocaleString('en-IN')}`],
      ['Material % Share', `${budget.assumptions.materialPercentage}%`],
      ['Labour % Share', `${budget.assumptions.labourPercentage}%`],
      ['Electrical % Share', `${budget.assumptions.electricalPercentage}%`],
      ['Plumbing % Share', `${budget.assumptions.plumbingPercentage}%`],
      ['Finishing % Share', `${budget.assumptions.finishingPercentage}%`],
      ['Doors & Windows % Share', `${budget.assumptions.doorsWindowsPercentage}%`],
      ['Painting % Share', `${budget.assumptions.paintingPercentage}%`],
      ['Roofing % Share', `${budget.assumptions.roofingPercentage}%`],
      ['Other Costs % Share', `${budget.assumptions.otherPercentage}%`],
      ['Contingency Buffer %', `${budget.assumptions.contingencyPercentage}%`],
    ];

    let aRowIndex = 2;
    assumptionData.forEach(([param, val]) => {
      const row = assumptionsSheet.getRow(aRowIndex);
      row.getCell(1).value = param;
      row.getCell(2).value = val;
      row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: '374151' } };
      row.getCell(2).font = { name: 'Arial', size: 10 };
      aRowIndex++;
    });

    aRowIndex += 2;
    assumptionsSheet.mergeCells(`A${aRowIndex}:B${aRowIndex + 3}`);
    const disclaimerCell = assumptionsSheet.getCell(`A${aRowIndex}`);
    disclaimerCell.value =
      'IMPORTANT ARCHITECTURAL & LEGAL DISCLAIMER:\n' +
      '• Area is calculated from detected CAD closed space polygons (Total Room & Space Area).\n' +
      '• Occupancy load is estimated based on standard architectural building codes (1 occupant / 100 sq.ft).\n' +
      '• Construction budget is an estimate based on configurable rates and material/labour allocations.\n' +
      '• Rates and percentage shares are fully configurable by the project architect or engineer.\n' +
      '• This report is an architectural preliminary estimate, NOT a contractor quotation or certified BOQ.';
    disclaimerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '6B7280' } };
    disclaimerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraRowColor } };
    disclaimerCell.alignment = { wrapText: true, vertical: 'top' };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
