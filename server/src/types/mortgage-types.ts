export interface MortgageConstraint {
  field: string;
  condition: 'greater_than' | 'greater_than_or_equal' | 'less_than' | 'less_than_or_equal' | 'equals';
  value: number | string | boolean;
  unit?: string;
  description?: string;
}

export interface ValidationRule {
  field: string;
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface MortgageRule {
  id: string;
  name: string;
  description: string;
  category: string;
  constraints: MortgageConstraint[];
  validationRules: ValidationRule[];
  documentation?: string;
  examples?: string[];
}

export interface MortgageRulesSchema {
  version: string;
  lender: string;
  program: string;
  effectiveDate: string;
  rules: MortgageRule[];
  metadata: {
    totalRules: number;
    categories: Record<string, number>;
    generatedAt: string;
    sourceDocument: string;
  };
} 