// filepath: c:\Users\mathe\domus-ai\src\types\index.ts

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    text: string;
    index: number;
    logprobs: null | object;
    finish_reason: string;
  }>;
}

export interface PropertyAnalysis {
  averagePrice: number;
  recommendations: string[];
  marketTrends: string;
}

export interface MarketSnapshotQuery {
  location: string;
  timeframe: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface UserQuery {
  query: string;
  type: 'propertyResearch' | 'marketSnapshot' | 'propertyAnalysis' | 'glossary';
}