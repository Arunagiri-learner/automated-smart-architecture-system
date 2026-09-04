import {
  IBudgetAssumptions,
  IBudgetBreakdown,
  IProjectBudget,
  IRoom,
  ConstructionQuality,
} from '../types';

export const DEFAULT_QUALITY_RATES: Record<ConstructionQuality, number> = {
  Basic: 1800,
  Standard: 2200,
  Premium: 2800,
  Luxury: 3500,
  Custom: 2200,
};

export const DEFAULT_ASSUMPTIONS: IBudgetAssumptions = {
  quality: 'Standard',
  ratePerSqFt: 2200,
  materialPercentage: 50,
  labourPercentage: 20,
  electricalPercentage: 5,
  plumbingPercentage: 4,
  finishingPercentage: 6,
  doorsWindowsPercentage: 4,
  paintingPercentage: 3,
  roofingPercentage: 3,
  otherPercentage: 5,
  contingencyPercentage: 5,
};

export class BudgetService {
  /**
   * Formats numbers into Indian Rupee Currency format (e.g. ₹4,66,70,000)
   */
  public static formatINR(amount: number): string {
    if (isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Programmatically calculates complete construction budget breakdown from total area and assumptions
   */
  public static calculateBudget(
    totalAreaSqFt: number,
    customAssumptions?: Partial<IBudgetAssumptions>
  ): { assumptions: IBudgetAssumptions; breakdown: IBudgetBreakdown } {
    const assumptions: IBudgetAssumptions = {
      ...DEFAULT_ASSUMPTIONS,
      ...customAssumptions,
    };

    // If quality is selected and ratePerSqFt not explicitly customized, set default rate for quality
    if (customAssumptions?.quality && customAssumptions.quality !== 'Custom' && !customAssumptions.ratePerSqFt) {
      assumptions.ratePerSqFt = DEFAULT_QUALITY_RATES[customAssumptions.quality];
    }

    const baseCost = Math.round(totalAreaSqFt * assumptions.ratePerSqFt);

    // Calculate component costs based on configured percentages
    const materialsCostINR = Math.round(baseCost * (assumptions.materialPercentage / 100));
    const labourCostINR = Math.round(baseCost * (assumptions.labourPercentage / 100));
    const electricalCostINR = Math.round(baseCost * (assumptions.electricalPercentage / 100));
    const plumbingCostINR = Math.round(baseCost * (assumptions.plumbingPercentage / 100));
    const finishingCostINR = Math.round(baseCost * (assumptions.finishingPercentage / 100));
    const doorsWindowsCostINR = Math.round(baseCost * (assumptions.doorsWindowsPercentage / 100));
    const paintingCostINR = Math.round(baseCost * (assumptions.paintingPercentage / 100));
    const roofingCostINR = Math.round(baseCost * (assumptions.roofingPercentage / 100));
    const otherCostINR = Math.round(baseCost * (assumptions.otherPercentage / 100));

    const subtotalCostINR =
      materialsCostINR +
      labourCostINR +
      electricalCostINR +
      plumbingCostINR +
      finishingCostINR +
      doorsWindowsCostINR +
      paintingCostINR +
      roofingCostINR +
      otherCostINR;

    const contingencyCostINR = Math.round(subtotalCostINR * (assumptions.contingencyPercentage / 100));
    const totalEstimatedCostINR = subtotalCostINR + contingencyCostINR;

    const items = [
      { category: 'Structural Materials', percentage: assumptions.materialPercentage, costINR: materialsCostINR },
      { category: 'Site Labour & Masonry', percentage: assumptions.labourPercentage, costINR: labourCostINR },
      { category: 'Electrical Works & Wiring', percentage: assumptions.electricalPercentage, costINR: electricalCostINR },
      { category: 'Plumbing & Sanitation', percentage: assumptions.plumbingPercentage, costINR: plumbingCostINR },
      { category: 'Flooring & Tile Finishing', percentage: assumptions.finishingPercentage, costINR: finishingCostINR },
      { category: 'Doors & Window Frames', percentage: assumptions.doorsWindowsPercentage, costINR: doorsWindowsCostINR },
      { category: 'Painting & Plastering', percentage: assumptions.paintingPercentage, costINR: paintingCostINR },
      { category: 'Roofing & Waterproofing', percentage: assumptions.roofingPercentage, costINR: roofingCostINR },
      { category: 'Other Works & Logistics', percentage: assumptions.otherPercentage, costINR: otherCostINR },
      { category: 'Contingency Allowance', percentage: assumptions.contingencyPercentage, costINR: contingencyCostINR },
    ];

    return {
      assumptions,
      breakdown: {
        materialsCostINR,
        labourCostINR,
        electricalCostINR,
        plumbingCostINR,
        finishingCostINR,
        doorsWindowsCostINR,
        paintingCostINR,
        roofingCostINR,
        otherCostINR,
        subtotalCostINR,
        contingencyCostINR,
        totalEstimatedCostINR,
        items,
      },
    };
  }

  /**
   * Calculates room-level estimated cost based on room area and effective rate
   */
  public static calculateRoomCosts(rooms: IRoom[], ratePerSqFt: number, totalCostMultiplier: number = 1.05): IRoom[] {
    return rooms.map((room) => {
      const estimatedCostINR = Math.round(room.areaSqFt * ratePerSqFt * totalCostMultiplier);
      return {
        ...room,
        estimatedCostINR,
      };
    });
  }
}
