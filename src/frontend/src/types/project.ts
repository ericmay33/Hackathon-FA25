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

export interface MarketAnalysis {
  targetMarket: string;
  marketSize: string;
  competitors: string[];
}

export interface Financials {
  pricingStrategy?: string;
  revenueStreams?: string[];
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