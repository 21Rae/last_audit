export enum IssuePriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export interface FixRecommendation {
  title: string;
  description: string;
  steps: string[];
}

export interface AuditIssue {
  id: string;
  category: 'CRO' | 'Trust' | 'Speed' | 'SEO' | 'Mobile' | 'Brand';
  title: string;
  problem: string;
  impact: string; // "High Revenue Impact", etc.
  priority: IssuePriority;
  fix: FixRecommendation;
}

export interface CategoryScore {
  name: string;
  score: number; // 0-100
  description: string;
}

export interface AuditReport {
  overallScore: number;
  summary: string;
  categories: CategoryScore[];
  issues: AuditIssue[];
  storeUrl: string;
  timestamp: string;
}

export interface AuditRequest {
  url: string;
  niche?: string;
  targetMarket?: string;
  screenshot?: string; // Base64 string
}