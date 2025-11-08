export interface KeyMetric {
  name: string;
  value: string;
  unit: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface MarketTrend {
  name: string;
  impact: number; // 1-10 scale
  description?: string;
}

export interface MarketAnalysis {
  targetMarket: string;
  marketSize: string;
  competitors: string[];
  trends?: MarketTrend[];
  marketGrowth?: number; // percentage
}

export interface Financials {
  pricingStrategy?: string;
  revenueStreams?: string[];
  initialCosts?: {
    development?: number;
    marketing?: number;
    operations?: number;
    infrastructure?: number;
    legal?: number;
    other?: number;
  };
  projectedRevenue?: {
    year1?: number;
    year2?: number;
    year3?: number;
    year4?: number;
    year5?: number;
  };
  monthlyBurnRate?: number;
  breakEvenMonth?: number;
  totalFundingNeeded?: number;
}

export interface TimelineMilestone {
  phase: string;
  duration: string; // e.g., "3 months"
  tasks: string[];
  cost: number;
  dependencies?: string[];
}

export interface MVPTimeline {
  milestones: TimelineMilestone[];
  totalDuration: string;
  launchDate?: string;
}

export interface Risk {
  name: string;
  severity: number;
  mitigation?: string;
}

export interface BusinessAnalysis {
  elevatorPitch?: string;
  keyMetrics?: KeyMetric[];
  swot?: SWOT;
  marketAnalysis?: MarketAnalysis;
  financials?: Financials;
  risks?: Risk[];
  mvpTimeline?: MVPTimeline;
}

export interface AppPrototypeData {
  code: string;
  url?: string;
}

export interface Project {
  id: number;
  businessIdea: string;
  targetAudience: string;
  budget: string;
  app: AppPrototypeData;
  analysis: BusinessAnalysis;
  createdAt: string;
}

export interface Template {
  name: string;
  prompt: string;
  description: string;
  icon: string;
}