// LLM Provider Types and Interfaces

export type LLMProviderName = 'mistral' | 'openai' | 'gemini';

export interface LLMConfig {
  active: boolean;
  apiKey: string;
  model: string;
  provider: LLMProviderName;
}

export interface LLMProviderConfig {
  mistral: LLMConfig;
  openai: LLMConfig;
  gemini: LLMConfig;
  defaultProvider: LLMProviderName;
}

export interface LLMProvider {
  name: LLMProviderName;
  model: string;
  apiKey: string;
  invoke: (prompt: string, options?: any) => Promise<string>;
  stream: (prompt: string, options?: any) => Promise<AsyncIterable<string>>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RFPExtractedData {
  title?: string;
  summary?: string;
  requirements?: string[];
  timeline?: {
    startDate?: string;
    endDate?: string;
    duration?: string;
  };
  budget?: string;
  scope?: string[];
  stakeholders?: string[];
  deliverables?: string[];
  evaluationCriteria?: string[];
  companyInfo?: {
    name?: string;
    industry?: string;
    location?: string;
  };
  rawContent: string;
}

export interface ProposalData {
  projectTitle: string;
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  methodology: string;
  timeline: {
    startDate: string;
    endDate: string;
    milestones: { phase: string; date: string; description: string }[];
  };
  budget: {
    total: string;
    breakdown: { item: string; cost: string }[];
  };
  team: {
    members: { name: string; role: string; experience: string }[];
  };
  deliverables: string[];
  evaluationCriteria: string[];
  companyInfo: {
    name: string;
    about: string;
    experience: string;
    contact: string;
  };
}
