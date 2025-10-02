

import { 
  WeftFeeder, 
  WarpYarn, 
  MainInfo, 
  ExtraInfo, 
  WeftCalculated, 
  WarpCalculated, 
  LengthAndPick, 
  GeneralCost, 
  Profit 
} from './types';

// Constants
const CM_TO_METER_FACTOR = 39.37;
const DENIER_CONVERSION_FACTOR = 9000000;

/**
 * Calculate length and pick values from main info and primary feeder
 */
export function calculateLengthAndPick(
  mainInfo: MainInfo, 
  primaryFeederCard: number
): LengthAndPick {
  if (mainInfo.pickOnLooms === 0) {
    return {
      lengthCm: 0,
      lengthMtr: 0,
      averagePick: 0
    };
  }

  // Length cm = Primary feeder card / Pick on looms
  const lengthCm = primaryFeederCard / mainInfo.pickOnLooms;
  
  // Length mtr = Length cm / 39.37
  const lengthMtr = lengthCm / CM_TO_METER_FACTOR;
  
  // Average pick = Total card / Length cm
  const averagePick = lengthCm > 0 ? mainInfo.totalCard / lengthCm : 0;

  return {
    lengthCm,
    lengthMtr,
    averagePick
  };
}

/**
 * Calculate weft feeder values with formulas
 */
export function calculateWeftFeeders(
  weftFeeders: WeftFeeder[], 
  lengthAndPick: LengthAndPick, 
  pano: number
): WeftCalculated[] {
  return weftFeeders.map((feeder) => {
    // Pick = Card / Length cm
    const pick = lengthAndPick.lengthCm > 0 ? feeder.card / lengthAndPick.lengthCm : 0;
    
    // Weight = Pick * Length mtr * Pano * Denier / 9,000,000
    const weight = (pick * lengthAndPick.lengthMtr * pano * feeder.denier) / DENIER_CONVERSION_FACTOR;
    
    // Total W+W = Weight + (Weight * Wastage percentage)
    const totalWithWastage = weight + (weight * (feeder.wastagePercent / 100));
    
    // Costing = Total W+W * Rate
    const costing = totalWithWastage * feeder.rate;

    return {
      ...feeder,
      pick,
      weight,
      totalWithWastage,
      costing
    };
  });
}

/**
 * Calculate warp yarn values with formulas
 */
export function calculateWarpYarns(
  warpYarns: WarpYarn[], 
  lengthMtr: number
): WarpCalculated[] {
  return warpYarns.map((yarn) => {
    // Weight = Tar * Denier * Length mtr / 9,000,000
    const weight = (yarn.tar * yarn.denier * lengthMtr) / DENIER_CONVERSION_FACTOR;
    
    // Costing = Weight * Rate
    const costing = weight * yarn.rate;

    return {
      ...yarn,
      weight,
      costing
    };
  });
}

/**
 * Calculate general cost information
 */
export function calculateGeneralCost(
  weftCalculated: WeftCalculated[], 
  warpCalculated: WarpCalculated[], 
  extraInfo: ExtraInfo, 
  lengthAndPick: LengthAndPick
): GeneralCost {
  // Yarn Cost = Sum of all weft costings + Sum of all warp costings
  const weftTotalCost = weftCalculated.reduce((sum, feeder) => sum + feeder.costing, 0);
  const warpTotalCost = warpCalculated.reduce((sum, yarn) => sum + yarn.costing, 0);
  const yarnCost = weftTotalCost + warpTotalCost;
  
  // Job Cost = Job charge * Average pick * Length mtr
  const jobCost = extraInfo.jobCharge * lengthAndPick.averagePick * lengthAndPick.lengthMtr;
  
  // Cost Without Wastage = Yarn cost + Job cost
  const costWithoutWastage = yarnCost + jobCost;
  
  // Cost With Wastage = Cost without wastage + (Cost without wastage * Wastage percentage)
  const costWithWastage = costWithoutWastage + (costWithoutWastage * (extraInfo.wastagePercent / 100));
  
  // 1mtr Cost = Cost with wastage / Length mtr
  const oneMtrCost = lengthAndPick.lengthMtr > 0 ? costWithWastage / lengthAndPick.lengthMtr : 0;
  
  // Calculate rebate amount
  const rebate = extraInfo.salesRate * (extraInfo.rebatePercent / 100);
  
  // Calculate brokerage amount (fixed bug - now calculates as percentage)
  const brokerageAmount = extraInfo.salesRate * (extraInfo.brokeragePercent / 100);
  
  // Net Rate = Sales rate - Brokerage amount - Rebate
  const netRate = extraInfo.salesRate - brokerageAmount - rebate;

  return {
    yarnCost,
    jobCost,
    costWithWastage,
    costWithoutWastage,
    oneMtrCost,
    rebate,
    netRate
  };
}

/**
 * Calculate profit information
 */
export function calculateProfit(
  generalCost: GeneralCost, 
  extraInfo: ExtraInfo, 
  lengthAndPick: LengthAndPick
): Profit {
  // One Piece Profit = Net rate - Cost with wastage
  const onePieceProfit = generalCost.netRate - generalCost.costWithWastage;
  
  // Job Profit = (One piece profit + Job cost) / Average pick / Length mtr
  const jobProfit = lengthAndPick.averagePick > 0 && lengthAndPick.lengthMtr > 0 
    ? (onePieceProfit + generalCost.jobCost) / lengthAndPick.averagePick / lengthAndPick.lengthMtr 
    : 0;
  
  // Profit % = One piece profit / Sales rate * 100
  const profitPercent = extraInfo.salesRate > 0 ? (onePieceProfit / extraInfo.salesRate) * 100 : 0;

  return {
    onePieceProfit,
    jobProfit,
    profitPercent
  };
}

/**
 * Format number as INR currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Get totals for weft calculated values
 */
export function getWeftTotals(weftCalculated: WeftCalculated[]) {
  return {
    totalCard: weftCalculated.reduce((sum, feeder) => sum + feeder.card, 0),
    totalPick: weftCalculated.reduce((sum, feeder) => sum + feeder.pick, 0),
    totalWeight: weftCalculated.reduce((sum, feeder) => sum + feeder.weight, 0),
    totalWithWastage: weftCalculated.reduce((sum, feeder) => sum + feeder.totalWithWastage, 0),
    totalCosting: weftCalculated.reduce((sum, feeder) => sum + feeder.costing, 0)
  };
}

/**
 * Get totals for warp calculated values
 */
export function getWarpTotals(warpCalculated: WarpCalculated[]) {
  return {
    totalWeight: warpCalculated.reduce((sum, yarn) => sum + yarn.weight, 0),
    totalCosting: warpCalculated.reduce((sum, yarn) => sum + yarn.costing, 0)
  };
}
