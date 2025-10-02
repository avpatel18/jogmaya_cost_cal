// Textile calculation types

export interface WeftFeeder {
  id?: string;
  feederName: string;
  yarnName: string;
  card: number;
  denier: number;
  rate: number;
  wastagePercent: number;
  sortOrder: number;
}

export interface WarpYarn {
  id?: string;
  yarnName: string;
  tar: number;
  denier: number;
  rate: number;
  sortOrder: number;
}

export interface MainInfo {
  totalCard: number;
  pickOnLooms: number;
  pano: number;
}

export interface ExtraInfo {
  wastagePercent: number;
  jobCharge: number;
  rebatePercent: number;
  salesRate: number;
  brokeragePercent: number;
}

export interface Calculation {
  id?: string;
  qualityName: string;
  mainInfo: MainInfo;
  weftFeeders: WeftFeeder[];
  warpYarns: WarpYarn[];
  extraInfo: ExtraInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

// Calculated values interfaces
export interface WeftCalculated extends WeftFeeder {
  pick: number;
  weight: number;
  totalWithWastage: number;
  costing: number;
}

export interface WarpCalculated extends WarpYarn {
  weight: number;
  costing: number;
}

export interface LengthAndPick {
  lengthCm: number;
  lengthMtr: number;
  averagePick: number;
}

export interface GeneralCost {
  yarnCost: number;
  jobCost: number;
  costWithWastage: number;
  costWithoutWastage: number;
  oneMtrCost: number;
  rebate: number;
  netRate: number;
}

export interface Profit {
  onePieceProfit: number;
  jobProfit: number;
  profitPercent: number;
}